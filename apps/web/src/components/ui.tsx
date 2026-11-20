import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { initials } from "../lib/format";
import { statusLabels, statusTone } from "../lib/labels";
import type { ApplicationStatus } from "../lib/types";

export function PageHead({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`badge ${statusTone(status)}`}>{statusLabels[status]}</span>;
}

export function Score({ value }: { value?: number | null }) {
  if (value === null || value === undefined) return <span className="muted">—</span>;
  const tone = value >= 70 ? "hi" : value >= 45 ? "mid" : "lo";
  return (
    <span className={`score ${tone}`} title="Compatibilidade com o seu perfil de busca">
      {value}
    </span>
  );
}

export function CompanyAvatar({ name }: { name: string }) {
  return <span className="avatar" aria-hidden>{initials(name) || "?"}</span>;
}

export function Empty({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Skeletons({ n = 3 }: { n?: number }) {
  return (
    <div style={{ display: "grid", gap: 8, padding: 12 }}>
      {Array.from({ length: n }, (_, i) => <div key={i} className="skeleton" />)}
    </div>
  );
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEscape(onClose);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn ghost icon" onClick={onClose} aria-label="Fechar"><X /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  useEscape(onClose);
  return (
    <div className="drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={label}>{children}</aside>
    </div>
  );
}
