import { useQueries, useQuery } from "@tanstack/react-query";
import {
  SourceASchema,
  SourceBSchema,
  SourceCSchema,
  SourceDSchema,
  NutritionEntry,
} from "./schemas";
import {
  normalizeSourceA,
  normalizeSourceB,
  normalizeSourceC,
  normalizeSourceD,
} from "./normalization";

const fetchSource = async (source: "a" | "b" | "c" | "d") => {
  const response = await fetch(`/api/entries?source=${source}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch source ${source}`);
  }
  return response.json();
};

export function useNutritionEntries() {
  return useQueries({
    queries: [
      {
        queryKey: ["entries", "a"],
        queryFn: () => fetchSource("a"),
        select: (data: any) => normalizeSourceA(SourceASchema.array().parse(data)),
      },
      {
        queryKey: ["entries", "b"],
        queryFn: () => fetchSource("b"),
        select: (data: any) => normalizeSourceB(SourceBSchema.array().parse(data)),
      },
      {
        queryKey: ["entries", "c"],
        queryFn: () => fetchSource("c"),
        select: (data: any) => normalizeSourceC(SourceCSchema.array().parse(data)),
      },
      {
        queryKey: ["entries", "d"],
        queryFn: () => fetchSource("d"),
        select: (data: any) => normalizeSourceD(SourceDSchema.array().parse(data)),
      },
    ],
  });
}

