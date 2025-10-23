# Gymshark Pulse - Workout Plan Widget

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern workout plan visualization tool built with React, Framer Motion, and the Model Context Protocol (MCP). This project showcases how to create rich UI components that integrate with AI assistants to display structured workout data.

## MCP + Apps SDK overview

The Model Context Protocol (MCP) is an open specification for connecting large language model clients to external tools, data, and user interfaces. An MCP server exposes tools that a model can call during a conversation and returns results according to the tool contracts. Those results can include extra metadata—such as inline HTML—that the Apps SDK uses to render rich UI components (widgets) alongside assistant messages.

Within the Apps SDK, MCP keeps the server, model, and UI in sync. By standardizing the wire format, authentication, and metadata, it lets ChatGPT reason about your connector the same way it reasons about built-in tools. A minimal MCP integration for Apps SDK implements three capabilities:

1. **List tools** – Your server advertises the tools it supports, including their JSON Schema input/output contracts and optional annotations (for example, `readOnlyHint`).
2. **Call tools** – When a model selects a tool, it issues a `call_tool` request with arguments that match the user intent. Your server executes the action and returns structured content the model can parse.
3. **Return widgets** – Alongside structured content, return embedded resources in the response metadata so the Apps SDK can render the interface inline in the Apps SDK client (ChatGPT).

Because the protocol is transport agnostic, you can host the server over Server-Sent Events or streaming HTTP—Apps SDK supports both.

## Repository structure

-   `src/` – Source for the workout-plan widget component
-   `src/workout-plan/` – Workout plan UI widget with exercise display, progress tracking, and completion toggle
-   `assets/` – Generated HTML, JS, and CSS bundles after running the build step
-   `gymshark-mcp-server/` – MCP server implemented with the official TypeScript SDK
-   `build-all.mts` – Vite build orchestrator that produces hashed bundles for the widget

## Features

-   💪 **Exercise Display** – Shows exercises with sets, reps, weight, and rest times
-   ✅ **Progress Tracking** – Visual progress bar and completion toggles for each exercise
-   📝 **Detailed Notes** – Support for exercise notes, form cues, and modifications
-   🎨 **Beautiful UI** – Modern design with smooth animations and intuitive interactions
-   🔧 **Easy Integration** – Simple JSON input format for defining workout plans

## Prerequisites

-   Node.js 18+
-   pnpm (recommended) or npm/yarn

## Install dependencies

Clone the repository and install the workspace dependencies:

```bash
pnpm install
```

> Using npm or yarn? Install the root dependencies with your preferred client and adjust the commands below accordingly.

## Build the components gallery

The components are bundled into standalone assets that the MCP servers serve as reusable UI resources.

```bash
pnpm run build
```

This command runs `build-all.mts`, producing versioned `.html`, `.js`, and `.css` files inside `assets/`. The workout plan widget is wrapped with all the CSS it needs so you can host the bundles directly or ship them with your own server.

To iterate on your components locally, you can also launch the Vite dev server:

```bash
pnpm run dev
```

## Serve the static assets

If you want to preview the generated bundles without the MCP servers, start the static file server after running a build:

```bash
pnpm run serve
```

The assets are exposed at [`http://localhost:4444`](http://localhost:4444) with CORS enabled so that local tooling (including MCP inspectors) can fetch them.

## Run the MCP server

Start the Gymshark MCP server:

```bash
cd gymshark-mcp-server
pnpm start
```

The server will listen on `http://localhost:8000` by default. You can change the port using the `PORT` environment variable:

```bash
PORT=3000 pnpm start
```

## Using the Workout Plan Tool

### Input Format

The workout plan tool accepts the following JSON structure:

```json
{
	"name": "Upper Body Day",
	"exercises": [
		{
			"name": "Bench Press",
			"sets": 4,
			"reps": "6-8",
			"weight": "185 lbs",
			"restSeconds": 180,
			"notes": "Keep chest up, explosive concentric"
		},
		{
			"name": "Bent Over Rows",
			"sets": 4,
			"reps": "8-10",
			"weight": "185 lbs",
			"restSeconds": 120
		}
	]
}
```

### Field Details

-   `name` (required): Name of the workout plan
-   `exercises` (required): Array of exercise objects
    -   `name` (required): Exercise name
    -   `sets` (optional): Number of sets
    -   `reps` (optional): Reps per set (e.g., "8-10")
    -   `weight` (optional): Weight or resistance level
    -   `restSeconds` (optional): Rest time between sets in seconds
    -   `notes` (optional): Special instructions or form cues

## Testing in ChatGPT

To add this app to ChatGPT, enable [developer mode](https://platform.openai.com/docs/guides/developer-mode), and add your apps in Settings > Connectors.

To add your local server without deploying it, you can use a tool like [ngrok](https://ngrok.com/) to expose your local server to the internet.

For example, once your MCP server is running, you can run:

```bash
ngrok http 8000
```

You will get a public URL that you can use to add your local server to ChatGPT in Settings > Connectors.

For example: `https://<custom_endpoint>.ngrok-free.app/mcp`

Once you add a connector, you can use it in ChatGPT conversations. Invoke the tool by asking something related to workouts, such as "Create a workout plan for chest day" or "Show me a full body routine".

## Deploy your MCP server

You can use the cloud environment of your choice to deploy your MCP server.

Include this in the environment variables:

```
BASE_URL=https://your-server.com
```

This will be used to generate the HTML for the widgets so that they can serve static assets from this hosted URL.

## Customization

To customize the workout plan widget:

1. Edit `src/workout-plan/workout-plan.jsx` to modify the UI layout and styling
2. Update the tool schema in `gymshark-mcp-server/src/server.ts` to add new fields
3. Modify the MCP server handler to fetch workout data from your backend systems

## Next steps

-   Connect to your workout database or API
-   Add additional widgets for workout history, progress tracking, or meal plans
-   Deploy the MCP server to production

## Contributing

You are welcome to open issues or submit PRs to improve this app.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
