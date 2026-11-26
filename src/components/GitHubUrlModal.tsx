import { AlertCircle, GitBranch, Play, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  EnvironmentName,
  FailureScenario,
  PipelineRunConfig,
} from '../types/cicd';

export interface ParsedGitHubRepo {
  owner: string;
  repo: string;
  slug: string;
  url: string;
  branch?: string;
}

export function parseGitHubUrl(rawInput: string): ParsedGitHubRepo | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Support shorthand "owner/repo"
  const shorthandMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/);
  if (shorthandMatch) {
    const owner = shorthandMatch[1];
    const repo = shorthandMatch[2];
    return {
      owner,
      repo,
      slug: `${owner}/${repo}`,
      url: `https://github.com/${owner}/${repo}`,
    };
  }

  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'github.com' && hostname !== 'www.github.com') {
      return null;
    }

    const segments = parsed.pathname
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);

    if (segments.length < 2) {
      return null;
    }

    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, '');
    if (!owner || !repo) {
      return null;
    }

    let branch: string | undefined;
    if (segments[2] === 'tree' && segments.length >= 4) {
      branch = segments.slice(3).join('/');
    }

    return {
      owner,
      repo,
      slug: `${owner}/${repo}`,
      url: `https://github.com/${owner}/${repo}`,
      branch,
    };
  } catch {
    return null;
  }
}

interface GitHubUrlModalProps {
  isOpen: boolean;
  currentRepoUrl: string;
  isPipelineRunning: boolean;
  onClose: () => void;
  onRunFromGitHub: (config: PipelineRunConfig) => void;
}

const SAMPLE_URLS = [
  'https://github.com/devops-student/cicd-web-app',
  'https://github.com/vitejs/vite',
  'https://github.com/facebook/react/tree/main',
];

export function GitHubUrlModal({
  isOpen,
  currentRepoUrl,
  isPipelineRunning,
  onClose,
  onRunFromGitHub,
}: GitHubUrlModalProps) {
  const [urlInput, setUrlInput] = useState(currentRepoUrl);
  const [branchInput, setBranchInput] = useState('main');
  const [targetEnv, setTargetEnv] = useState<EnvironmentName>('Production');
  const [failureScenario, setFailureScenario] =
    useState<FailureScenario>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentRepoUrl);
      setErrorMessage(null);
      window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
    }
  }, [isOpen, currentRepoUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const parsedRepo = useMemo(() => parseGitHubUrl(urlInput), [urlInput]);

  useEffect(() => {
    if (parsedRepo?.branch) {
      setBranchInput(parsedRepo.branch);
    }
  }, [parsedRepo?.branch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseGitHubUrl(urlInput);
    if (!result) {
      setErrorMessage(
        'Enter a valid GitHub repository URL (for example: https://github.com/owner/repository).'
      );
      return;
    }

    const branch = branchInput.trim() || result.branch || 'main';
    onRunFromGitHub({
      repositoryUrl: result.url,
      repositorySlug: result.slug,
      branch,
      targetEnvironment: targetEnv,
      commitMessage: `Triggered demo pipeline from ${result.slug}`,
      failureScenario,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-url-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/45"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
            <h2
              id="github-url-modal-title"
              className="text-base font-semibold text-slate-900"
            >
              Run Pipeline from GitHub URL
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close GitHub URL dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div>
            <label
              htmlFor="github-repo-url-input"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              GitHub Repository URL
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id="github-repo-url-input"
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="https://github.com/username/repository"
                className="w-full pl-9 pr-3 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700"
              />
            </div>

            {errorMessage ? (
              <p
                role="alert"
                className="mt-2 flex items-start gap-1.5 text-xs text-red-700"
              >
                <AlertCircle
                  className="w-3.5 h-3.5 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{errorMessage}</span>
              </p>
            ) : parsedRepo ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                <GitBranch
                  className="w-3.5 h-3.5 text-emerald-700 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Detected repository:{' '}
                  <span className="font-mono font-medium text-slate-900">
                    {parsedRepo.slug}
                  </span>
                </span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Paste a full GitHub link or shorthand like{' '}
                <span className="font-mono">owner/repo</span>.
              </p>
            )}
          </div>

          {/* Quick Sample Repository Links */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
            <span>Examples:</span>
            {SAMPLE_URLS.map((sample) => {
              const shortLabel = sample.replace('https://github.com/', '');
              return (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setUrlInput(sample);
                    setErrorMessage(null);
                  }}
                  className="font-mono text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap"
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>

          {/* Branch, Environment & Simulation Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label
                htmlFor="modal-branch-input"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Branch
              </label>
              <input
                id="modal-branch-input"
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label
                htmlFor="modal-env-select"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Environment
              </label>
              <select
                id="modal-env-select"
                value={targetEnv}
                onChange={(e) => setTargetEnv(e.target.value as EnvironmentName)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="modal-outcome-select"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Outcome
              </label>
              <select
                id="modal-outcome-select"
                value={failureScenario}
                onChange={(e) =>
                  setFailureScenario(e.target.value as FailureScenario)
                }
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700"
              >
                <option value="none">All Stages Pass</option>
                <option value="automated-testing">Fail at Tests</option>
                <option value="docker-build">Fail at Docker</option>
                <option value="deployment">Fail at Deploy</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-200">
            Demonstration mode: parses the GitHub URL locally to simulate a
            5-stage CI/CD run and container tag without executing remote code or
            requiring API keys.
          </p>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPipelineRunning}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                {isPipelineRunning ? 'Pipeline Running...' : 'Run Pipeline'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
