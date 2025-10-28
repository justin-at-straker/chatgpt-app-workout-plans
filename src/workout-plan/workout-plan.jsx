// workout-plan.tsx
// Function components only, TypeScript + Tailwind. Uses your palette and window.openai.toolOutput

import React from "react";

// ---- Palette (from your post) ----
const COLORS = {
  apricot: "#FCC5B0",
  antiflash: "#EEEEEE",
  lightBlue: "#B6DFED",
  white: "#FFFFFF",
  teaGreen: "#D5EAB2",
};

// ---- Helpers ----
function secondsToClock(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function totalSets(exercises) {
  return exercises.reduce((t, e) => t + e.sets, 0);
}

function totalRest(exercises) {
  // naive: rest for every set
  return exercises.reduce((t, e) => t + e.restSeconds * e.sets, 0);
}

// ---- Badges / Chips ----
function StatChip(props) {
  const tones = {
    green: `bg-[${COLORS.teaGreen}] text-slate-800`,
    blue: `bg-[${COLORS.lightBlue}] text-slate-800`,
    apricot: `bg-[${COLORS.apricot}] text-slate-800`
  };
  return (
    <div className={`flex items-center gap-2 rounded-2xl px-3 py-1 text-sm ${props.tone ? tones[props.tone] : "bg-slate-100"}`}>
      <span className="font-medium">{props.label}</span>
      <span className="opacity-80">{props.value}</span>
    </div>
  );
}

// ---- Exercise Card ----
function ExerciseCard({ ex, index, total, isComplete, onToggleComplete }) {
  return (
    <div
      className="rounded-3xl p-4 transition-all border"
      style={{
        background: isComplete ? COLORS.teaGreen : COLORS.white,
        borderColor: isComplete ? COLORS.teaGreen : COLORS.antiflash,
        opacity: isComplete ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-400">Exercise {index + 1}/{total}</span>
          </div>
          <h3 className={`text-lg font-semibold ${isComplete ? "line-through text-slate-400" : "text-slate-600"}`}>{ex.name}</h3>
        </div>
        <button
          onClick={() => onToggleComplete(index)}
          className="rounded-full px-5 py-3 text-sm font-medium transition active:scale-95 whitespace-nowrap text-slate-600"
          style={{ background: isComplete ? COLORS.antiflash : COLORS.apricot }}
          title={isComplete ? "Mark not done" : "Mark done"}
        >
          {isComplete ? "✓" : "Done"}
        </button>
      </div>

      {ex.notes && <p className={`text-xs mb-3 ${isComplete ? "text-slate-400" : "text-slate-400"}`}>{ex.notes}</p>}

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">💪 Sets × Reps</div>
          <div className="font-semibold text-slate-800">{ex.sets} × {ex.reps}</div>
        </div>
        {ex.weight && (
          <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-400 mb-1">⚖️ Weight</div>
            <div className="font-semibold text-slate-800">{ex.weight}</div>
          </div>
        )}
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">😤 Rest</div>
          <div className="font-semibold text-slate-800">{secondsToClock(ex.restSeconds)}</div>
        </div>
      </div>
    </div>
  );
}

// ---- Header Card ----
function PlanHeader({ plan, completedCount }) {
  const totalSetsCount = totalSets(plan.exercises);
  const totalRestTime = totalRest(plan.exercises);
  
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-600">{plan.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-600">{completedCount}/{plan.exercises.length}</div>
          <p className="text-xs text-slate-400">exercises</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-3xl p-4" style={{ background: COLORS.lightBlue }}>
          <div className="text-xs text-slate-600 mb-1">💪 Total Sets</div>
          <div className="text-2xl font-bold text-slate-600">{totalSetsCount}</div>
        </div>
        <div className="rounded-3xl p-4" style={{ background: COLORS.teaGreen }}>
          <div className="text-xs text-slate-600 mb-1">⏱️ Est. Time</div>
          <div className="text-2xl font-bold text-slate-600">{secondsToClock(totalRestTime)}</div>
        </div>
        <div className="rounded-3xl p-4" style={{ background: COLORS.apricot }}>
          <div className="text-xs text-slate-600 mb-1">📈 Progress</div>
          <div className="text-2xl font-bold text-slate-600">{Math.round((completedCount / plan.exercises.length) * 100)}%</div>
        </div>
      </div>
    </div>
  );
}

// ---- App (default export) ----
export default function App() {
  const [completedExercises, setCompletedExercises] = React.useState(new Set());

  const plan =
    (typeof window !== "undefined" && window.openai?.toolOutput) || {
      name: "Workout",
      exercises: [],
    };

  const handleToggleComplete = (index) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedExercises(newCompleted);
  };

  return (
    <main className="min-h-screen w-full p-4 sm:p-6" style={{ background: COLORS.antiflash }}>
      <div className="mx-auto max-w-2xl">
        <PlanHeader plan={plan} completedCount={completedExercises.size} />

        {/* Exercises */}
        <section className="grid gap-2 mt-2">
          {plan.exercises.map((ex, i) => (
            <ExerciseCard 
              key={`${ex.name}-${i}`} 
              ex={ex} 
              index={i}
              total={plan.exercises.length}
              isComplete={completedExercises.has(i)}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
