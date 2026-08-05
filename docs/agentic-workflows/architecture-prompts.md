# Agentic Workflows: Architecture & Boilerplate Prompts

This document stores the exact prompt templates and instructions used to generate boilerplate code, backend controllers, models, and frontend component architectures across the project.

---

## 1. Initial Monorepo Architecture Scaffold Prompt

```text
Create an ERP Monorepo with:
- backend/: CodeIgniter 4 REST API (app/, public/, system/, tests/, writable/, .env.example, composer.json, spark)
- frontend/: Next.js with Tailwind CSS (src/, public/, .env.local.example, next.config.js, package.json, tailwind.config.js)
- docs/: Agentic workflows (claude-code-logs.md, architecture-prompts.md), api-specs/, database-schema.md
- Root: .editorconfig, .gitignore, README.md
```

---

## 2. Backend Controller Generation Prompt Template

```text
Generate a CodeIgniter 4 RESTful Controller extending `CodeIgniter\RESTful\ResourceController` for entity [EntityName].
Implement standard JSON response formats for:
- index()
- show(id)
- create()
- update(id)
- delete(id)
Include input validation rules, error handling, and standard HTTP status code responses (200, 201, 400, 404, 500).
```

---

## 3. Frontend Dashboard Component Prompt Template

```text
Generate a responsive Next.js App Router dashboard view using Tailwind CSS and Lucide React icons.
Include:
- Metric summary cards (Total Revenue, Daily Sales, Items Sold, Inventory Alerts)
- Recent activity table with status badges
- Quick action buttons (New Sale, Add Stock, Generate Report)
- Dark-mode aesthetic with clean borders and smooth transitions.
```
