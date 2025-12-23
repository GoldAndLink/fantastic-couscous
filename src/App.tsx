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
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 font-medium">
            <span className="capitalize">{entry.confidence} Confidence</span>
          </div>
          <p className="text-xl font-bold mt-1">{Math.round(entry.calories)} kcal</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm mt-3 bg-white/50 p-2 rounded">
        <div className="text-center">
          <p className="uppercase text-[10px] font-bold">Protein</p>
          <p className="font-semibold">{entry.macros.protein.toFixed(1)}g</p>
        </div>
        <div className="text-center">
          <p className="uppercase text-[10px] font-bold">Carbs</p>
          <p className="font-semibold">{entry.macros.carbs.toFixed(1)}g</p>
        </div>
        <div className="text-center">
          <p className="uppercase text-[10px] font-bold">Fat</p>
          <p className="font-semibold">{entry.macros.fat.toFixed(1)}g</p>
        </div>
      </div>

      <div className="mt-2 text-xs">
        <p className="">Serving: {entry.serving.amount} {entry.serving.unit}</p>
      </div>

      {entry.issues.length > 0 && (
        <div className="mt-3 space-y-1">
          {entry.issues.map((issue, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-red-700">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {issue}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const results = useNutritionEntries();
  const isError = results.some((r) => r.isError);

  const allEntries = results
    .flatMap((r) => r.data || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Unreliable Nutrition Contract</h1>
        </header>

        {isError && (
          <div className="mb-6 p-4 rounded-lg text-red-800">
            <p>Error</p>
          </div>
        )}

        <div className="space-y-4">
          {allEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

