# Unreliable Nutrition Contract - Submission

## Assumptions
- Calorie Calculation: I assumed a standard conversion of 4 kcal/g for protein and carbs, and 9 kcal/g for fat. I allowed a tolerance of 10 kcal before flagging a discrepancy.
- Source C Uniqueness: Since Source C lacks unique IDs, I assumed that a combination of `timestamp` and `item.label` is unique enough for client-side keys.
- Correction Entries: I assumed negative values (e.g Source A) are intentional "correction entries", but I flagged them to inform the user.
- Units: I assumed that if a unit is missing but the context implies grams (e.g., protein_g), it should be treated as grams.

## Decisions & Trade-offs
- Schema-First with Zod: I chose Zod for the parsing layer to handle the "drifting" contract. Each source has its own schema that maps to a unified internal model. This allows us to catch structure changes early.
- Confidence Scoring: Instead of throwing away "bad" data, I introduced a confidence level (`high`, `medium`, `low`). This allows the UI to "be honest about uncertainty" without crashing or hiding data.
- Normalisation in the Hook Layer: Normalization happens during the select phase of TanStack Query. This keeps the UI components clean and ensures they only ever see the normalized `NutritionEntry` shape.
- Handling Basis Discrepancies: For Source D (`per_100g`), I calculated the actual macros for the serving size. I chose to show the adjusted values but flagged them so the user knows they weren't the raw values.
- Duplicate Nutrients: For Source C's duplicate protein entries, I chose to sum them. This is a gamble; in a real app, I'd likely flag this as a critical error or ask the user for clarification.

## What I Didn’t Build (and why)
- Detailed Unit Conversion: I didn't build a robust unit conversion engine (e.g., ml to g, tbsp to g). Given the 2-hour timebox, I focused on structural normalization and discrepancy detection.
- Persistent Error Boundaries: While I handle fetch errors per-source, I didn't implement complex recovery or retry logic beyond the TanStack Query defaults.
- User Corrections: I didn't build a UI for users to "override" or "fix" the flagged discrepancies, as the focus was on data ingestion and honesty.

## What I’d Do Next
- Unit Normalization Library: Integrate a library like to handle complex unit conversions consistently across all sources.
- Refine Confidence Logic: Introduce more granular rules for confidence (e.g., checking if sugar > total carbs).
- Source-Specific Metadata: Allow the UI to drill down into the `raw` payload for advanced users who want to see exactly why a flag was raised.
- Server-Side Aggregation: Move the normalization logic to a BFF (Backend-for-Frontend) if the number of sources grows, to reduce client-side bundle size and processing.
