import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Download,
  Loader2,
  RotateCw,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BuildRecord, BuildStatus } from '../types/cicd';

interface BuildHistoryTableProps {
  builds: BuildRecord[];
  onRerunBuild: (build: BuildRecord) => void;
  isPipelineRunning: boolean;
  compact?: boolean;
}

type StatusFilter = 'All' | 'Passed' | 'Failed';
type SortField = 'buildNumber' | 'durationSeconds';
type SortDirection = 'asc' | 'desc';

function BuildStatusCell({ status }: { status: BuildStatus }) {
  if (status === 'Passed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Passed</span>
      </span>
    );
  }
  if (status === 'Running') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
        <Loader2
          className="w-3.5 h-3.5 shrink-0 animate-spin"
          aria-hidden="true"
        />
        <span>Running</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Failed</span>
    </span>
  );
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export function BuildHistoryTable({
  builds,
  onRerunBuild,
  isPipelineRunning,
  compact = false,
}: BuildHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortField, setSortField] = useState<SortField>('buildNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredBuilds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return builds
      .filter((build) => {
        if (statusFilter !== 'All' && build.status !== statusFilter) {
          return false;
        }
        if (!query) return true;
        return (
          `#${build.buildNumber}`.includes(query) ||
          (build.repositorySlug?.toLowerCase().includes(query) ?? false) ||
          build.commitMessage.toLowerCase().includes(query) ||
          build.branch.toLowerCase().includes(query) ||
          build.targetEnvironment.toLowerCase().includes(query) ||
          build.author.toLowerCase().includes(query) ||
          build.commitSha.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const diff = a[sortField] - b[sortField];
        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [builds, searchQuery, statusFilter, sortField, sortDirection]);

  // Chronological recent builds (up to 10) for the compact duration trend chart
  const trendBuilds = useMemo(() => {
    return [...builds]
      .sort((a, b) => a.buildNumber - b.buildNumber)
      .slice(-10);
  }, [builds]);

  const maxDurationSeconds = useMemo(() => {
    return Math.max(...trendBuilds.map((b) => b.durationSeconds), 180);
  }, [trendBuilds]);

  const averageDurationLabel = useMemo(() => {
    if (trendBuilds.length === 0) return '0m 00s';
    const avgSec = Math.round(
      trendBuilds.reduce((acc, b) => acc + b.durationSeconds, 0) /
        trendBuilds.length
    );
    const mins = Math.floor(avgSec / 60);
    const secs = String(avgSec % 60).padStart(2, '0');
    return `${mins}m ${secs}s`;
  }, [trendBuilds]);

  const selectedBuild =
    filteredBuilds.find((b) => b.id === selectedBuildId) ??
    builds.find((b) => b.id === selectedBuildId) ??
    null;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  const handleExportCsv = () => {
    const headers = [
      'Build Number',
      'Date (UTC)',
      'Branch',
      'Target Environment',
      'Commit SHA',
      'Commit Message',
      'Author',
      'Status',
      'Duration',
      'Image Tag',
      'Data Source',
    ];
    const rows = filteredBuilds.map((b) => [
      `#${b.buildNumber}`,
      b.date,
      b.branch,
      b.targetEnvironment,
      b.commitSha,
      b.commitMessage,
      b.author,
      b.status,
      b.duration,
      b.imageTag,
      'Demonstration Data',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cicd-demo-build-history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const chartWidth = 640;
  const chartHeight = 96;
  const slotWidth =
    trendBuilds.length > 0 ? chartWidth / trendBuilds.length : chartWidth;

  return (
    <section
      aria-labelledby="build-history-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      {/* Header and Filters */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              id="build-history-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Build History
            </h2>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {filteredBuilds.length} of {builds.length} demo builds
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              Avg duration {averageDurationLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Click any build row or chart bar to inspect stage results or re-run
            that build configuration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter build #, branch, env..."
              aria-label="Filter build history"
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Segmented status filter */}
          <div
            role="group"
            aria-label="Filter builds by status"
            className="inline-flex items-center p-1 bg-slate-100 rounded-md"
          >
            {(['All', 'Passed', 'Failed'] as StatusFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === option
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredBuilds.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Build Duration & Outcome Trend Chart */}
      {trendBuilds.length > 0 && (
        <div className="px-5 sm:px-6 py-4 bg-slate-50/60 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
            <span className="font-medium text-slate-700">
              Recent Build Duration Trend (Demo Data)
            </span>
            <div className="flex items-center gap-4 text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs inline-block" />
                Passed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-xs inline-block" />
                Failed
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
              className="w-full h-28 min-w-[420px]"
              role="img"
              aria-label="Bar chart showing duration and pass or fail outcome of recent demonstration builds"
            >
              <line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                className="stroke-slate-200"
                strokeWidth={1}
              />
              {trendBuilds.map((build, idx) => {
                const barWidth = Math.min(34, Math.max(14, slotWidth * 0.45));
                const barHeight = Math.max(
                  10,
                  Math.round(
                    (build.durationSeconds / maxDurationSeconds) *
                      (chartHeight - 18)
                  )
                );
                const x = idx * slotWidth + (slotWidth - barWidth) / 2;
                const y = chartHeight - barHeight;
                const isSelected = selectedBuild?.id === build.id;
                const fillClass =
                  build.status === 'Failed'
                    ? isSelected
                      ? 'fill-red-700'
                      : 'fill-red-500 hover:fill-red-600'
                    : isSelected
                      ? 'fill-emerald-700'
                      : 'fill-emerald-600 hover:fill-emerald-700';

                return (
                  <g
                    key={build.id}
                    onClick={() =>
                      setSelectedBuildId(isSelected ? null : build.id)
                    }
                    className="cursor-pointer"
                  >
                    <title>
                      {`Build #${build.buildNumber} (${build.status}) — ${build.duration} on ${build.branch}`}
                    </title>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={3}
                      className={`transition-colors ${fillClass}`}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="fill-slate-500 font-mono text-[10px]"
                    >
                      {build.duration}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 16}
                      textAnchor="middle"
                      className={`font-mono text-[10px] ${
                        isSelected
                          ? 'fill-slate-900 font-semibold'
                          : 'fill-slate-500'
                      }`}
                    >
                      #{build.buildNumber}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Data Table */}
      {filteredBuilds.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            No matching builds found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Adjust your search query or status filter to view the demonstration
            build records.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                <th scope="col" className="py-3 pl-5 sm:pl-6 pr-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('buildNumber')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Build #</span>
                    <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">
                  Date
                </th>
                {!compact && (
                  <th scope="col" className="py-3 px-4">
                    Branch &amp; Commit
                  </th>
                )}
                <th scope="col" className="py-3 px-4 whitespace-nowrap">
                  Status
                </th>
                <th
                  scope="col"
                  className="py-3 pl-4 pr-5 sm:pr-6 text-right whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('durationSeconds')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    <span>Duration</span>
                    <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredBuilds.map((build) => {
                const isSelected = selectedBuild?.id === build.id;
                return (
                  <tr
                    key={build.id}
                    onClick={() =>
                      setSelectedBuildId(isSelected ? null : build.id)
                    }
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 pl-5 sm:pl-6 pr-4 font-mono text-sm font-medium text-slate-900 tabular-nums whitespace-nowrap">
                      #{build.buildNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {build.date}
                    </td>
                    {!compact && (
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {build.commitMessage}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 font-mono">
                          {build.repositorySlug
                            ? `${build.repositorySlug} · `
                            : ''}
                          {build.branch} · {build.targetEnvironment} ·{' '}
                          {build.commitSha} · {build.author}
                        </p>
                      </td>
                    )}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <BuildStatusCell status={build.status} />
                    </td>
                    <td className="py-3.5 pl-4 pr-5 sm:pr-6 text-right font-mono text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
                      {build.duration}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Build Details Footer */}
      {selectedBuild && (
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div className="space-y-0.5">
            <p className="font-medium text-slate-900">
              Build #{selectedBuild.buildNumber} Summary —{' '}
              {selectedBuild.stageSummary}
            </p>
            <p className="font-mono text-slate-500">
              Commit {selectedBuild.commitSha} on {selectedBuild.branch} ·
              Target: {selectedBuild.targetEnvironment} · Image Tag:{' '}
              {selectedBuild.imageTag}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={isPipelineRunning}
              onClick={() => onRerunBuild(selectedBuild)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-md transition-colors whitespace-nowrap"
            >
              <RotateCw className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Re-run Build</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedBuildId(null)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
