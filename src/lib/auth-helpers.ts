import { z } from "zod";

export const PASSWORD_RULES = [
  { test: (s: string) => s.length >= 12, label: "At least 12 characters" },
  { test: (s: string) => /[A-Z]/.test(s), label: "An uppercase letter" },
  { test: (s: string) => /[a-z]/.test(s), label: "A lowercase letter" },
  { test: (s: string) => /\d/.test(s), label: "A number" },
  { test: (s: string) => /[^A-Za-z0-9]/.test(s), label: "A special character" },
];

export function passwordStrength(p: string) {
  const passed = PASSWORD_RULES.filter((r) => r.test(p)).length;
  const pct = (passed / PASSWORD_RULES.length) * 100;
  let label: "Too weak" | "Weak" | "Fair" | "Strong" | "Excellent" = "Too weak";
  if (pct >= 100) label = "Excellent";
  else if (pct >= 80) label = "Strong";
  else if (pct >= 60) label = "Fair";
  else if (pct >= 40) label = "Weak";
  return { pct, label, passed };
}

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password too long")
  .refine((p) => /[A-Z]/.test(p), "Must include an uppercase letter")
  .refine((p) => /[a-z]/.test(p), "Must include a lowercase letter")
  .refine((p) => /\d/.test(p), "Must include a number")
  .refine((p) => /[^A-Za-z0-9]/.test(p), "Must include a special character");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email")
  .max(255);

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
  remember: z.boolean().optional(),
});

// Generic error so we never reveal whether an account exists
export const GENERIC_AUTH_ERROR = "Invalid email or password.";
