import { Menu, Play, Search } from 'lucide-react';
import type { NavigationSection } from '../types/cicd';

interface TopBarProps {
  activeSection: NavigationSection;
  isPipelineRunning: boolean;
  onRunPipeline: () => void;
  onOpenGitHubSearch: () => void;
  onOpenMobileMenu: () => void;
}

const SECTION_TITLES: Record<NavigationSection, string> = {
  home: 'Project Home',
  dashboard: 'Dashboard',
  pipeline: 'Pipeline Status',
  builds: 'Build History',
  deployments: 'Deployment Status',
  docker: 'Docker Image',
};

export function TopBar({
  activeSection,
  isPipelineRunning,
  onRunPipeline,
  onOpenGitHubSearch,
  onOpenMobileMenu,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 lg:h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-700 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline font-medium text-slate-500 whitespace-nowrap shrink-0">
            Automated CI/CD Deployment System
          </span>
          <span
            className="hidden sm:inline text-slate-300 shrink-0"
            aria-hidden="true"
          >
            /
          </span>
          <span className="font-semibold text-slate-900 truncate">
            {SECTION_TITLES[activeSection]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenGitHubSearch}
          title="Paste GitHub URL to run pipeline"
          aria-label="Paste GitHub URL to run pipeline"
          className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors duration-150 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onRunPipeline}
          disabled={isPipelineRunning}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{isPipelineRunning ? 'Running Demo...' : 'Run Demo Pipeline'}</span>
        </button>
      </div>
    </header>
  );
}
