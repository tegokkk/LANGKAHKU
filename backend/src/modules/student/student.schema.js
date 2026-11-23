import { z } from "zod";
const short = z.string().trim().max(1000);
const answer = z.strictObject({
  selected: z.array(z.string().max(120)).max(20),
  note: short,
});
export const reflectionSchema = z.strictObject({
  answers: z.array(answer).length(5),
  lastStep: z.number().int().min(0).max(5),
  summary: z.string().max(6000),
  reviewed: z.boolean(),
});
const criteria = z.strictObject({
  interest: z.number().int().min(1).max(5).nullable(),
  ability: z.number().int().min(1).max(5).nullable(),
  cost: z.number().int().min(1).max(5).nullable(),
  support: z.number().int().min(1).max(5).nullable(),
  opportunity: z.number().int().min(1).max(5).nullable(),
});
export const comparisonSchema = z
  .strictObject({
    options: z
      .array(
        z.strictObject({
          id: z.uuid(),
          label: z.string().trim().max(120),
          contentId: z.uuid().nullable().optional(),
          values: criteria,
          reason: short,
        }),
      )
      .min(2)
      .max(3),
    reviewed: z.boolean(),
  })
  .refine(
    (data) =>
      !data.reviewed || data.options.every((option) => option.label.length > 0),
    "Isi nama setiap opsi sebelum mengonfirmasi matriks.",
  );
export const planSchema = z.strictObject({
  primaryGoal: z.string().trim().max(300),
  backupGoal: z.string().trim().max(300),
  reviewed: z.boolean(),
  steps: z
    .array(
      z.strictObject({
        id: z.uuid(),
        title: z.string().trim().min(1).max(200),
        semester: z.enum(["XI-1", "XI-2", "XII-1", "XII-2"]),
        note: short,
        dueDate: z.union([z.iso.date(), z.literal("")]),
        done: z.boolean(),
      }),
    )
    .max(100),
});
export const documentSchemas = {
  reflection: reflectionSchema,
  comparison: comparisonSchema,
  plan: planSchema,
};
export const journalSchema = z.strictObject({
  entryDate: z.iso.date(),
  answers: z.array(z.string().max(2000)).min(1).max(3),
});
