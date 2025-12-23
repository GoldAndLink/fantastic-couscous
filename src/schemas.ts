import { z } from "zod";

export type Confidence = "high" | "medium" | "low";

export interface NutritionEntry {
  id: string;
  source: string;
  name: string;
  timestamp: string;
  serving: {
    amount: number;
    unit: string;
  };
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  calories: number;
  confidence: Confidence;
  issues: string[];
  raw: any;
}

const CALORIE_TOLERANCE = 10;

export function validateCalories(
  protein: number,
  carbs: number,
  fat: number,
  calories: number
): { isValid: boolean; expected: number } {
  const expected = protein * 4 + carbs * 4 + fat * 9;
  const isValid = Math.abs(expected - calories) <= CALORIE_TOLERANCE;
  return { isValid, expected };
}

export const SourceASchema = z.object({
  entryId: z.string(),
  timestamp: z.string().datetime(),
  foodName: z.string(),
  serving: z.object({
    amount: z.number(),
    unit: z.string(),
  }),
  macros: z.object({
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
  }),
  calories_kcal: z.number(),
});

export type SourceA = z.infer<typeof SourceASchema>;

export const SourceBSchema = z.object({
  id: z.string(),
  loggedAt: z.string(),
  name: z.string(),
  servingSize: z.string(),
  macros: z.object({
    protein: z.string().transform((v) => parseFloat(v) || 0),
    carbs: z.string().transform((v) => parseFloat(v) || 0),
    fat: z.string().transform((v) => parseFloat(v) || 0),
  }),
  calories: z.string().nullable().transform((v) => (v ? parseFloat(v) : null)),
  extra: z.record(z.any()).optional(),
});

export type SourceB = z.infer<typeof SourceBSchema>;

export const SourceCSchema = z.object({
  source: z.string(),
  item: z.object({
    label: z.string(),
    brand: z.string(),
  }),
  logged_at: z.string(),
  serving_grams: z.number(),
  nutrients: z.array(
    z.object({
      key: z.string(),
      value: z.number(),
      unit: z.string(),
    })
  ),
});

export type SourceC = z.infer<typeof SourceCSchema>;

export const SourceDSchema = z.object({
  id: z.string(),
  time: z.string(),
  food: z.string(),
  serving: z.object({
    amount: z.number(),
    unit: z.string(),
  }),
  macros: z.object({
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
  }),
  calories_kcal: z.number(),
  macros_basis: z.enum(["per_serving", "per_100g"]).optional().default("per_serving"),
});

export type SourceD = z.infer<typeof SourceDSchema>;

