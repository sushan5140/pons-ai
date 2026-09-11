# pons-ai

**pons** is a screenshot-intelligence prototype: instead of treating screenshots as passive image storage, it turns them into searchable information, linked entities and useful actions.

The product concept is simple: capture something once, then let the system help you find it, connect it and act on it later.

## Core idea

A screenshot can contain a flight, bill, warranty, product, recipe, restaurant, date, person or place. pons explores a pipeline that converts that unstructured image into structured information:

```
Screenshot
  -> AI vision
  -> entity extraction
  -> connected memory / knowledge graph
  -> search, collections, reminders or actions
```

## What the prototype includes

- Screenshot-oriented product UI
- Natural-language search concept
- Entity extraction and metadata presentation
- Connected-memory / knowledge-graph visualization
- AI action flows for reminders, calendars and collections
- Google sign-in flow
- Supabase integration
- Privacy-focused product surfaces
- Motion-rich interactive product storytelling

> **Project status:** active product prototype. The repository demonstrates the application architecture and experience; some product capabilities shown in marketing sections are forward-looking prototype behavior rather than claims of a fully productionized service.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase
- Tailwind CSS
- Framer Motion
- GSAP
- React Three Fiber / Three.js
- Lenis

## Why I built it

People often save screenshots because they contain something useful, then lose that information inside a camera roll. pons explores whether those screenshots can become a lightweight personal knowledge layer instead: searchable, connected and actionable.

## Repository structure

- `app/` — application routes
- `components/sections/` — product explanation and interaction sections
- `components/ui/` — reusable interface/motion primitives
- `lib/` — application helpers, hooks and service logic

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Privacy note

The interface includes privacy-oriented concepts such as controlled processing and encrypted sync. Treat these as product design goals unless the corresponding implementation is explicitly present and verified in the codebase.
