import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import type {
  DeploymentEnvironment,
  EnvironmentHealth,
  EnvironmentName,
} from '../types/cicd';

interface DeploymentSectionProps {
  environments: DeploymentEnvironment[];
  onPromoteStaging: () => void;
  onRollbackProduction: () => void;
  onScaleReplicas: (envName: EnvironmentName, delta: number) => void;
  onRunHealthCheck: (envName: EnvironmentName) => void;
  canRollback: boolean;
  isPipelineRunning: boolean;
}

function EnvironmentStatusLabel({ status }: { status: EnvironmentHealth }) {
  if (status === 'Healthy') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Healthy</span>
      </span>
    );
  }
  if (status === 'Deploying') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
        <Loader2
          className="w-3.5 h-3.5 shrink-0 animate-spin"
          aria-hidden="true"
        />
        <span>Deploying</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Degraded</span>
    </span>
  );
}

export function DeploymentSection({
  environments,
  onPromoteStaging,
  onRollbackProduction,
  onScaleReplicas,
  onRunHealthCheck,
  canRollback,
  isPipelineRunning,
}: DeploymentSectionProps) {
  const [checkingEnv, setCheckingEnv] = useState<EnvironmentName | null>(null);

  const handleCheck = (envName: EnvironmentName) => {
    setCheckingEnv(envName);
    window.setTimeout(() => {
      onRunHealthCheck(envName);
      setCheckingEnv(null);
    }, 550);
  };

  return (
    <section
      aria-labelledby="deployment-status-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              id="deployment-status-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Deployment Status
            </h2>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-slate-500">
              Demonstration environments
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Active container releases, interactive replica scaling, health
            checks, and release promotion controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onPromoteStaging}
            disabled={isPipelineRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Promote Staging</span>
          </button>

          <button
            type="button"
            onClick={onRollbackProduction}
            disabled={!canRollback || isPipelineRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Rollback Production</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {environments.map((env) => {
          const isChecking = checkingEnv === env.name;
          return (
            <div
              key={env.id}
              className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
            >
              <div className="lg:col-span-4 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    {env.name}
                  </h3>
                  <EnvironmentStatusLabel status={env.status} />
                </div>
                <p className="text-xs font-mono text-slate-500 break-all">
                  {env.endpointUrl}
                </p>
                <p className="text-xs text-slate-500">
                  Strategy: {env.strategy}
                </p>
              </div>

              <div className="lg:col-span-4 space-y-1">
                <p className="text-xs text-slate-500">
                  Active Release &amp; Probe
                </p>
                <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                  {env.version}
                </p>
                <p
                  className="font-mono text-xs text-slate-600 truncate"
                  title={env.imageTag}
                >
                  Commit {env.commitSha} · {env.deployedAt}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  Probe: {env.lastHealthCheck}
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-wrap sm:flex-nowrap items-center lg:justify-end gap-4">
                {/* Interactive Replica Stepper */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Demo Replicas</p>
                  <div className="inline-flex items-center border border-slate-300 rounded-md bg-white">
                    <button
                      type="button"
                      disabled={isPipelineRunning || env.replicasDesired <= 1}
                      onClick={() => onScaleReplicas(env.name, -1)}
                      aria-label={`Scale down ${env.name} replicas`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 rounded-l-md"
                    >
                      <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span className="px-2.5 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      {env.replicasReady} / {env.replicasDesired}
                    </span>
                    <button
                      type="button"
                      disabled={isPipelineRunning || env.replicasDesired >= 5}
                      onClick={() => onScaleReplicas(env.name, 1)}
                      aria-label={`Scale up ${env.name} replicas`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 rounded-r-md"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Health Check Trigger */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Readiness Probe</p>
                  <button
                    type="button"
                    disabled={isChecking || isPipelineRunning}
                    onClick={() => handleCheck(env.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-700"
                  >
                    {isChecking ? (
                      <Loader2
                        className="w-3.5 h-3.5 animate-spin text-blue-700"
                        aria-hidden="true"
                      />
                    ) : (
                      <Activity
                        className="w-3.5 h-3.5 text-slate-600"
                        aria-hidden="true"
                      />
                    )}
                    <span>{isChecking ? 'Checking...' : 'Check Health'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
