import React from "react";
import { useNutritionEntries } from "./hooks";
import { NutritionEntry } from "./schemas";
import { AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { clsx } from "clsx";

function EntryCard({ entry }: { entry: NutritionEntry }) {
  const confidenceColors = {
    high: "border-green-200 bg-green-50 text-green-800",
    medium: "border-yellow-200 bg-yellow-50 text-yellow-800",
    low: "border-red-200 bg-red-50 text-red-800",
  };

  const confidenceIcons = {
    high: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    medium: <Info className="w-4 h-4 text-yellow-500" />,
    low: <AlertTriangle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className={clsx("border rounded-lg p-4", confidenceColors[entry.confidence])}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{entry.name}</h3>
          <p className="text-sm">
            {new Date(entry.timestamp).toLocaleString()} • {entry.source}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 font-medium">
            {confidenceIcons[entry.confidence]}
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
  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const allEntries = results
    .flatMap((r) => r.data || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (isLoading && allEntries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-500 font-medium">Fetching data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Unreliable Nutrition Contract</h1>
        </header>

        {isError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg text-red-800">
            <p>Some sources failed to load. The list below might be incomplete.</p>
          </div>
        )}

        <div className="space-y-4">
          {allEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}

          {allEntries.length === 0 && !isLoading && (
            <div className="text-center py-12 text-slate-400">
              No entries found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
