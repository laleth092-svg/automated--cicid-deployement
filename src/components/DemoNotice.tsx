import { Info } from 'lucide-react';

interface DemoNoticeProps {
  compact?: boolean;
}

export function DemoNotice({ compact = false }: DemoNoticeProps) {
  return (
    <div
      role="note"
      aria-label="Demonstration data notice"
      className={`flex items-start gap-3 border border-slate-200 bg-white rounded-lg text-slate-600 ${
        compact ? 'px-4 py-2.5 text-xs' : 'px-4 py-3 text-sm'
      }`}
    >
      <Info
        className="w-4 h-4 text-blue-700 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <p className="leading-relaxed">
        <span className="font-semibold text-slate-900">Demonstration Data:</span>{' '}
        All pipeline runs, build history entries, deployment environments, and
        Docker image records shown in this application are simulated sample data
        for a student DevOps engineering project and do not reflect a live
        production server.
      </p>
    </div>
  );
}
