import { ArrowRight, Play } from 'lucide-react';
import type { NavigationSection } from '../types/cicd';
import { DemoNotice } from './DemoNotice';

interface HomeViewProps {
  onNavigate: (section: NavigationSection) => void;
  onRunDemoPipeline: () => void;
  isPipelineRunning: boolean;
  totalBuilds: number;
  passRate: string;
  currentVersion: string;
}

const ARCHITECTURE_STAGES = [
  {
    number: '01',
    name: 'Code Commit',
    summary:
      'Developers push source code changes to a Git branch. A webhook or workflow trigger captures the commit SHA, author, and diff.',
    output: 'Verified commit snapshot',
  },
  {
    number: '02',
    name: 'Automated Testing',
    summary:
      'The runner installs locked dependencies, runs TypeScript and lint checks, and executes automated unit tests before any container is built.',
    output: 'Pass or fail quality gate',
  },
  {
    number: '03',
    name: 'Docker Build',
    summary:
      'A multi-stage Dockerfile compiles the React and Vite production bundle inside Node, then copies static assets into a lean Nginx runtime image.',
    output: 'Immutable container image',
  },
  {
    number: '04',
    name: 'Docker Image Push',
    summary:
      'The versioned image is tagged with the release version and commit reference, then pushed to a container registry with layer caching.',
    output: 'Registry digest and tag',
  },
  {
    number: '05',
    name: 'Deployment',
    summary:
      'The deployment controller pulls the new image digest, rolls out updated replicas with zero downtime, and verifies the HTTP readiness probe.',
    output: 'Healthy live release',
  },
];

const PROJECT_PRINCIPLES = [
  {
    title: 'Continuous Integration (CI)',
    description:
      'Every commit is automatically validated through static analysis and unit tests so regressions are caught within minutes instead of after release.',
  },
  {
    title: 'Containerized Packaging',
    description:
      'Multi-stage Docker builds keep the runtime image compact and consistent across student laptops, staging environments, and production hosts.',
  },
  {
    title: 'Continuous Deployment (CD)',
    description:
      'Passing builds produce versioned artifacts that can be rolled out repeatably with health verification and fast rollback to a prior tag.',
  },
];

export function HomeView({
  onNavigate,
  onRunDemoPipeline,
  isPipelineRunning,
  totalBuilds,
  passRate,
  currentVersion,
}: HomeViewProps) {
  return (
    <div className="space-y-8">
      <DemoNotice />

      {/* Project Introduction */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl space-y-5">
          <p className="text-xs font-medium text-blue-700">
            Student DevOps Engineering Project · React, Vite &amp; Docker Workflow
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Automated CI/CD Deployment System
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            This web application demonstrates how modern software teams automate
            source code validation, Docker container builds, registry publishing,
            and environment deployments. Explore the interactive dashboard to
            inspect each pipeline stage, review simulated build history, and
            trigger a step-by-step demonstration run.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('pipeline');
                onRunDemoPipeline();
              }}
              disabled={isPipelineRunning}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <Play className="w-4 h-4 text-blue-700" aria-hidden="true" />
              <span>
                {isPipelineRunning ? 'Pipeline Running...' : 'Simulate Pipeline Run'}
              </span>
            </button>
          </div>
        </div>

        {/* Snapshot Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500">Pipeline Stages</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              5 Stages
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Commit to Deployment
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Sample Builds Logged</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {totalBuilds}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Demo build history records
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Sample Pass Rate</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-emerald-700 tabular-nums">
              {passRate}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Across demonstration runs
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Active Demo Release</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {currentVersion}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Multi-stage Alpine image
            </p>
          </div>
        </div>
      </section>

      {/* End-to-End Pipeline Architecture */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              How the 5-Stage CI/CD Pipeline Works
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Each stage validates the artifact before passing it forward. If any
              step fails, the pipeline halts immediately to protect production.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('pipeline')}
            className="text-sm font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Inspect Pipeline Stages &rarr;
          </button>
        </div>

        <ol className="divide-y divide-slate-200">
          {ARCHITECTURE_STAGES.map((stage) => (
            <li
              key={stage.number}
              className="py-5 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start"
            >
              <div className="md:col-span-3 flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold text-blue-700 tabular-nums">
                  {stage.number}.
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {stage.name}
                </h3>
              </div>
              <p className="md:col-span-6 text-sm text-slate-600 leading-relaxed">
                {stage.summary}
              </p>
              <div className="md:col-span-3 md:text-right text-xs text-slate-500">
                <span className="font-medium text-slate-700">Output: </span>
                <span>{stage.output}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Core Engineering Objectives & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Engineering Objectives
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Designed as a beginner-friendly reference for university DevOps
              coursework and software delivery demonstrations.
            </p>

            <div className="mt-6 divide-y divide-slate-200">
              {PROJECT_PRINCIPLES.map((item) => (
                <div key={item.title} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Explore Dashboard Modules
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Jump directly into any section of the demonstration console.
            </p>

            <div className="mt-6 divide-y divide-slate-200">
              <button
                type="button"
                onClick={() => onNavigate('pipeline')}
                className="w-full py-3.5 text-left flex items-center justify-between gap-4 hover:text-blue-700 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    Pipeline Status
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    5-stage workflow runner, logs, and pass/fail simulation
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('builds')}
                className="w-full py-3.5 text-left flex items-center justify-between gap-4 hover:text-blue-700 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    Build History
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Searchable table with build numbers, dates, statuses, and durations
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('deployments')}
                className="w-full py-3.5 text-left flex items-center justify-between gap-4 hover:text-blue-700 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    Deployment Status
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Production, Staging, and Development environment health
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('docker')}
                className="w-full py-3.5 text-left flex items-center justify-between gap-4 hover:text-blue-700 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    Docker Image Information
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Image tag, digest, multi-stage layers, and pull command
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
              </button>
            </div>
          </div>

          <p className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
            Lightweight setup: built with React, Vite, and Tailwind CSS. No
            database or paid cloud keys required.
          </p>
        </section>
      </div>
    </div>
  );
}
