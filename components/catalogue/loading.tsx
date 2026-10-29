export function LoadingState() {
  return <div className="shell loading-layout" role="status" aria-live="polite" aria-busy="true"><p>Loading offers…</p><div className="skeleton loading-title" aria-hidden="true"/>{[1,2,3].map(n=><div key={n} className="skeleton loading-row" aria-hidden="true"/>)}</div>;
}
