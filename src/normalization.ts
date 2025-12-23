import {
  NutritionEntry,
  SourceA,
  SourceB,
  SourceC,
  SourceD,
  validateCalories,
  Confidence,
} from "./schemas";

function createEntry(
  base: Omit<NutritionEntry, "confidence" | "issues">,
  additionalIssues: string[] = []
): NutritionEntry {
  const issues = [...additionalIssues];
  let confidence: Confidence = "high";

  // Check for negative values
  if (base.macros.protein < 0 || base.macros.carbs < 0 || base.macros.fat < 0 || base.calories < 0) {
    issues.push("Negative values detected (Correction entry)");
    confidence = "medium";
  }

  // Validate calories
  const { isValid, expected } = validateCalories(
    base.macros.protein,
    base.macros.carbs,
    base.macros.fat,
    base.calories
  );

  if (!isValid) {
    issues.push(`Calorie mismatch: expected ~${Math.round(expected)} kcal, got ${base.calories} kcal`);
    confidence = "low";
  }

  return {
    ...base,
    confidence,
    issues,
  };
}

export function normalizeSourceA(data: SourceA[]): NutritionEntry[] {
  return data.map((item) =>
    createEntry({
      id: `a-${item.entryId}`,
      source: "Source A",
      name: item.foodName,
      timestamp: item.timestamp,
      serving: item.serving,
      macros: {
        protein: item.macros.protein_g,
        carbs: item.macros.carbs_g,
        fat: item.macros.fat_g,
      },
      calories: item.calories_kcal,
      raw: item,
    })
  );
}

export function normalizeSourceB(data: SourceB[]): NutritionEntry[] {
  return data.map((item) => {
    const issues: string[] = [];
    
    // Parse serving size if it's "X unit"
    const servingMatch = item.servingSize.match(/^(\d+(\.\d+)?)\s*(.*)$/);
    const amount = servingMatch ? parseFloat(servingMatch[1]) : 0;
    const unit = servingMatch ? servingMatch[3] : item.servingSize;

    // Handle missing calories
    let calories = item.calories;
    if (calories === null) {
      issues.push("Calories missing from source, calculated from macros");
      calories = item.macros.protein * 4 + item.macros.carbs * 4 + item.macros.fat * 9;
    }

    return createEntry({
      id: `b-${item.id}`,
      source: "Source B",
      name: item.name,
      timestamp: item.loggedAt,
      serving: { amount, unit },
      macros: {
        protein: item.macros.protein,
        carbs: item.macros.carbs,
        fat: item.macros.fat,
      },
      calories,
      raw: item,
    }, issues);
  });
}

export function normalizeSourceC(data: SourceC[]): NutritionEntry[] {
  return data.map((item) => {
    const issues: string[] = [];
    const nutrients: Record<string, { value: number; count: number }> = {};

    item.nutrients.forEach((n) => {
      if (!nutrients[n.key]) {
        nutrients[n.key] = { value: 0, count: 0 };
      }
      nutrients[n.key].value += n.value;
      nutrients[n.key].count += 1;
      if (nutrients[n.key].count > 1) {
        issues.push(`Duplicate nutrient entry for ${n.key}: summed values`);
      }
    });

    const protein = nutrients["protein"]?.value || 0;
    const carbs = nutrients["carbohydrate"]?.value || 0;
    const fat = nutrients["fat"]?.value || 0;
    const calories = nutrients["energy"]?.value || 0;

    return createEntry({
      id: `c-${item.logged_at}-${item.item.label}`, // No unique ID in source C
      source: "Source C",
      name: `${item.item.brand} ${item.item.label}`,
      timestamp: item.logged_at,
      serving: { amount: item.serving_grams, unit: "g" },
      macros: { protein, carbs, fat },
      calories,
      raw: item,
    }, issues);
  });
}

export function normalizeSourceD(data: SourceD[]): NutritionEntry[] {
  return data.map((item) => {
    const issues: string[] = [];
    let protein = item.macros.protein_g;
    let carbs = item.macros.carbs_g;
    let fat = item.macros.fat_g;
    let calories = item.calories_kcal;

    if (item.macros_basis === "per_100g") {
      const factor = item.serving.amount / 100;
      protein *= factor;
      carbs *= factor;
      fat *= factor;
      calories *= factor;
      issues.push("Values adjusted from per-100g basis to serving size");
    }

    return createEntry({
      id: `d-${item.id}`,
      source: "Source D",
      name: item.food,
      timestamp: item.time,
      serving: item.serving,
      macros: { protein, carbs, fat },
      calories,
      raw: item,
    }, issues);
  });
}
