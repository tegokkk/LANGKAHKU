import { z } from "zod";
export const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(40)
  .regex(
    /^[a-z0-9][a-z0-9._-]*$/,
    "Gunakan huruf, angka, titik, garis bawah, atau tanda hubung.",
  );
export const password = z
  .string()
  .min(12, "Kata sandi minimal 12 karakter.")
  .max(128);
export const registerSchema = z.strictObject({
  username,
  password,
  nickname: z.string().trim().min(2).max(40),
  grade: z.enum(["XI", "XII"]),
  semester: z.coerce.number().int().min(1).max(2),
  schoolCode: z.uuid(),
  ageBand: z.enum(["under18", "adult"]),
  consent: z.literal(true),
  noticeVersion: z.literal("2026-11-v1"),
});
export const loginSchema = z.strictObject({
  username,
  password: z.string().min(1).max(128),
  audience: z.enum(["siswa", "staf"]).optional(),
});
export const recoverySchema = z.strictObject({
  username,
  code: z.string().min(1).max(100),
  password,
});
