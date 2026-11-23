import { z } from "zod";
const source = z.strictObject({
  title: z.string().trim().min(2).max(160),
  url: z.url().refine((value) => {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  }, "Sumber harus HTTPS tanpa kredensial."),
});
export const contentSchema = z
  .strictObject({
    title: z.string().trim().min(3).max(180),
    slug: z
      .string()
      .min(3)
      .max(180)
      .regex(/^[a-z0-9-]+$/),
    kind: z.enum(["pathway", "profession", "story", "worksheet"]),
    category: z.enum(["Kuliah", "Kerja", "Kuliah + Kerja", "Usaha"]),
    riasec: z.enum(["R", "I", "A", "S", "E", "C"]).nullable(),
    summary: z.string().trim().min(10).max(1000),
    body: z.string().trim().min(10).max(15000),
    status: z.enum(["draft", "review", "published", "archived"]),
    sources: z.array(source).max(20),
    reviewer: z.string().trim().max(100).nullable(),
    reviewedAt: z.iso.date().nullable(),
    validUntil: z.iso.date().nullable(),
    demo: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (
      v.status === "published" &&
      (!v.sources.length || !v.reviewer || !v.reviewedAt || !v.validUntil)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Konten terbit wajib memiliki sumber, peninjau, tanggal tinjau, dan batas berlaku.",
      });
    if (v.reviewedAt && v.validUntil && v.validUntil < v.reviewedAt)
      ctx.addIssue({
        code: "custom",
        message: "Batas berlaku harus sesudah tanggal tinjau.",
      });
  });
