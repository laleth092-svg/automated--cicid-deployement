import type {
  BuildRecord,
  DeploymentEnvironment,
  DockerImageInfo,
  PipelineRunConfig,
  PipelineStage,
} from '../types/cicd';

/**
 * All records in this file are static demonstration data for a student
 * DevOps engineering project. They do not connect to a live CI/CD server,
 * container registry, or cloud deployment cluster.
 */

export const DEFAULT_RUN_CONFIG: PipelineRunConfig = {
  branch: 'main',
  targetEnvironment: 'Production',
  commitMessage: 'Release automated build with updated UI and tests',
  failureScenario: 'none',
};

export const SAMPLE_BRANCHES = [
  'main',
  'staging',
  'feature/container-health',
  'hotfix/nginx-headers',
] as const;

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'code-commit',
    order: 1,
    name: 'Code Commit',
    shortDescription: 'Fetch latest repository revision and verify commit metadata.',
    status: 'passed',
    duration: '6s',
    startedAt: '2026-11-24 14:20:04 UTC',
    command: 'git checkout main && git rev-parse --short HEAD',
    logs: [
      '[Demo Log] Trigger: push event on branch "main"',
      '[Demo Log] Checking out commit 9a4f2c1 ("Refine responsive layout and unit tests")',
      '[Demo Log] Verified commit signature and repository workspace cleanly initialized.',
    ],
  },
  {
    id: 'automated-testing',
    order: 2,
    name: 'Automated Testing',
    shortDescription: 'Run linter, TypeScript checks, and automated unit test suite.',
    status: 'passed',
    duration: '42s',
    startedAt: '2026-11-24 14:20:10 UTC',
    command: 'npm ci && npm run lint && npm test -- --run',
    logs: [
      '[Demo Log] Installing dependencies from package-lock.json...',
      '[Demo Log] TypeScript type check completed with 0 errors.',
      '[Demo Log] Test Files: 6 passed (6) | Tests: 38 passed (38) in 3.4s.',
    ],
  },
  {
    id: 'docker-build',
    order: 3,
    name: 'Docker Build',
    shortDescription: 'Compile production bundle and assemble multi-stage container image.',
    status: 'passed',
    duration: '51s',
    startedAt: '2026-11-24 14:20:52 UTC',
    command: 'docker build -t ghcr.io/devops-student/cicd-web-app:v1.4.2-demo .',
    logs: [
      '[Demo Log] Stage 1/2 (node:20-alpine): running "npm run build" -> dist/ (412 kB)',
      '[Demo Log] Stage 2/2 (nginx:1.27-alpine): copying static assets to /usr/share/nginx/html',
      '[Demo Log] Built image sha256:8f4c19d7e3a204b1 (42.8 MB compressed).',
    ],
  },
  {
    id: 'docker-image-push',
    order: 4,
    name: 'Docker Image Push',
    shortDescription: 'Authenticate and push versioned image layers to container registry.',
    status: 'passed',
    duration: '24s',
    startedAt: '2026-11-24 14:21:43 UTC',
    command: 'docker push ghcr.io/devops-student/cicd-web-app:v1.4.2-demo',
    logs: [
      '[Demo Log] Authenticated to demo registry ghcr.io/devops-student',
      '[Demo Log] Layer cache hit on base Alpine & Nginx layers (3 of 5 cached).',
      '[Demo Log] Pushed digest sha256:8f4c19d7e3a204b1c5d6e7f890123456b29e.',
    ],
  },
  {
    id: 'deployment',
    order: 5,
    name: 'Deployment',
    shortDescription: 'Roll out container image to target environment and verify health check.',
    status: 'passed',
    duration: '15s',
    startedAt: '2026-11-24 14:22:07 UTC',
    command: 'kubectl set image deployment/cicd-web-app web=ghcr.io/devops-student/cicd-web-app:v1.4.2-demo',
    logs: [
      '[Demo Log] Rolling update started: maxUnavailable=0, maxSurge=1',
      '[Demo Log] Readiness probe /healthz returned HTTP 200 OK on 3/3 replicas.',
      '[Demo Log] Deployment v1.4.2-demo complete with zero downtime.',
    ],
  },
];

export const INITIAL_BUILD_HISTORY: BuildRecord[] = [
  {
    id: 'build-142',
    buildNumber: 142,
    date: '2026-11-24 14:22 UTC',
    branch: 'main',
    targetEnvironment: 'Production',
    commitSha: '9a4f2c1',
    commitMessage: 'Refine responsive layout and unit tests',
    author: 'A. Patel',
    status: 'Passed',
    duration: '2m 18s',
    durationSeconds: 138,
    imageTag: 'v1.4.2-demo',
    stageSummary: '5 of 5 stages passed · Deployed to Production',
  },
  {
    id: 'build-141',
    buildNumber: 141,
    date: '2026-11-24 11:05 UTC',
    branch: 'main',
    targetEnvironment: 'Production',
    commitSha: '7d21e8b',
    commitMessage: 'Add Nginx gzip compression config to Dockerfile',
    author: 'M. Chen',
    status: 'Passed',
    duration: '2m 24s',
    durationSeconds: 144,
    imageTag: 'v1.4.1-demo',
    stageSummary: '5 of 5 stages passed · Deployed to Production',
  },
  {
    id: 'build-140',
    buildNumber: 140,
    date: '2026-11-23 19:47 UTC',
    branch: 'feature/health-endpoint',
    targetEnvironment: 'Staging',
    commitSha: '3b8c0a4',
    commitMessage: 'Add readiness check route for container probe',
    author: 'S. Rivera',
    status: 'Failed',
    duration: '0m 54s',
    durationSeconds: 54,
    imageTag: '—',
    stageSummary: 'Stopped at Automated Testing (2 unit tests failed)',
  },
  {
    id: 'build-139',
    buildNumber: 139,
    date: '2026-11-23 16:12 UTC',
    branch: 'main',
    targetEnvironment: 'Production',
    commitSha: 'c45e91f',
    commitMessage: 'Switch Dockerfile to multi-stage node:20-alpine build',
    author: 'A. Patel',
    status: 'Passed',
    duration: '2m 41s',
    durationSeconds: 161,
    imageTag: 'v1.4.0-demo',
    stageSummary: '5 of 5 stages passed · Deployed to Production',
  },
  {
    id: 'build-138',
    buildNumber: 138,
    date: '2026-11-22 21:30 UTC',
    branch: 'staging',
    targetEnvironment: 'Staging',
    commitSha: 'e12b74d',
    commitMessage: 'Pin Vite and TypeScript versions in package-lock.json',
    author: 'J. Okafor',
    status: 'Passed',
    duration: '2m 09s',
    durationSeconds: 129,
    imageTag: 'v1.3.9-demo',
    stageSummary: '5 of 5 stages passed · Deployed to Staging',
  },
  {
    id: 'build-137',
    buildNumber: 137,
    date: '2026-11-22 13:18 UTC',
    branch: 'fix/env-vars',
    targetEnvironment: 'Development',
    commitSha: '5f90a22',
    commitMessage: 'Validate runtime configuration defaults on startup',
    author: 'M. Chen',
    status: 'Failed',
    duration: '1m 38s',
    durationSeconds: 98,
    imageTag: '—',
    stageSummary: 'Stopped at Docker Build (missing nginx.conf copy path)',
  },
  {
    id: 'build-136',
    buildNumber: 136,
    date: '2026-11-21 18:04 UTC',
    branch: 'main',
    targetEnvironment: 'Production',
    commitSha: '1a6d33e',
    commitMessage: 'Document GitHub Actions workflow and setup steps',
    author: 'S. Rivera',
    status: 'Passed',
    duration: '2m 11s',
    durationSeconds: 131,
    imageTag: 'v1.3.8-demo',
    stageSummary: '5 of 5 stages passed · Deployed to Production',
  },
];

export const INITIAL_DEPLOYMENTS: DeploymentEnvironment[] = [
  {
    id: 'env-production',
    name: 'Production',
    version: 'v1.4.2-demo',
    imageTag: 'ghcr.io/devops-student/cicd-web-app:v1.4.2-demo',
    commitSha: '9a4f2c1',
    status: 'Healthy',
    deployedAt: '2026-11-24 14:22 UTC',
    replicasReady: 3,
    replicasDesired: 3,
    endpointUrl: 'https://demo-prod.cicd-student.example',
    strategy: 'Rolling Update (0 downtime)',
    uptimePercent: '99.94%',
    lastHealthCheck: 'HTTP 200 OK · 24ms (sample)',
  },
  {
    id: 'env-staging',
    name: 'Staging',
    version: 'v1.4.3-rc1-demo',
    imageTag: 'ghcr.io/devops-student/cicd-web-app:v1.4.3-rc1-demo',
    commitSha: '4e81d0a',
    status: 'Healthy',
    deployedAt: '2026-11-24 15:05 UTC',
    replicasReady: 2,
    replicasDesired: 2,
    endpointUrl: 'https://demo-staging.cicd-student.example',
    strategy: 'Rolling Update',
    uptimePercent: '99.80%',
    lastHealthCheck: 'HTTP 200 OK · 31ms (sample)',
  },
  {
    id: 'env-development',
    name: 'Development',
    version: 'v1.4.3-dev-demo',
    imageTag: 'ghcr.io/devops-student/cicd-web-app:v1.4.3-dev-demo',
    commitSha: '2c7b19f',
    status: 'Healthy',
    deployedAt: '2026-11-24 15:40 UTC',
    replicasReady: 1,
    replicasDesired: 1,
    endpointUrl: 'https://demo-dev.cicd-student.example',
    strategy: 'Recreate on Commit',
    uptimePercent: '98.50%',
    lastHealthCheck: 'HTTP 200 OK · 42ms (sample)',
  },
];

export const INITIAL_DOCKER_IMAGE: DockerImageInfo = {
  repository: 'ghcr.io/devops-student/cicd-web-app',
  tag: 'v1.4.2-demo',
  digest: 'sha256:8f4c19d7e3a204b1c5d6e7f890123456b29e',
  architecture: 'linux/amd64',
  os: 'Alpine Linux 3.20',
  baseImage: 'nginx:1.27-alpine (built from node:20-alpine)',
  totalSizeMb: 42.8,
  pushedAt: '2026-11-24 14:22 UTC',
  registry: 'GitHub Container Registry (Sample)',
  buildNumber: 142,
  vulnerabilities: {
    critical: 0,
    high: 0,
    medium: 1,
    low: 3,
  },
  layers: [
    {
      id: 'layer-1',
      instruction: 'FROM nginx:1.27-alpine (base OS & runtime)',
      sizeMb: 28.4,
      cached: true,
    },
    {
      id: 'layer-2',
      instruction: 'RUN apk add --no-cache curl tzdata',
      sizeMb: 7.2,
      cached: true,
    },
    {
      id: 'layer-3',
      instruction: 'COPY docker/nginx.conf /etc/nginx/conf.d/default.conf',
      sizeMb: 0.4,
      cached: true,
    },
    {
      id: 'layer-4',
      instruction: 'COPY --from=builder /app/dist /usr/share/nginx/html',
      sizeMb: 6.5,
      cached: false,
    },
    {
      id: 'layer-5',
      instruction: 'HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1',
      sizeMb: 0.3,
      cached: false,
    },
  ],
  dockerfilePreview: `# Multi-stage Dockerfile (Sample Project Configuration)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
  githubActionsPreview: `# Sample 5-Stage CI/CD Workflow (.github/workflows/ci-cd.yml)
name: Automated CI/CD Pipeline

on:
  push:
    branches: [main, staging]

jobs:
  cicd-pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: 1. Code Commit
        uses: actions/checkout@v4

      - name: 2. Automated Testing
        run: |
          npm ci
          npm run lint
          npm run build

      - name: 3. Docker Build
        run: docker build -t ghcr.io/\${{ github.repository }}:\${{ github.sha }} .

      - name: 4. Docker Image Push
        run: docker push ghcr.io/\${{ github.repository }}:\${{ github.sha }}

      - name: 5. Deployment
        run: kubectl set image deployment/cicd-web-app web=ghcr.io/\${{ github.repository }}:\${{ github.sha }}`,
};
