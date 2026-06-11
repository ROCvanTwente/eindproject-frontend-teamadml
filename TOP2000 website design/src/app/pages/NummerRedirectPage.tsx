import { Navigate, useParams } from 'react-router-dom';

/** Redirect /nummers/:id → /nummer/:id (veelgebruikte typo in de URL) */
export function NummerRedirectPage() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/nummer/${id ?? ''}`} replace />;
}
