import React from "react";
import { useNutritionEntries } from "./hooks";
import { NutritionEntry } from "./schemas";

function EntryCard({ entry }: { entry: NutritionEntry }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{entry.name}</h3>
          <p className="text-sm">
            {new Date(entry.timestamp).toLocaleString()} • {entry.source}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm mt-3 p-2 rounded">
        <div className="text-center">
          <p className="uppercase text-[10px] font-bold">Protein</p>
          <p className="font-semibold">{entry.macros.protein}g</p>
        </div>
        <div className="text-center">
          <p className="uppercase text-[10px] font-bold">Carbs</p>
          <p className="font-semibold">{entry.macros.carbs}g</p>
        </div>
        <div className="text-center">
          <p className="uppercase text-[10px] font-bold">Fat</p>
          <p className="font-semibold">{entry.macros.fat}g</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const results = useNutritionEntries();

  const allEntries = results
    .flatMap((r) => r.data || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Unreliable Nutrition Contract</h1>
        </header>

        <div className="space-y-4">
          {allEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

