import { matchResumes } from "../lib/api";
import { useLoad } from "../lib/useLoad";

/** Mostra qual currículo combina mais com o texto de uma vaga e o que falta em cada um. */
export function MatchPanel({ text, chosenId }: { text: string; chosenId?: string | null }) {
  const { data, error } = useLoad(() => matchResumes(text), [text]);
  if (error) return <div className="alert">{error}</div>;
  if (!data) return <span className="muted">Comparando…</span>;
  if (data.length === 0) return <span className="muted">Cadastre um currículo com texto em Currículos para ver a comparação.</span>;

  return (
    <div className="match">
      {data.map((r, i) => (
        <div key={r.id} className={`match-item${i === 0 ? " best" : ""}`}>
          <div className="match-head">
            <b>{r.name}</b>
            {i === 0 && <span className="badge green">Mais indicado</span>}
            {chosenId === r.id && <span className="badge blue">Usado nesta vaga</span>}
            <span className="match-pct">{r.coverage}%</span>
          </div>
          <div className="match-bar"><i style={{ width: `${r.coverage}%` }} /></div>
          {r.missing.length > 0 && (
            <div className="match-tags">
              <span className="muted">Falta no currículo:</span>
              {r.missing.map((m) => <span key={m} className="badge amber">{m}</span>)}
            </div>
          )}
          {r.matched.length > 0 && (
            <div className="match-tags">
              <span className="muted">Já tem:</span>
              {r.matched.map((m) => <span key={m} className="badge outline">{m}</span>)}
            </div>
          )}
        </div>
      ))}
      <small className="muted">Só adicione ao currículo o que você realmente sabe ou já usou.</small>
    </div>
  );
}
