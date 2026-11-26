export type NavigationSection =
  | 'home'
  | 'dashboard'
  | 'pipeline'
  | 'builds'
  | 'deployments'
  | 'docker';

export type StageStatus = 'passed' | 'running' | 'failed' | 'pending';

export type BuildStatus = 'Passed' | 'Failed' | 'Running';

export type EnvironmentName = 'Production' | 'Staging' | 'Development';

export type EnvironmentHealth = 'Healthy' | 'Deploying' | 'Degraded';

export type FailureScenario =
  | 'none'
  | 'automated-testing'
  | 'docker-build'
  | 'deployment';

export interface PipelineRunConfig {
  repositoryUrl?: string;
  repositorySlug?: string;
  branch: string;
  targetEnvironment: EnvironmentName;
  commitMessage: string;
  failureScenario: FailureScenario;
}

export interface PipelineStage {
  id: string;
  order: number;
  name:
    | 'Code Commit'
    | 'Automated Testing'
    | 'Docker Build'
    | 'Docker Image Push'
    | 'Deployment';
  shortDescription: string;
  status: StageStatus;
  duration: string;
  startedAt: string;
  command: string;
  logs: string[];
}

export interface BuildRecord {
  id: string;
  buildNumber: number;
  date: string;
  repositorySlug?: string;
  branch: string;
  targetEnvironment: EnvironmentName;
  commitSha: string;
  commitMessage: string;
  author: string;
  status: BuildStatus;
  duration: string;
  durationSeconds: number;
  imageTag: string;
  stageSummary: string;
}

export interface DeploymentEnvironment {
  id: string;
  name: EnvironmentName;
  version: string;
  imageTag: string;
  commitSha: string;
  status: EnvironmentHealth;
  deployedAt: string;
  replicasReady: number;
  replicasDesired: number;
  endpointUrl: string;
  strategy: string;
  uptimePercent: string;
  lastHealthCheck: string;
}

export interface DockerLayer {
  id: string;
  instruction: string;
  sizeMb: number;
  cached: boolean;
}

export interface DockerImageInfo {
  repository: string;
  tag: string;
  digest: string;
  architecture: string;
  os: string;
  baseImage: string;
  totalSizeMb: number;
  pushedAt: string;
  registry: string;
  buildNumber: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  layers: DockerLayer[];
  dockerfilePreview: string;
  githubActionsPreview: string;
}
