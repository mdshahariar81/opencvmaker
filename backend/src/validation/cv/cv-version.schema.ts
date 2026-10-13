import { z } from "zod";

/**
 * CV version route parameter validation.
 */
export const cvVersionParamSchema = z.object({
  version: z.coerce
    .number()
    .int()
    .min(1, "Version must be at least 1"),
});

export type CVVersionParam = z.infer<
  typeof cvVersionParamSchema
>;