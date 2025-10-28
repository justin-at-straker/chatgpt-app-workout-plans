import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Clock,
  RotateCcw,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useOpenAiGlobal } from "../use-openai-global";

// -----------------------------
// Utilities
// -----------------------------

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

// Persistent interval that pauses when tab is hidden to save battery
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useRestTimer(initial) {
  const [state, setState] = useState({ timeLeft: Math.max(0, initial), isRunning: false });

  useInterval(
    function tick() {
      if (!state.isRunning) return;
      setState((prev) => {
        const next = Math.max(0, prev.timeLeft - 1);
        return { timeLeft: next, isRunning: next > 0 };
      });
    },
    state.isRunning ? 1000 : null,
  );

  function update(patch) {
    setState((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
  }

  useEffect(() => {
    // If the initial changes (new plan), reset but don't auto-run
    setState({ timeLeft: Math.max(0, initial), isRunning: false });
  }, [initial]);

  return [state, update];
}

// -----------------------------
// Root App
// -----------------------------

export default function App() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [completed, setCompleted] = useState(new Set());

  // Read workout data from OpenAI's toolOutput (where structuredContent is stored)
  const plan = useOpenAiGlobal("toolOutput");

  // Skeleton while loading tool output
  if (!plan) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-muted/40 to-background rounded-3xl overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="h-8 bg-muted rounded-lg w-48 mb-3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl border p-4 bg-card animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-40 mb-2" />
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                  <div className="w-6 h-6 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const planData = plan ?? { name: "Workout Plan", exercises: [] };

  if (!planData.exercises || planData.exercises.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-background rounded-3xl">
        <div className="text-center p-10">
          <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl border p-3">
            <AlertCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">No workout plan</h2>
          <p className="text-sm text-muted-foreground mt-1">Pass a workout plan to render exercises.</p>
        </div>
      </div>
    );
  }

  function toggleExpanded(i) {
    setExpandedIndex((prev) => (prev === i ? null : i));
  }

  function toggleCompleted(i) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const completedCount = completed.size;
  const totalCount = planData.exercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full h-full bg-gray-50 rounded-3xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        
        {/* Workout Progress Card */}
        <div className="bg-black rounded-2xl px-6 py-5 mb-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-white text-sm font-medium opacity-90">Progress</p>
            <p className="text-white text-lg font-bold mt-1">{completedCount} of {totalCount} exercises</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle cx="40" cy="40" r="36" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.2" />
              <circle 
                cx="40" 
                cy="40" 
                r="36" 
                stroke="#06b6d4" 
                strokeWidth="3" 
                fill="none" 
                strokeDasharray={`${(progress / 100) * 226.2} 226.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="p-6 space-y-4">
          {planData.exercises.map(function render(ex, i) {
            return (
              <li key={`${ex.name}-${i}`}>
                <ExerciseCard
                  index={i}
                  exercise={ex}
                  expanded={expandedIndex === i}
                  completed={completed.has(i)}
                  onToggleExpand={toggleExpanded}
                  onToggleCompleted={toggleCompleted}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// -----------------------------
// Exercise Card
// -----------------------------

function ExerciseCard(props) {
  const { index, exercise, expanded, completed, onToggleCompleted, onToggleExpand } = props;
  const initialRest = exercise.restSeconds ?? 0;
  const [timer, setTimer] = useRestTimer(initialRest);

  const hasRest = initialRest > 0;
  const timePct = useMemo(() => (initialRest > 0 ? clamp((timer.timeLeft / initialRest) * 100) : 0), [timer.timeLeft, initialRest]);

  return (
    <Card className={`transition-all duration-300 overflow-hidden border border-gray-200 rounded-2xl shadow-sm hover:shadow-md ${completed ? "bg-emerald-50" : "bg-white"}`}>
      {/* Header Row */}
      <div className="px-5 py-4 flex items-center gap-3 hover:bg-black/2 cursor-pointer transition-colors" onClick={() => onToggleExpand(index)}>
        {/* Checkbox */}
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggleCompleted(index)}
          onClick={(e) => e.stopPropagation()}
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
          className="flex-shrink-0 w-6 h-6"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-bold tracking-tight truncate ${completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{exercise.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {typeof exercise.sets === "number" && (
              <Badge variant="secondary" className="text-[10px] leading-4 font-semibold bg-rose-100 text-rose-700 border-0">{exercise.sets} sets</Badge>
            )}
            {typeof exercise.reps === "number" && (
              <Badge variant="secondary" className="text-[10px] leading-4 font-semibold bg-cyan-100 text-cyan-700 border-0">{exercise.reps} reps</Badge>
            )}
            {hasRest && (
              <Badge variant="secondary" className="text-[10px] leading-4 font-semibold bg-blue-100 text-blue-700 border-0">{formatTime(initialRest)}</Badge>
            )}
          </div>
        </div>

        {/* Rest Timer Compact */}
        {hasRest && (
          <div className="flex-shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className={`relative w-14 h-14 rounded-xl border flex items-center justify-center ${timer.isRunning ? "bg-primary/5 border-primary/40" : "bg-muted/60"}`}>
              {timer.isRunning && <div className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse" />}
              <span className={`text-sm font-bold ${timer.isRunning ? "text-primary" : "text-muted-foreground"}`}>{formatTime(timer.timeLeft)}</span>
            </div>
            <Button
              size="sm"
              className={`h-14 w-14 p-0 rounded-lg transition-all ${timer.isRunning ? "bg-cyan-500 text-white hover:bg-cyan-600" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
              onClick={() => setTimer({ isRunning: !timer.isRunning })}
              aria-label={timer.isRunning ? "Pause rest timer" : "Start rest timer"}
            >
              {timer.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>
        )}

        {/* Chevron */}
        <div className={`flex-shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}>
          {/* Chevron is now handled by Accordion */}
        </div>
      </div>

      {/* Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="border-t overflow-hidden"
          >
            <div className="px-5 py-5 bg-gray-50 space-y-5 border-t border-gray-100">
              {/* Quick facts */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                {typeof exercise.sets === "number" && (
                  <DetailItem icon={Dumbbell} label="Sets" value={String(exercise.sets)} />
                )}
                {typeof exercise.reps === "number" && (
                  <DetailItem icon={RotateCcw} label="Reps" value={String(exercise.reps)} />
                )}
                {hasRest && (
                  <div>
                    <DetailItem icon={Clock} label="Rest" value={`${exercise.restSeconds}s`} />
                    <div className="mt-3 space-y-2">
                      <div className={`w-full py-4 rounded-xl flex flex-col items-center justify-center border ${timer.isRunning ? "bg-cyan-50 border-cyan-200" : "bg-white border-gray-200"}`}>
                        <span className={`text-4xl font-bold ${timer.isRunning ? "text-cyan-600" : "text-gray-900"}`}>{formatTime(timer.timeLeft)}</span>
                        {timer.isRunning && <span className="text-xs font-semibold text-cyan-600 mt-1">REST TIMER</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-[width] duration-300" style={{ width: `${timePct}%` }} />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 py-2.5"
                          onClick={() => setTimer({ timeLeft: initialRest, isRunning: false })}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" /> Reset
                        </Button>
                        <Button
                          size="sm"
                          className={`flex-1 text-sm font-semibold transition-all py-2.5 ${timer.isRunning ? "bg-cyan-500 text-white hover:bg-cyan-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                          onClick={() => setTimer({ isRunning: !timer.isRunning })}
                        >
                          {timer.isRunning ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" /> Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight */}
              {typeof exercise.weight !== "undefined" && exercise.weight !== null && (
                <section className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Weight</p>
                  <p className="text-base font-bold text-gray-900">{String(exercise.weight)}</p>
                </section>
              )}

              {/* Notes */}
              {exercise.notes && (
                <section className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Notes</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{exercise.notes}</p>
                </section>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </Card>
    );
  }

// -----------------------------
// Small Fact Box
// -----------------------------

function DetailItem(props) {
  const { icon: Icon, label, value } = props;
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-cyan-600" />
        </div>
        <span className="text-xs font-semibold text-gray-600">{label}</span>
      </div>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  );
}
