import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Dumbbell, Clock, RotateCcw, AlertCircle } from "lucide-react";
import { useOpenAiGlobal } from "../use-openai-global";

export function App() {
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  
  // Read workout data from OpenAI's toolOutput (where structuredContent is stored)
  const plan = useOpenAiGlobal("toolOutput");

  // Show skeleton loading state while waiting for tool response
  if (!plan) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden flex flex-col">
        {/* Header skeleton */}
        <div className="px-6 pt-6 pb-4 border-b border-black/10">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden animate-pulse" />
        </div>

        {/* Exercises skeleton */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl border border-black/10 p-4 bg-white animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="w-6 h-6 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no exercises, show empty state
  const planData = plan ?? {
    name: "Gymshark Workout Plan",
    exercises: [],
  };

  if (!planData.exercises || planData.exercises.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-3xl">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">No Workout Plan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Pass a workout plan to render exercises
          </p>
        </div>
      </div>
    );
  }

  const toggleExercise = (index) => {
    setExpandedExercise(expandedExercise === index ? null : index);
  };

  const toggleComplete = (index) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedExercises(newCompleted);
  };

  const completedCount = completedExercises.size;
  const totalCount = planData.exercises.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-black/10">
        <h1 className="text-2xl font-bold text-black mb-1 tracking-tight">
          {planData.name || "Workout Plan"}
        </h1>
        <p className="text-sm text-black/50">
          {completedCount} of {totalCount} exercises completed
        </p>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-black/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-black to-black/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          />
        </div>
      </div>

      {/* Exercises List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <AnimatePresence initial={false}>
            {planData.exercises.map((exercise, index) => (
              <ExerciseCard
                key={`${exercise.name}-${index}`}
                exercise={exercise}
                index={index}
                isExpanded={expandedExercise === index}
                isCompleted={completedExercises.has(index)}
                onToggleExpand={() => toggleExercise(index)}
                onToggleComplete={() => toggleComplete(index)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  isExpanded,
  isCompleted,
  onToggleExpand,
  onToggleComplete,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", bounce: 0.16, duration: 0.4 }}
    >
      <div
        className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
          isCompleted
            ? "bg-green-50/50 border-green-200/60"
            : "bg-white border-black/10 hover:border-black/20"
        }`}
      >
        {/* Header */}
        <motion.div
          onClick={onToggleExpand}
          className="px-4 py-3.5 flex items-center gap-3"
        >
          {/* Checkbox */}
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              isCompleted
                ? "bg-green-500 border-green-500"
                : "border-black/20 hover:border-black/40"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
          >
            {isCompleted && (
              <motion.svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </motion.svg>
            )}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-semibold tracking-tight truncate transition-all ${
                isCompleted ? "text-black/50 line-through" : "text-black"
              }`}
            >
              {exercise.name}
            </h3>
            <div className="flex gap-4 mt-1">
              {exercise.sets && (
                <span className="text-xs text-black/50 font-medium">
                  {exercise.sets} sets
                </span>
              )}
              {exercise.reps && (
                <span className="text-xs text-black/50 font-medium">
                  {exercise.reps} reps
                </span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.3 }}
            className="flex-shrink-0 text-black/40"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Details */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.24, duration: 0.35 }}
              className="overflow-hidden border-t border-black/10"
            >
              <div className="px-4 py-3.5 bg-black/2.5 space-y-3">
                {/* Sets, Reps, Rest */}
                <div className="grid grid-cols-3 gap-3">
                  {exercise.sets && (
                    <DetailItem
                      icon={Dumbbell}
                      label="Sets"
                      value={exercise.sets}
                    />
                  )}
                  {exercise.reps && (
                    <DetailItem
                      icon={RotateCcw}
                      label="Reps"
                      value={exercise.reps}
                    />
                  )}
                  {exercise.restSeconds && (
                    <DetailItem
                      icon={Clock}
                      label="Rest"
                      value={`${exercise.restSeconds}s`}
                    />
                  )}
                </div>

                {/* Weight info */}
                {exercise.weight && (
                  <div className="pt-2 border-t border-black/5">
                    <p className="text-xs text-black/50 font-semibold mb-1">
                      WEIGHT
                    </p>
                    <p className="text-sm font-medium text-black">
                      {exercise.weight}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {exercise.notes && (
                  <div className="pt-2 border-t border-black/5">
                    <p className="text-xs text-black/50 font-semibold mb-1">
                      NOTES
                    </p>
                    <p className="text-sm text-black/70 leading-relaxed">
                      {exercise.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-white border border-black/5 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-black/40" />
        <span className="text-xs font-semibold text-black/50">{label}</span>
      </div>
      <p className="text-sm font-bold text-black">{value}</p>
    </div>
  );
}

export default App;
