import { createRoot } from "react-dom/client";
import App from "./workout-plan";

// Initialize OpenAI globals for development
if (typeof window !== "undefined" && !window.openai) {
  window.openai = {
    toolOutput: {
      name: "Chest & Triceps Day",
      exercises: [
        {
          name: "Barbell Bench Press",
          sets: 4,
          reps: "6-8",
          weight: "185 lbs",
          restSeconds: 180,
          notes: "Keep chest up, explosive concentric, controlled eccentric"
        },
        {
          name: "Incline Dumbbell Press",
          sets: 3,
          reps: "8-10",
          weight: "70 lbs",
          restSeconds: 120,
          notes: "30 degree angle, full range of motion"
        },
        {
          name: "Cable Flyes",
          sets: 3,
          reps: "10-12",
          weight: "50 lbs per side",
          restSeconds: 90,
          notes: "Stretch at bottom, squeeze at top"
        },
        {
          name: "Tricep Dips",
          sets: 3,
          reps: "8-12",
          restSeconds: 120,
          notes: "Add weight if needed for progressive overload"
        },
        {
          name: "Rope Pushdown",
          sets: 3,
          reps: "12-15",
          weight: "80 lbs",
          restSeconds: 60,
          notes: "Control the weight, avoid swinging"
        },
        {
          name: "Overhead Tricep Extension",
          sets: 3,
          reps: "10-12",
          weight: "60 lbs",
          restSeconds: 90,
          notes: "Keep elbows stationary, feel the stretch"
        }
      ]
    }
  };
}

createRoot(document.getElementById("workout-plan-root")).render(<App />);

export { App };
export default App;
