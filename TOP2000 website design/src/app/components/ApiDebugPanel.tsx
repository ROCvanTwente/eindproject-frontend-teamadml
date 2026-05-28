import type { ApiEndpointDiagnostic } from '../data/api';

const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

type ApiDebugPanelProps = {
  title: string;
  diagnostic: ApiEndpointDiagnostic;
  itemCount: number;
  loadedAt?: string;
};

export function ApiDebugPanel({ title, diagnostic, itemCount, loadedAt }: ApiDebugPanelProps) {
  if (!isDevelopment) {
    return null;
  }

  return (
    <details className="mt-8 rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
      <summary className="cursor-pointer font-semibold text-foreground">
        {title}
      </summary>
      <div className="mt-3 space-y-2">
        <p><span className="font-medium text-foreground">Endpoint:</span> {diagnostic.url}</p>
        <p><span className="font-medium text-foreground">Status:</span> {diagnostic.ok ? `OK${diagnostic.status ? ` (${diagnostic.status})` : ''}` : `Fout${diagnostic.status ? ` (${diagnostic.status})` : ''}`}</p>
        <p><span className="font-medium text-foreground">Detail:</span> {diagnostic.detail}</p>
        <p><span className="font-medium text-foreground">Items:</span> {itemCount}</p>
        {loadedAt && (
          <p><span className="font-medium text-foreground">Laatst geladen:</span> {new Date(loadedAt).toLocaleString('nl-NL')}</p>
        )}
      </div>
    </details>
  );
}