# ClawdBot Agent Dashboard

Real-time visualization of agent status, tasks, and coordination.

## Features
- **Active Now** — What each agent is currently working on
- **Completed Tasks** — Task log with outcomes
- **Research Board** — Ongoing investigations
- **Proposals** — Skill/tool/upgrade requests
- **System Health** — Agent status, costs, metrics

## Tech Stack
- React + Vite
- Tailwind CSS
- WebSocket for real-time updates

## Agents
- **Lucy** — Netrunner, research, strategy
- **Maki (Makima)** — Main coordinator, execution
- **Albedo** — Support agent
- **Daisy** — Data pipeline, monitoring

## Setup
```bash
npm install
npm run dev
```

## API Endpoints
- `GET /api/agents` — List all agents with status
- `GET /api/tasks` — Task history
- `POST /api/status` — Agent pushes status update
- `WS /ws` — Real-time updates

## Status File Format
Agents update `STATUS.json`:
```json
{
  "agentId": "lucy",
  "current": "Building dashboard",
  "blocked": null,
  "lastUpdated": "2026-02-10T04:00:00Z"
}
```
