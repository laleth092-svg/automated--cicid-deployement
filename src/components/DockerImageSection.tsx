import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { DockerImageInfo } from '../types/cicd';

interface DockerImageSectionProps {
  image: DockerImageInfo;
}

type DockerTab = 'layers' | 'dockerfile' | 'workflow';

export function DockerImageSection({ image }: DockerImageSectionProps) {
  const [activeTab, setActiveTab] = useState<DockerTab>('layers');
  const [copiedKey, setCopiedKey] = useState<'pull' | 'snippet' | null>(null);

  const pullCommand = `docker pull ${image.repository}:${image.tag}`;

  const handleCopy = async (text: string, key: 'pull' | 'snippet') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <section
      aria-labelledby="docker-image-heading"
      className="bg-white border border-slate-200 rounded-lg"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2
              id="docker-image-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Docker Image Information
            </h2>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-mono text-slate-600 tabular-nums">
              Build #{image.buildNumber}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Container artifact metadata, layer breakdown, multi-stage
            Dockerfile, and starter CI/CD workflow YAML.
          </p>
        </div>

        {/* Interactive tab selector */}
        <div
          role="tablist"
          aria-label="Docker image detail views"
          className="inline-flex items-center p-1 bg-slate-100 rounded-md self-start lg:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'layers'}
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'layers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Image Layers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dockerfile'}
            onClick={() => setActiveTab('dockerfile')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dockerfile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dockerfile
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'workflow'}
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'workflow'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CI/CD Workflow
          </button>
        </div>
      </div>

      {/* Metadata Definition Grid */}
      <dl className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 border-b border-slate-200">
        <div>
          <dt className="text-xs text-slate-500">Repository &amp; Tag</dt>
          <dd className="mt-1 font-mono text-sm font-semibold text-slate-900 break-all">
            {image.repository}:{image.tag}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">Image Digest (Sample)</dt>
          <dd
            className="mt-1 font-mono text-xs text-slate-700 truncate"
            title={image.digest}
          >
            {image.digest}
          </dd>
          <dd className="mt-0.5 text-xs text-slate-500">{image.registry}</dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">Size &amp; Platform</dt>
          <dd className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums">
            {image.totalSizeMb.toFixed(1)} MB
          </dd>
          <dd className="mt-0.5 font-mono text-xs text-slate-500">
            {image.architecture} · {image.os}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">Sample Security Scan</dt>
          <dd className="mt-1 font-mono text-xs text-slate-800 tabular-nums">
            <span className="font-semibold text-emerald-700">
              {image.vulnerabilities.critical} Critical
            </span>
            <span className="mx-1.5 text-slate-300">/</span>
            <span className="font-semibold text-emerald-700">
              {image.vulnerabilities.high} High
            </span>
          </dd>
          <dd className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums">
            {image.vulnerabilities.medium} Medium · {image.vulnerabilities.low}{' '}
            Low
          </dd>
        </div>
      </dl>

      {/* Pull Command Bar */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs text-slate-500 mr-2">
            Sample Pull Command:
          </span>
          <code className="font-mono text-xs text-slate-900 break-all">
            {pullCommand}
          </code>
        </div>
        <button
          type="button"
          onClick={() => handleCopy(pullCommand, 'pull')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          {copiedKey === 'pull' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy Command</span>
            </>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'layers' && (
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Layer Size Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              Base: {image.baseImage} · Pushed {image.pushedAt}
            </span>
          </div>

          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {image.layers.map((layer) => {
              const ratio = layer.sizeMb / image.totalSizeMb;
              const barWidthClass =
                ratio >= 0.6
                  ? 'w-2/3'
                  : ratio >= 0.35
                    ? 'w-2/5'
                    : ratio >= 0.15
                      ? 'w-1/5'
                      : ratio >= 0.08
                        ? 'w-1/6'
                        : 'w-2';
              return (
                <div
                  key={layer.id}
                  className="py-3 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center"
                >
                  <div className="md:col-span-6 font-mono text-xs text-slate-800 break-all">
                    {layer.instruction}
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-blue-700 rounded-full ${barWidthClass}`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4 text-xs">
                    <span className="text-slate-500">
                      {layer.cached ? 'Cached' : 'Rebuilt'}
                    </span>
                    <span className="font-mono font-medium text-slate-900 tabular-nums">
                      {layer.sizeMb.toFixed(1)} MB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'dockerfile' && (
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Multi-Stage Dockerfile Reference
              </h3>
              <p className="text-xs text-slate-500">
                Builds React + Vite static assets and serves via Nginx Alpine
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(image.dockerfilePreview, 'snippet')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap"
            >
              {copiedKey === 'snippet' ? (
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
                  <span>Copy Dockerfile</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-md p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <code>{image.dockerfilePreview}</code>
          </pre>
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Starter GitHub Actions Workflow (.github/workflows/ci-cd.yml)
              </h3>
              <p className="text-xs text-slate-500">
                Maps directly to the 5 stages demonstrated in this application
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(image.githubActionsPreview, 'snippet')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap"
            >
              {copiedKey === 'snippet' ? (
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
                  <span>Copy Workflow</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-md p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <code>{image.githubActionsPreview}</code>
          </pre>
        </div>
      )}
    </section>
  );
}
