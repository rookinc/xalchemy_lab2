# Graph Viewer

Browser-side graph rendering module.

## Role in the pipeline

This folder is the browser render stage for graph views.

Pipeline:

MySQL graph tables
-> FastAPI `/api/graph-views`
-> FastAPI `/api/graphs/{graph_key}/views/{view_key}`
-> browser fetch
-> in-memory graph build
-> spring solver
-> canvas render

## Source of truth

The database is the source of truth for:

- graphs
- graph_nodes
- graph_edges
- graph_views
- graph_view_nodes
- graph_view_edges
- graph_actions
- graph_view_actions

This folder does not define canonical graph content. It consumes API payloads and renders them.

## Current contents

- `index.html`
  Database-driven graph/view selector and launcher.

- `view.html`
  Generic graph render surface. Accepts `graph` and `view` as URL query parameters.

- `kernel/spring_solver.js`
  Force-directed layout computation.

- `kernel/canvas_renderer.js`
  2D canvas rendering and pointer interaction.

## Current purpose

Validate the graph pipeline end to end:

- DB-backed graph definition
- DB-backed graph/view discovery
- API-backed view retrieval
- browser-side computation
- browser-side rendering

## Current status

Petersen is seeded and renders cleanly.

`g15_core` currently exists as a scaffolded graph/view/action entry, but it does not yet have nodes, edges, or view coordinates.
