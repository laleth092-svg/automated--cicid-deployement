import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Play,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SAMPLE_BRANCHES } from '../data/demoData';
import type {
  EnvironmentName,
  FailureScenario,
  PipelineRunConfig,
  PipelineStage,
  StageStatus,
} from '../types/cicd';

interface PipelineSectionProps {
  stages: PipelineStage[];
  activeBuildNumber: number;
  isRunning: boolean;
  runConfig: PipelineRunConfig;
  onUpdateRunConfig: (next: PipelineRunConfig) => void;
  onRunPipeline: (overrideConfig?: PipelineRunConfig) => void;
  onResetPipeline: () => void;
  showDetailedLogs?: boolean;
}

function StageStatusLabel({ status }: { status: StageStatus }) {
  switch (status) {
    case 'passed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Passed</span>
        </span>
      );
    case 'running':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
          <Loader2
            className="w-3.5 h-3.5 shrink-0 animate-spin"
            aria-hidden="true"
          />
          <span>Running</span>
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Failed</span>
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Pending</span>
        </span>
      );
  }
}

export function PipelineSection({
  stages,
  activeBuildNumber,
  isRunning,
  runConfig,
  onUpdateRunConfig,
  onRunPipeline,
  onResetPipeline,
  showDetailedLogs = true,
}: PipelineSectionProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>(
    stages[0]?.id ?? 'code-commit'
  );
  const [configOpen, setConfigOpen] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Automatically follow the currently running or failed stage during simulation
  useEffect(() => {
    const runningStage = stages.find((s) => s.status === 'running');
    if (runningStage) {
      setSelectedStageId(runningStage.id);
      return;
    }
    const failedStage = stages.find((s) => s.status === 'failed');
    if (failedStage) {
      setSelectedStageId(failedStage.id);
    }
  }, [stages]);

  const selectedStage =
    stages.find((stage) => stage.id === selectedStageId) ?? stages[0];

  const passedCount = stages.filter((s) => s.status === 'passed').length;
  const hasFailed = stages.some((s) => s.status === 'failed');

  const handleCopyLogs = async () => {
    if (!selectedStage) return;
    const text = `$ ${selectedStage.command}\n${selectedStage.logs.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLogs(true);
      window.setTimeout(() => setCopiedLogs(false), 1800);
    } catch {
      setCopiedLogs(false);
    }
  };

  return (
    <section
      aria-labelledby="pipeline-status-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              id="pipeline-status-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Pipeline Status
            </h2>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-mono text-slate-600 tabular-nums">
              Demo Run #{activeBuildNumber}
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {passedCount} of {stages.length} stages passed
              {hasFailed ? ' (halted on failure)' : ''}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Watch stages execute automatically or click any stage to inspect its
            command and sample logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setConfigOpen((prev) => !prev)}
            aria-expanded={configOpen}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
              configOpen
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Configure Run</span>
          </button>

          <button
            type="button"
            onClick={() => onRunPipeline()}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{isRunning ? 'Running...' : 'Simulate Run'}</span>
          </button>

          <button
            type="button"
            onClick={onResetPipeline}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Collapsible Custom Run Configurator */}
      {configOpen && (
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="run-branch-select"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Source Branch
              </label>
              <select
                id="run-branch-select"
                disabled={isRunning}
                value={runConfig.branch}
                onChange={(e) =>
                  onUpdateRunConfig({ ...runConfig, branch: e.target.value })
                }
                className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700 disabled:opacity-50"
              >
                {SAMPLE_BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="run-env-select"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Target Environment
              </label>
              <select
                id="run-env-select"
                disabled={isRunning}
                value={runConfig.targetEnvironment}
                onChange={(e) =>
                  onUpdateRunConfig({
                    ...runConfig,
                    targetEnvironment: e.target.value as EnvironmentName,
                  })
                }
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700 disabled:opacity-50"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="run-failure-select"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Simulation Outcome
              </label>
              <select
                id="run-failure-select"
                disabled={isRunning}
                value={runConfig.failureScenario}
                onChange={(e) =>
                  onUpdateRunConfig({
                    ...runConfig,
                    failureScenario: e.target.value as FailureScenario,
                  })
                }
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700 disabled:opacity-50"
              >
                <option value="none">All 5 Stages Pass</option>
                <option value="automated-testing">
                  Fail at Automated Testing
                </option>
                <option value="docker-build">Fail at Docker Build</option>
                <option value="deployment">
                  Fail at Deployment Health Check
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="run-commit-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Demo Commit Message
              </label>
              <input
                id="run-commit-input"
                type="text"
                disabled={isRunning}
                value={runConfig.commitMessage}
                onChange={(e) =>
                  onUpdateRunConfig({
                    ...runConfig,
                    commitMessage: e.target.value,
                  })
                }
                placeholder="Describe sample commit..."
                className="w-full px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5-Stage Pipeline Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
        {stages.map((stage) => {
          const isSelected = selectedStage?.id === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedStageId(stage.id)}
              aria-pressed={isSelected}
              className={`text-left p-4 sm:p-5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-700 ${
                isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                  Stage 0{stage.order}
                </span>
                <StageStatusLabel status={stage.status} />
              </div>

              <h3 className="mt-2.5 text-sm font-semibold text-slate-900">
                {stage.name}
              </h3>

              <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                {stage.shortDescription}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Duration</span>
                <span className="font-mono font-medium text-slate-800 tabular-nums">
                  {stage.duration}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Inspector */}
      {showDetailedLogs && selectedStage && (
        <div className="p-5 sm:p-6 bg-slate-50/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-semibold text-slate-900">
                0{selectedStage.order}. {selectedStage.name}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <StageStatusLabel status={selectedStage.status} />
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Started {selectedStage.startedAt}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Sample console output
              </span>
              <button
                type="button"
                onClick={handleCopyLogs}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap"
              >
                {copiedLogs ? (
                  <>
                    <Check
                      className="w-3.5 h-3.5 text-emerald-700"
                      aria-hidden="true"
                    />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy Logs</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-md p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <p className="text-slate-400 select-all">
              $ {selectedStage.command}
            </p>
            <div className="mt-2.5 space-y-1">
              {selectedStage.logs.map((line, index) => {
                const isErrorLine =
                  line.toLowerCase().includes('fail') ||
                  line.toLowerCase().includes('error');
                return (
                  <p
                    key={index}
                    className={isErrorLine ? 'text-red-300' : 'text-slate-200'}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
