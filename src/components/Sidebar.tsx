import {
  Box,
  GitBranch,
  History,
  Home,
  LayoutDashboard,
  Rocket,
  X,
} from 'lucide-react';
import type { NavigationSection } from '../types/cicd';

interface SidebarProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Project Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline Status', icon: GitBranch },
  { id: 'builds', label: 'Build History', icon: History },
  { id: 'deployments', label: 'Deployment Status', icon: Rocket },
  { id: 'docker', label: 'Docker Image', icon: Box },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const handleSelect = (section: NavigationSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded-sm"
        >
          <span className="block font-display text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap">
            CI/CD Deployment
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">Student DevOps Project</p>
        <p className="leading-relaxed">
          Simulated workflow console · No external APIs or database required
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {navContent}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[82vw] h-full shadow-xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
