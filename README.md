# Automated CI/CD Deployment System

A lightweight, beginner-friendly student DevOps engineering web application built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It demonstrates the structure and operational workflow of a modern Continuous Integration and Continuous Deployment (CI/CD) dashboard without requiring paid APIs or an external database.

> **Demonstration Data Notice:** All pipeline stages, build history records, deployment environments, and Docker image details displayed in this application are simulated demonstration data. They are clearly labeled in the UI and do not connect to a live CI/CD server or production cluster.

## Features

- **Project Home Page:** Explains the goals of the Automated CI/CD Deployment System and walks through the 5-stage engineering workflow.
- **One-Click Quick Demo Scenarios:** Launch common workflows directly from the Dashboard (Deploy to Production, Simulate Failed Test, Deploy to Staging, or Reset Demo Data) with browser `localStorage` persistence.
- **Configurable 5-Stage Pipeline Status:** Visualizes **Code Commit**, **Automated Testing**, **Docker Build**, **Docker Image Push**, and **Deployment** with automatic active-stage log following, custom branch/environment selection, failure injection at Testing, Docker Build, or Deployment, and copyable stage logs.
- **Build History Table & Trend Chart:** Interactive duration bar chart paired with a searchable, filterable, and sortable build table supporting CSV export and one-click build re-runs.
- **Deployment Status & Controls:** Displays Production, Staging, and Development release versions with interactive replica scaling (`1–5`), simulated `/healthz` readiness checks, Staging promotion, and Production rollback.
- **Docker Image & CI/CD Workflow Reference:** Presents image metadata, layer size breakdown, copyable `docker pull` command, multi-stage `Dockerfile`, and a starter 5-stage GitHub Actions YAML workflow.
- **Responsive Layout:** Desktop sidebar navigation paired with a mobile slide-over drawer and responsive data tables.

## Project Structure

```text
├── index.html                      # Entry HTML and font configuration
├── package.json                    # Scripts and dependencies
├── package-lock.json               # Locked npm dependency tree
├── vite.config.ts                  # Vite build configuration
└── src/
    ├── main.tsx                    # React mount point
    ├── index.css                   # Tailwind CSS setup and typography
    ├── App.tsx                     # Top-level state and view orchestration
    ├── types/
    │   └── cicd.ts                 # TypeScript interfaces for pipeline data
    ├── data/
    │   └── demoData.ts             # Clearly labeled demonstration records
    └── components/
        ├── Sidebar.tsx             # Responsive navigation sidebar & mobile drawer
        ├── TopBar.tsx              # Header breadcrumb and Run Demo Pipeline action
        ├── DemoNotice.tsx          # Demonstration data disclosure banner
        ├── HomeView.tsx            # Project overview and architecture guide
        ├── PipelineSection.tsx     # 5-stage pipeline visualization and log viewer
        ├── BuildHistoryTable.tsx   # Searchable, filterable, sortable build table
        ├── DeploymentSection.tsx   # Environment deployment status and rollout actions
        └── DockerImageSection.tsx  # Docker image metadata, layers, and Dockerfile view
```

## Prerequisites

- **Node.js** 18.x or newer (Node.js 20 LTS recommended)
- **npm** 9.x or newer

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` in your browser.

3. **Run TypeScript validation**

   ```bash
   npm run lint
   ```

4. **Create a production build**

   ```bash
   npm run build
   ```

   The optimized static output is written to the `dist/` directory.

5. **Preview the production build locally**

   ```bash
   npm run preview
   ```

## Extending Beyond Demonstration Data

When deploying this project into a real DevOps environment, replace the static arrays in `src/data/demoData.ts` with authenticated backend endpoints that read from your CI/CD provider (for example, GitHub Actions workflow runs, Docker Registry v2 manifests, or Kubernetes deployment status).
