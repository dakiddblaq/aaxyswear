import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

const customerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().min(7).max(40),
  country: z.string().trim().min(1).max(80),
  province: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  street: z.string().trim().min(1).max(200),
  postal: z.string().trim().min(1).max(20),
  apartment: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
});

const orderSchema = z.object({
  productId: z.string().min(1).max(80),
  productName: z.string().min(1).max(160),
  color: z.string().max(60).optional().default(""),
  size: z.string().max(20).optional().default(""),
  quantity: z.number().int().min(1).max(10),
  unitPrice: z.number().int().min(1).max(1_000_000),
  shippingMethod: z.enum(["economy", "express"]),
  shippingFee: z.number().int().min(0).max(10_000),
  total: z.number().int().min(1).max(10_000_000),
  customer: customerSchema,
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    // Require verified email server-side — never trust the client.
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user?.email_confirmed_at) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    // Recompute totals server-side to prevent tampering.
    const subtotal = data.unitPrice * data.quantity;
    const fee = data.shippingMethod === "express" ? 150 : 80;
    const total = subtotal + fee;
    if (total !== data.total || fee !== data.shippingFee) {
      throw new Error("PRICE_MISMATCH");
    }

    const orderRef = "AXYS-" + Date.now().toString(36).toUpperCase();

    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      order_ref: orderRef,
      product_id: data.productId,
      product_name: data.productName,
      color: data.color,
      size: data.size,
      quantity: data.quantity,
      unit_price: data.unitPrice,
      shipping_method: data.shippingMethod,
      shipping_fee: fee,
      total,
      customer: data.customer,
      status: "awaiting_payment",
    });
    if (error) throw new Error(error.message);

    // Log security/order event using admin client (bypasses RLS for write)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("security_events").insert({
        user_id: userId,
        email: (claims as Record<string, unknown>).email as string | undefined,
        event_type: "order_created",
        ip: getRequestIP({ xForwardedFor: true }) ?? null,
        user_agent: getRequestHeader("user-agent") ?? null,
        metadata: { order_ref: orderRef, total },
      });
    } catch {}

    return { orderRef, total };
  });
