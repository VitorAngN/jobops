import { BriefcaseBusiness, Home, Inbox, KanbanSquare, LogOut, Plus, SlidersHorizontal } from "lucide-react";

import type { Route } from "../lib/router";

const items: { id: Route; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "encontradas", label: "Encontradas", icon: Inbox },
  { id: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { id: "candidaturas", label: "Candidaturas", icon: BriefcaseBusiness },
  { id: "busca", label: "Busca automática", icon: SlidersHorizontal },
];

type Props = {
  route: Route;
  onNavigate: (r: Route) => void;
  onNew: () => void;
  newCount: number;
  onLogout?: () => void;
};

export function Sidebar({ route, onNavigate, onNew, newCount, onLogout }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">J</span>
        JobOps
      </div>
      <button className="btn primary" style={{ marginBottom: 10 }} onClick={onNew}>
        <Plus /> Nova candidatura
      </button>
      <nav>
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} className="nav-item" aria-current={route === id ? "page" : undefined} onClick={() => onNavigate(id)}>
            <Icon />
            {label}
            {id === "encontradas" && newCount > 0 && <span className="nav-count">{newCount}</span>}
          </button>
        ))}
      </nav>
      {onLogout && (
        <div className="sidebar-foot">
          <button className="nav-item" onClick={onLogout}>
            <LogOut /> Sair
          </button>
        </div>
      )}
    </aside>
  );
}
