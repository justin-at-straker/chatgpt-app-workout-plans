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
    <div className="w-full h-full bg-gradient-to-br from-background to-muted/20 rounded-3xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight">{planData.name || "Workout Plan"}</h1>
            <p className="text-sm text-muted-foreground">{completedCount} of {totalCount} exercises completed</p>
          </div>
        </div>
        <div className="mt-4" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="p-4 space-y-3">
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
    <Card className={`transition-all duration-300 overflow-hidden border-muted ${completed ? "bg-emerald-50/40 border-emerald-200/60" : "hover:border-foreground/15"}`}>
      {/* Header Row */}
      <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 cursor-pointer" onClick={() => onToggleExpand(index)}>
        {/* Checkbox */}
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggleCompleted(index)}
          onClick={(e) => e.stopPropagation()}
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
          className="flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold tracking-tight truncate ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{exercise.name}</h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {typeof exercise.sets === "number" && (
              <Badge variant="secondary" className="text-[10px] leading-4">{exercise.sets} sets</Badge>
            )}
            {typeof exercise.reps === "number" && (
              <Badge variant="secondary" className="text-[10px] leading-4">{exercise.reps} reps</Badge>
            )}
            {hasRest && (
              <Badge variant="secondary" className="text-[10px] leading-4">{formatTime(initialRest)}</Badge>
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
              className={`h-8 w-8 p-0 ${timer.isRunning ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-foreground"}`}
              onClick={() => setTimer({ isRunning: !timer.isRunning })}
              aria-label={timer.isRunning ? "Pause rest timer" : "Start rest timer"}
            >
              {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
            <div className="px-4 py-4 bg-muted/30 space-y-4">
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
                      <div className={`w-full py-3 rounded-lg flex flex-col items-center justify-center border ${timer.isRunning ? "bg-primary/5 border-primary/40" : "bg-card"}`}>
                        <span className={`text-3xl font-bold ${timer.isRunning ? "text-primary" : "text-foreground"}`}>{formatTime(timer.timeLeft)}</span>
                        {timer.isRunning && <span className="text-[10px] font-medium text-primary mt-1">REST TIMER</span>}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${timePct}%` }} />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setTimer({ timeLeft: initialRest, isRunning: false })}
                        >
                          <RotateCcw className="w-3 h-3 mr-1 text-foreground" /> Reset
                        </Button>
                        <Button
                          size="sm"
                          className={`flex-1 text-xs ${timer.isRunning ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-foreground"}`}
                          onClick={() => setTimer({ isRunning: !timer.isRunning })}
                        >
                          {timer.isRunning ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" /> Start
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
                <section className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">WEIGHT</p>
                  <p className="text-sm font-medium">{String(exercise.weight)}</p>
                </section>
              )}

              {/* Notes */}
              {exercise.notes && (
                <section className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">NOTES</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{exercise.notes}</p>
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
    <div className="rounded-lg bg-card border p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
