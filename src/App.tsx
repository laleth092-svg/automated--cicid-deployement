import { CheckCircle2, Play, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BuildHistoryTable } from './components/BuildHistoryTable';
import { DemoNotice } from './components/DemoNotice';
import { DeploymentSection } from './components/DeploymentSection';
import { DockerImageSection } from './components/DockerImageSection';
import { GitHubUrlModal } from './components/GitHubUrlModal';
import { HomeView } from './components/HomeView';
import { PipelineSection } from './components/PipelineSection';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import {
  DEFAULT_REPOSITORY_SLUG,
  DEFAULT_REPOSITORY_URL,
  DEFAULT_RUN_CONFIG,
  INITIAL_BUILD_HISTORY,
  INITIAL_DEPLOYMENTS,
  INITIAL_DOCKER_IMAGE,
  INITIAL_PIPELINE_STAGES,
} from './data/demoData';
import type {
  BuildRecord,
  DeploymentEnvironment,
  DockerImageInfo,
  EnvironmentName,
  FailureScenario,
  NavigationSection,
  PipelineRunConfig,
  PipelineStage,
} from './types/cicd';

const STORAGE_KEY = 'cicd_demo_state_v2';

interface PersistedDemoState {
  builds: BuildRecord[];
  environments: DeploymentEnvironment[];
  dockerImage: DockerImageInfo;
  activeBuildNumber: number;
}

function loadPersistedState(): PersistedDemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedDemoState>;
    if (
      Array.isArray(parsed.builds) &&
      Array.isArray(parsed.environments) &&
      parsed.dockerImage &&
      typeof parsed.activeBuildNumber === 'number'
    ) {
      return parsed as PersistedDemoState;
    }
    return null;
  } catch {
    return null;
  }
}

function formatUtcTimestamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

function generateDemoSha(seed: number): string {
  const hex = ((seed * 2654435761) >>> 0).toString(16).padStart(7, '0');
  return hex.slice(0, 7);
}

function getFailureIndex(scenario: FailureScenario): number | null {
  switch (scenario) {
    case 'automated-testing':
      return 1;
    case 'docker-build':
      return 2;
    case 'deployment':
      return 4;
    default:
      return null;
  }
}

export default function App() {
  const persisted = useMemo(() => loadPersistedState(), []);

  const [activeSection, setActiveSection] = useState<NavigationSection>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_PIPELINE_STAGES);
  const [builds, setBuilds] = useState<BuildRecord[]>(
    persisted?.builds ?? INITIAL_BUILD_HISTORY
  );
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>(
    persisted?.environments ?? INITIAL_DEPLOYMENTS
  );
  const [dockerImage, setDockerImage] = useState<DockerImageInfo>(
    persisted?.dockerImage ?? INITIAL_DOCKER_IMAGE
  );
  const [activeBuildNumber, setActiveBuildNumber] = useState<number>(
    persisted?.activeBuildNumber ?? 142
  );

  const [runConfig, setRunConfig] =
    useState<PipelineRunConfig>(DEFAULT_RUN_CONFIG);
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [activityNotice, setActivityNotice] = useState<string | null>(null);

  const [previousProdRelease, setPreviousProdRelease] = useState<{
    version: string;
    imageTag: string;
    commitSha: string;
  } | null>({
    version: 'v1.4.1-demo',
    imageTag: 'ghcr.io/devops-student/cicd-web-app:v1.4.1-demo',
    commitSha: '7d21e8b',
  });

  const timerIdsRef = useRef<number[]>([]);

  const clearScheduledTimers = () => {
    timerIdsRef.current.forEach((id) => window.clearTimeout(id));
    timerIdsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearScheduledTimers();
    };
  }, []);

  useEffect(() => {
    try {
      const payload: PersistedDemoState = {
        builds,
        environments,
        dockerImage,
        activeBuildNumber,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in restricted browsing contexts
    }
  }, [builds, environments, dockerImage, activeBuildNumber]);

  const passRate = useMemo(() => {
    const completed = builds.filter((b) => b.status !== 'Running');
    if (completed.length === 0) return '0%';
    const passed = completed.filter((b) => b.status === 'Passed').length;
    return `${Math.round((passed / completed.length) * 100)}%`;
  }, [builds]);

  const productionEnv = environments.find((e) => e.name === 'Production');

  const handleRunPipeline = (overrideConfig?: PipelineRunConfig) => {
    if (isPipelineRunning) return;
    clearScheduledTimers();

    const activeConfig: PipelineRunConfig = {
      repositoryUrl:
        overrideConfig?.repositoryUrl ??
        runConfig.repositoryUrl ??
        DEFAULT_REPOSITORY_URL,
      repositorySlug:
        overrideConfig?.repositorySlug ??
        runConfig.repositorySlug ??
        DEFAULT_REPOSITORY_SLUG,
      branch: overrideConfig?.branch ?? runConfig.branch,
      targetEnvironment:
        overrideConfig?.targetEnvironment ?? runConfig.targetEnvironment,
      commitMessage: overrideConfig?.commitMessage ?? runConfig.commitMessage,
      failureScenario:
        overrideConfig?.failureScenario ?? runConfig.failureScenario,
    };

    if (overrideConfig) {
      setRunConfig(activeConfig);
    }

    if (activeSection === 'home') {
      setActiveSection('dashboard');
    }

    const repoSlug = activeConfig.repositorySlug ?? DEFAULT_REPOSITORY_SLUG;
    const repoUrl = activeConfig.repositoryUrl ?? DEFAULT_REPOSITORY_URL;
    const repoLower = repoSlug.toLowerCase();
    const repoAppName = repoLower.split('/')[1] ?? 'cicd-web-app';
    const imageRepo = `ghcr.io/${repoLower}`;

    const nextBuildNumber =
      Math.max(...builds.map((b) => b.buildNumber), activeBuildNumber) + 1;
    const nextPatch = Math.max(3, nextBuildNumber - 140);
    const envSuffix =
      activeConfig.targetEnvironment === 'Production'
        ? 'demo'
        : activeConfig.targetEnvironment === 'Staging'
          ? 'rc-demo'
          : 'dev-demo';
    const nextVersion = `v1.4.${nextPatch}-${envSuffix}`;
    const nextSha = generateDemoSha(nextBuildNumber);
    const nowLabel = formatUtcTimestamp(new Date());
    const failureIndex = getFailureIndex(activeConfig.failureScenario);
    const commitMsg =
      activeConfig.commitMessage.trim() ||
      `Simulated build for ${repoSlug}`;

    setActiveBuildNumber(nextBuildNumber);
    setIsPipelineRunning(true);
    setActivityNotice(
      `Started demonstration run #${nextBuildNumber} for ${repoSlug} (${activeConfig.branch}) targeting ${activeConfig.targetEnvironment}.`
    );

    setStages(
      INITIAL_PIPELINE_STAGES.map((stage, idx) => {
        const dynamicCommand =
          idx === 0
            ? `git clone ${repoUrl}.git && git checkout ${activeConfig.branch}`
            : stage.command
                .replaceAll('main', activeConfig.branch)
                .replaceAll(
                  'ghcr.io/devops-student/cicd-web-app',
                  imageRepo
                )
                .replaceAll('cicd-web-app', repoAppName)
                .replaceAll('v1.4.2-demo', nextVersion);

        return {
          ...stage,
          status: 'pending',
          duration: '—',
          startedAt: 'Queued',
          command: dynamicCommand,
          logs: ['[Demo Log] Waiting for previous stage to complete...'],
        };
      })
    );

    const stageTimings = [
      { index: 0, delayMs: 200, durationLabel: '5s', seconds: 5 },
      { index: 1, delayMs: 1000, durationLabel: '36s', seconds: 36 },
      { index: 2, delayMs: 1950, durationLabel: '47s', seconds: 47 },
      { index: 3, delayMs: 2900, durationLabel: '21s', seconds: 21 },
      { index: 4, delayMs: 3800, durationLabel: '14s', seconds: 14 },
    ];

    stageTimings.forEach((step) => {
      if (failureIndex !== null && step.index > failureIndex) {
        return;
      }

      const startTimer = window.setTimeout(() => {
        const stepTimestamp = formatUtcTimestamp(new Date());

        setStages((prev) =>
          prev.map((stage, idx) => {
            if (idx < step.index) {
              return { ...stage, status: 'passed' };
            }
            if (idx === step.index) {
              return {
                ...stage,
                status: 'running',
                duration: 'Running',
                startedAt: stepTimestamp,
                logs: [
                  `[Demo Log] Starting stage "${stage.name}" for build #${nextBuildNumber} (${activeConfig.branch})...`,
                  `[Demo Log] Executing command: ${stage.command}`,
                ],
              };
            }
            return stage;
          })
        );

        if (step.index === 4) {
          setEnvironments((prev) =>
            prev.map((env) =>
              env.name === activeConfig.targetEnvironment
                ? { ...env, status: 'Deploying' }
                : env
            )
          );
        }
      }, step.delayMs);

      timerIdsRef.current.push(startTimer);

      const finishTimer = window.setTimeout(() => {
        const isFailureStep = failureIndex === step.index;

        setStages((prev) =>
          prev.map((stage, idx) => {
            if (idx !== step.index) return stage;
            if (isFailureStep) {
              const failureLogsByStage: Record<number, string[]> = {
                1: [
                  `[Demo Log] Running test suite on branch "${activeConfig.branch}" (${nextSha})...`,
                  '[Demo Log] FAIL src/utils/healthCheck.test.ts (expected HTTP 200, received 503)',
                  '[Demo Log] Error: Automated Testing failed. Docker Build, Push, and Deployment were skipped.',
                ],
                2: [
                  `[Demo Log] Building Docker image ${imageRepo}:${nextVersion}...`,
                  '[Demo Log] ERROR: COPY docker/nginx.conf failed — file not found in build context',
                  '[Demo Log] Error: Docker Build failed. Image Push and Deployment were aborted.',
                ],
                4: [
                  `[Demo Log] Rolling out ${nextVersion} (${repoSlug}) to ${activeConfig.targetEnvironment}...`,
                  '[Demo Log] ERROR: Readiness probe /healthz timed out after 15s (HTTP 502)',
                  '[Demo Log] Error: Deployment halted; previous healthy release remains active.',
                ],
              };
              return {
                ...stage,
                status: 'failed',
                duration: step.durationLabel,
                logs: failureLogsByStage[step.index] ?? [
                  '[Demo Log] Error: Stage failed during demonstration run.',
                ],
              };
            }

            const baseLogs = INITIAL_PIPELINE_STAGES[idx].logs.map((line) =>
              line
                .replaceAll('v1.4.2-demo', nextVersion)
                .replaceAll('9a4f2c1', nextSha)
                .replaceAll('"main"', `"${activeConfig.branch}"`)
                .replaceAll('ghcr.io/devops-student', `ghcr.io/${repoLower.split('/')[0] ?? 'devops-student'}`)
                .replaceAll('Refine responsive layout and unit tests', commitMsg)
            );

            return {
              ...stage,
              status: 'passed',
              duration: step.durationLabel,
              logs: baseLogs,
            };
          })
        );

        if (isFailureStep) {
          const totalSec = stageTimings
            .slice(0, step.index + 1)
            .reduce((sum, s) => sum + s.seconds, 0);
          const mins = Math.floor(totalSec / 60);
          const secs = String(totalSec % 60).padStart(2, '0');
          const stageName = INITIAL_PIPELINE_STAGES[step.index].name;

          const failedBuild: BuildRecord = {
            id: `build-${nextBuildNumber}`,
            buildNumber: nextBuildNumber,
            date: nowLabel,
            repositorySlug: repoSlug,
            branch: activeConfig.branch,
            targetEnvironment: activeConfig.targetEnvironment,
            commitSha: nextSha,
            commitMessage: commitMsg,
            author: 'Demo Runner',
            status: 'Failed',
            duration: `${mins}m ${secs}s`,
            durationSeconds: totalSec,
            imageTag: '—',
            stageSummary: `Stopped at ${stageName} (simulated failure)`,
          };

          setBuilds((prev) => [failedBuild, ...prev]);

          if (step.index === 4) {
            setEnvironments((prev) =>
              prev.map((env) =>
                env.name === activeConfig.targetEnvironment
                  ? {
                      ...env,
                      status: 'Healthy',
                      lastHealthCheck:
                        'Rollout aborted · Previous release healthy (sample)',
                    }
                  : env
              )
            );
          }

          setActivityNotice(
            `Demo run #${nextBuildNumber} (${repoSlug}) stopped at ${stageName}. Existing ${activeConfig.targetEnvironment} release was protected.`
          );
          setIsPipelineRunning(false);
        } else if (step.index === 4) {
          const newDigest = `sha256:${nextSha}9d7e3a204b1c5d6e7f890123456b29e`;
          const fullImageRef = `${imageRepo}:${nextVersion}`;

          const passedBuild: BuildRecord = {
            id: `build-${nextBuildNumber}`,
            buildNumber: nextBuildNumber,
            date: nowLabel,
            repositorySlug: repoSlug,
            branch: activeConfig.branch,
            targetEnvironment: activeConfig.targetEnvironment,
            commitSha: nextSha,
            commitMessage: commitMsg,
            author: 'Demo Runner',
            status: 'Passed',
            duration: '2m 03s',
            durationSeconds: 123,
            imageTag: nextVersion,
            stageSummary: `5 of 5 stages passed · Deployed ${repoSlug} to ${activeConfig.targetEnvironment}`,
          };

          setBuilds((prev) => [passedBuild, ...prev]);

          setEnvironments((prev) =>
            prev.map((env) => {
              if (env.name === activeConfig.targetEnvironment) {
                if (env.name === 'Production') {
                  setPreviousProdRelease({
                    version: env.version,
                    imageTag: env.imageTag,
                    commitSha: env.commitSha,
                  });
                }
                return {
                  ...env,
                  version: nextVersion,
                  imageTag: fullImageRef,
                  commitSha: nextSha,
                  status: 'Healthy',
                  deployedAt: nowLabel,
                  lastHealthCheck: 'HTTP 200 OK · 22ms (sample)',
                };
              }
              return env;
            })
          );

          setDockerImage((prev) => ({
            ...prev,
            repository: imageRepo,
            tag: nextVersion,
            digest: newDigest,
            pushedAt: nowLabel,
            buildNumber: nextBuildNumber,
          }));

          setActivityNotice(
            `Demo run #${nextBuildNumber} for ${repoSlug} passed all 5 stages and deployed ${nextVersion} to ${activeConfig.targetEnvironment}.`
          );
          setIsPipelineRunning(false);
        }
      }, step.delayMs + 700);

      timerIdsRef.current.push(finishTimer);
    });
  };

  const handleRerunBuild = (build: BuildRecord) => {
    const slug = build.repositorySlug ?? DEFAULT_REPOSITORY_SLUG;
    const config: PipelineRunConfig = {
      repositorySlug: slug,
      repositoryUrl: `https://github.com/${slug}`,
      branch: build.branch,
      targetEnvironment: build.targetEnvironment,
      commitMessage: `Re-run of #${build.buildNumber}: ${build.commitMessage}`,
      failureScenario: 'none',
    };
    if (activeSection === 'builds') {
      setActiveSection('dashboard');
    }
    handleRunPipeline(config);
  };

  const handleResetDemo = () => {
    clearScheduledTimers();
    setIsPipelineRunning(false);
    setRunConfig(DEFAULT_RUN_CONFIG);
    setStages(INITIAL_PIPELINE_STAGES);
    setBuilds(INITIAL_BUILD_HISTORY);
    setEnvironments(INITIAL_DEPLOYMENTS);
    setDockerImage(INITIAL_DOCKER_IMAGE);
    setActiveBuildNumber(142);
    setPreviousProdRelease({
      version: 'v1.4.1-demo',
      imageTag: 'ghcr.io/devops-student/cicd-web-app:v1.4.1-demo',
      commitSha: '7d21e8b',
    });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup errors
    }
    setActivityNotice('Restored initial demonstration data.');
  };

  const handlePromoteStaging = () => {
    if (isPipelineRunning) return;
    const staging = environments.find((e) => e.name === 'Staging');
    const prod = environments.find((e) => e.name === 'Production');
    if (!staging || !prod) return;

    const nowLabel = formatUtcTimestamp(new Date());
    setPreviousProdRelease({
      version: prod.version,
      imageTag: prod.imageTag,
      commitSha: prod.commitSha,
    });

    setEnvironments((prev) =>
      prev.map((env) =>
        env.name === 'Production'
          ? {
              ...env,
              version: staging.version,
              imageTag: staging.imageTag,
              commitSha: staging.commitSha,
              deployedAt: nowLabel,
              status: 'Healthy',
              lastHealthCheck: 'HTTP 200 OK · 19ms (sample)',
            }
          : env
      )
    );

    setDockerImage((prev) => ({
      ...prev,
      tag: staging.version,
      pushedAt: nowLabel,
    }));

    setActivityNotice(
      `Promoted Staging release ${staging.version} to Production (demo action).`
    );
  };

  const handleRollbackProduction = () => {
    if (isPipelineRunning || !previousProdRelease) return;
    const nowLabel = formatUtcTimestamp(new Date());
    const target = previousProdRelease;

    setEnvironments((prev) =>
      prev.map((env) =>
        env.name === 'Production'
          ? {
              ...env,
              version: target.version,
              imageTag: target.imageTag,
              commitSha: target.commitSha,
              deployedAt: nowLabel,
              status: 'Healthy',
              lastHealthCheck: 'HTTP 200 OK · 24ms after rollback (sample)',
            }
          : env
      )
    );

    setDockerImage((prev) => ({
      ...prev,
      tag: target.version,
      pushedAt: nowLabel,
    }));

    setPreviousProdRelease(null);
    setActivityNotice(
      `Rolled back Production to ${target.version} (demo action).`
    );
  };

  const handleScaleReplicas = (envName: EnvironmentName, delta: number) => {
    setEnvironments((prev) =>
      prev.map((env) => {
        if (env.name !== envName) return env;
        const nextCount = Math.min(5, Math.max(1, env.replicasDesired + delta));
        return {
          ...env,
          replicasDesired: nextCount,
          replicasReady: nextCount,
          lastHealthCheck: `HTTP 200 OK · ${nextCount}/${nextCount} replicas ready (sample)`,
        };
      })
    );
    setActivityNotice(
      `Updated ${envName} demonstration replicas (${delta > 0 ? 'scaled up' : 'scaled down'}).`
    );
  };

  const handleRunHealthCheck = (envName: EnvironmentName) => {
    const latency = 18 + Math.floor(Math.random() * 24);
    const nowLabel = formatUtcTimestamp(new Date());
    setEnvironments((prev) =>
      prev.map((env) =>
        env.name === envName
          ? {
              ...env,
              status: 'Healthy',
              lastHealthCheck: `HTTP 200 OK · ${latency}ms at ${nowLabel} (sample)`,
            }
          : env
      )
    );
    setActivityNotice(
      `Sample readiness probe for ${envName} returned HTTP 200 OK (${latency}ms).`
    );
  };

  const passedCount = builds.filter((b) => b.status === 'Passed').length;
  const failedCount = builds.filter((b) => b.status === 'Failed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeSection={activeSection}
          isPipelineRunning={isPipelineRunning}
          onRunPipeline={() => handleRunPipeline()}
          onOpenGitHubSearch={() => setGithubModalOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <GitHubUrlModal
          isOpen={githubModalOpen}
          currentRepoUrl={runConfig.repositoryUrl ?? DEFAULT_REPOSITORY_URL}
          isPipelineRunning={isPipelineRunning}
          onClose={() => setGithubModalOpen(false)}
          onRunFromGitHub={(config) => handleRunPipeline(config)}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activityNotice && activeSection !== 'home' && (
            <div
              role="status"
              aria-live="polite"
              className="mb-5 flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-700 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{activityNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setActivityNotice(null)}
                aria-label="Dismiss notification"
                className="p-1 text-slate-400 hover:text-slate-700 rounded shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeSection === 'home' && (
            <HomeView
              onNavigate={setActiveSection}
              onRunDemoPipeline={() => handleRunPipeline()}
              isPipelineRunning={isPipelineRunning}
              totalBuilds={builds.length}
              passRate={passRate}
              currentVersion={productionEnv?.version ?? dockerImage.tag}
            />
          )}

          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <DemoNotice compact />

              {/* One-Click Guided Demo Scenarios */}
              <section
                aria-label="Quick demonstration scenarios"
                className="bg-white border border-slate-200 rounded-lg px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Quick Demo Scenarios
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Try a common DevOps workflow in one click to see all panels
                    update together.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isPipelineRunning}
                    onClick={() =>
                      handleRunPipeline({
                        branch: 'main',
                        targetEnvironment: 'Production',
                        commitMessage:
                          'Release validated build to Production cluster',
                        failureScenario: 'none',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span>Deploy to Production</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPipelineRunning}
                    onClick={() =>
                      handleRunPipeline({
                        branch: 'feature/container-health',
                        targetEnvironment: 'Staging',
                        commitMessage:
                          'Test CI quality gate with failing unit test',
                        failureScenario: 'automated-testing',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Simulate Failed Test</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPipelineRunning}
                    onClick={() =>
                      handleRunPipeline({
                        branch: 'staging',
                        targetEnvironment: 'Staging',
                        commitMessage: 'Deploy release candidate to Staging',
                        failureScenario: 'none',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Deploy to Staging</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPipelineRunning}
                    onClick={handleResetDemo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </section>

              {/* Compact Summary Metrics Bar */}
              <section
                aria-label="Demonstration pipeline summary"
                className="bg-white border border-slate-200 rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200"
              >
                <div className="p-5">
                  <p className="text-xs text-slate-500">Latest Demo Build</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    #{activeBuildNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {isPipelineRunning
                      ? 'Simulation in progress'
                      : 'Sample run recorded'}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs text-slate-500">Pass / Fail Ratio</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-emerald-700 tabular-nums">
                    {passRate}
                  </p>
                  <p className="mt-0.5 text-xs font-mono text-slate-500 tabular-nums">
                    {passedCount} passed · {failedCount} failed
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs text-slate-500">Production Release</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums truncate">
                    {productionEnv?.version ?? 'v1.4.2-demo'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {productionEnv?.status ?? 'Healthy'} ·{' '}
                    {productionEnv?.replicasReady ?? 3}/
                    {productionEnv?.replicasDesired ?? 3} replicas
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs text-slate-500">Docker Image Size</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {dockerImage.totalSizeMb.toFixed(1)} MB
                  </p>
                  <p className="mt-0.5 text-xs font-mono text-slate-500">
                    {dockerImage.architecture} · Alpine
                  </p>
                </div>
              </section>

              <PipelineSection
                stages={stages}
                activeBuildNumber={activeBuildNumber}
                isRunning={isPipelineRunning}
                runConfig={runConfig}
                onUpdateRunConfig={setRunConfig}
                onRunPipeline={handleRunPipeline}
                onResetPipeline={handleResetDemo}
              />

              <BuildHistoryTable
                builds={builds}
                onRerunBuild={handleRerunBuild}
                isPipelineRunning={isPipelineRunning}
              />

              <DeploymentSection
                environments={environments}
                onPromoteStaging={handlePromoteStaging}
                onRollbackProduction={handleRollbackProduction}
                onScaleReplicas={handleScaleReplicas}
                onRunHealthCheck={handleRunHealthCheck}
                canRollback={previousProdRelease !== null}
                isPipelineRunning={isPipelineRunning}
              />

              <DockerImageSection image={dockerImage} />
            </div>
          )}

          {activeSection === 'pipeline' && (
            <div className="space-y-6">
              <DemoNotice compact />
              <PipelineSection
                stages={stages}
                activeBuildNumber={activeBuildNumber}
                isRunning={isPipelineRunning}
                runConfig={runConfig}
                onUpdateRunConfig={setRunConfig}
                onRunPipeline={handleRunPipeline}
                onResetPipeline={handleResetDemo}
              />
            </div>
          )}

          {activeSection === 'builds' && (
            <div className="space-y-6">
              <DemoNotice compact />
              <BuildHistoryTable
                builds={builds}
                onRerunBuild={handleRerunBuild}
                isPipelineRunning={isPipelineRunning}
              />
            </div>
          )}

          {activeSection === 'deployments' && (
            <div className="space-y-6">
              <DemoNotice compact />
              <DeploymentSection
                environments={environments}
                onPromoteStaging={handlePromoteStaging}
                onRollbackProduction={handleRollbackProduction}
                onScaleReplicas={handleScaleReplicas}
                onRunHealthCheck={handleRunHealthCheck}
                canRollback={previousProdRelease !== null}
                isPipelineRunning={isPipelineRunning}
              />
            </div>
          )}

          {activeSection === 'docker' && (
            <div className="space-y-6">
              <DemoNotice compact />
              <DockerImageSection image={dockerImage} />
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <p>
              Automated CI/CD Deployment System · Student DevOps Engineering
              Project
            </p>
            <p>
              All pipeline statuses and metrics are labeled demonstration data.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
