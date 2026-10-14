import { z } from "zod";

export const templateIdParamSchema = z.object({
  templateId: z.string().trim().min(1, "Template ID is required"),
});

export type TemplateIdParam = z.infer<
  typeof templateIdParamSchema
>;