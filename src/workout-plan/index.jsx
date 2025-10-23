import { createRoot } from "react-dom/client";
import App from "./workout-plan";

// Initialize workout plan data if provided in window
// This allows the data to be set via: window.workoutPlanData = { ... }
// Or if the HTML includes: <script>window.workoutPlanData = { ... }</script>
if (!window.workoutPlanData) {
  window.workoutPlanData = {
    name: "Gymshark Workout Plan",
    exercises: [],
  };
}

createRoot(document.getElementById("workout-plan-root")).render(<App />);

export { App };
export default App;
