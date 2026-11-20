import { useState, type FormEvent } from "react";

import { login } from "../lib/api";

export function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <form className="card" onSubmit={submit}>
        <div className="brand" style={{ padding: 0 }}><span className="brand-mark">J</span>JobOps</div>
        <h1>Entrar</h1>
        {error && <div className="alert" style={{ margin: 0 }}>{error}</div>}
        <label className="field">
          <span>Senha</span>
          <input className="input" type="password" autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="btn primary" disabled={busy || !password}>{busy ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
