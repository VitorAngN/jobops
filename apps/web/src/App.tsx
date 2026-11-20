import { Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ApplicationDrawer } from "./components/ApplicationDrawer";
import { ApplicationForm } from "./components/ApplicationForm";
import { Sidebar } from "./components/Sidebar";
import { ToastProvider, useToast } from "./components/Toast";
import { getAuthStatus, listDiscovered, onUnauthorized, session } from "./lib/api";
import { useRoute } from "./lib/router";
import { Applications } from "./pages/Applications";
import { Found } from "./pages/Found";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Pipeline } from "./pages/Pipeline";
import { SearchSettings } from "./pages/SearchSettings";

type AuthState = "checking" | "login" | "open" | "authed";

export default function App() {
  const [auth, setAuth] = useState<AuthState>("checking");

  useEffect(() => {
    onUnauthorized.handler = () => setAuth("login");
    getAuthStatus()
      .then(({ authRequired }) => setAuth(!authRequired ? "open" : session.get() ? "authed" : "login"))
      .catch(() => setAuth(session.get() ? "authed" : "open"));
  }, []);

  if (auth === "checking") return null;
  if (auth === "login") return <Login onDone={() => setAuth("authed")} />;
  return (
    <ToastProvider>
      <Shell onLogout={auth === "authed" ? () => { session.set(null); setAuth("login"); } : undefined} />
    </ToastProvider>
  );
}

function Shell({ onLogout }: { onLogout?: () => void }) {
  const [route, navigate] = useRoute();
  const [menu, setMenu] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [version, setVersion] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const toast = useToast();

  /** Qualquer mudança incrementa a versão; as telas recarregam por ela. */
  const changed = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    listDiscovered("NEW").then((r) => setNewCount(r.counts.NEW ?? 0)).catch(() => {});
  }, [version]);

  const go = (r: typeof route) => { navigate(r); setMenu(false); };

  return (
    <div className={`shell${menu ? " menu-open" : ""}`}>
      <Sidebar route={route} onNavigate={go} onNew={() => { setCreating(true); setMenu(false); }} newCount={newCount} onLogout={onLogout} />
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      <main className="main">
        <div className="topbar">
          <button className="btn ghost icon" aria-label="Menu" onClick={() => setMenu(true)}><Menu /></button>
          JobOps
        </div>
        {route === "inicio" && <Home onNavigate={go} onOpen={setOpenId} version={version} />}
        {route === "encontradas" && <Found onChanged={changed} onOpen={setOpenId} />}
        {route === "pipeline" && <Pipeline onOpen={setOpenId} version={version} onChanged={changed} />}
        {route === "candidaturas" && <Applications onOpen={setOpenId} onNew={() => setCreating(true)} version={version} />}
        {route === "busca" && <SearchSettings onChanged={changed} />}
      </main>

      {openId && <ApplicationDrawer id={openId} onClose={() => setOpenId(null)} onChanged={changed} />}
      {creating && (
        <ApplicationForm
          onClose={() => setCreating(false)}
          onSaved={(a) => { setCreating(false); changed(); toast({ text: "Candidatura criada", action: { label: "Abrir", run: () => setOpenId(a.id) } }); }}
        />
      )}
    </div>
  );
}
