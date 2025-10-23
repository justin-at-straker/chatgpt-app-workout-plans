# Gymshark MCP Server (Node)

This directory contains a Model Context Protocol (MCP) server implemented with the official TypeScript SDK. The server exposes the Gymshark workout plan widget so you can create and display workout routines in ChatGPT developer mode.

## Prerequisites

-   Node.js 18+
-   pnpm, npm, or yarn for dependency management

## Install dependencies

```bash
pnpm install
```

If you prefer npm or yarn, adjust the command accordingly.

## Run the server

```bash
pnpm start
```

The script bootstraps the server over SSE (Server-Sent Events), which makes it compatible with the MCP Inspector as well as ChatGPT connectors. Once running, you can list the tools and invoke the workout plan tool.

## Tool Responses

The workout-plan tool responds with:

-   `content`: a text confirmation message
-   `structuredContent`: a JSON payload containing the workout plan data with exercises, sets, reps, and rest times
-   `_meta.openai/outputTemplate`: metadata that binds the response to the matching Skybridge widget shell

## Example Usage

Pass a workout plan JSON structure:

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
		}
	]
}
```

Feel free to extend the handlers with real data sources, authentication, and persistence.
