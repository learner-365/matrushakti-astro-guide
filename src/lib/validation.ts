import { z } from "zod";

export const chartInputSchema = z.object({
  name: z.string().trim().min(1, "Enter your full name.").max(120, "Keep the name under 120 characters."),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid birth date."),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Enter a valid 24-hour birth time."),
  timeAccuracy: z.enum(["exact", "approximate"]),
  placeId: z.number().int().positive(),
  nodeMode: z.enum(["mean", "true"]),
});

export type ChartInput = z.infer<typeof chartInputSchema>;

