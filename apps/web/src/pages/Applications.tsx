import { BriefcaseBusiness, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { CompanyAvatar, Empty, PageHead, Score, Skeletons, StatusBadge } from "../components/ui";
import { listApplications } from "../lib/api";
import { relativeDate, shortDate } from "../lib/format";
import { areaLabels, levelLabels, statusLabels, workModeLabels } from "../lib/labels";
import type { ApplicationArea, ApplicationFilters, ApplicationStatus } from "../lib/types";
import { useLoad } from "../lib/useLoad";

type Props = { onOpen: (id: string) => void; onNew: () => void; version: number };

export function Applications({ onOpen, onNew, version }: Props) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState<ApplicationFilters>({ page: 1, pageSize: 25, sortBy: "updatedAt", sortOrder: "desc" });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const query = { ...filters, search: debounced || undefined };
  const { data, error, loading } = useLoad(() => listApplications(query), [JSON.stringify(query), version]);
  const set = (patch: ApplicationFilters) => setFilters((f) => ({ ...f, page: 1, ...patch }));

  return (
    <div className="page">
      <PageHead title="Candidaturas" subtitle={data ? `${data.meta.total} no total` : undefined} />

      <div className="toolbar">
        <div className="search">
          <Search />
          <input className="input" placeholder="Buscar vaga ou empresa" value={search} onChange={(e) => { setSearch(e.target.value); set({}); }} />
        </div>
        <select className="select" value={filters.status ?? ""} onChange={(e) => set({ status: e.target.value as ApplicationStatus | "" })}>
          <option value="">Todos os status</option>
          {(Object.keys(statusLabels) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
        <select className="select" value={filters.area ?? ""} onChange={(e) => set({ area: e.target.value as ApplicationArea | "" })}>
          <option value="">Todas as áreas</option>
          {(Object.keys(areaLabels) as ApplicationArea[]).map((a) => <option key={a} value={a}>{areaLabels[a]}</option>)}
        </select>
        <select className="select" value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(":") as [ApplicationFilters["sortBy"], ApplicationFilters["sortOrder"]];
          set({ sortBy, sortOrder });
        }}>
          <option value="updatedAt:desc">Atualizadas recentemente</option>
          <option value="appliedAt:desc">Aplicadas recentemente</option>
          <option value="fitScore:desc">Maior compatibilidade</option>
          <option value="companyName:asc">Empresa (A–Z)</option>
        </select>
      </div>

      {error && <div className="alert">{error}</div>}
      <section className="card">
        {loading && !data ? <Skeletons n={5} /> : data?.data.length === 0 ? (
          <Empty icon={<BriefcaseBusiness />} title="Nenhuma candidatura" action={<button className="btn primary" onClick={onNew}>Adicionar</button>}>
            Aprove vagas em Encontradas ou adicione uma colando o link.
          </Empty>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Vaga</th><th>Status</th><th>Nível</th><th>Modalidade</th><th>Nota</th><th>Aplicou</th><th>Atualizada</th></tr>
                </thead>
                <tbody>
                  {data?.data.map((a) => (
                    <tr key={a.id} onClick={() => onOpen(a.id)}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 240 }}>
                          <CompanyAvatar name={a.company.name} />
                          <div className="row-main"><div className="row-title">{a.title}</div><div className="row-sub">{a.company.name}</div></div>
                        </div>
                      </td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>{levelLabels[a.level]}</td>
                      <td>{workModeLabels[a.workMode]}</td>
                      <td><Score value={a.fitScore} /></td>
                      <td className="muted">{shortDate(a.appliedAt)}</td>
                      <td className="muted">{relativeDate(a.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data && data.meta.totalPages > 1 && (
              <div className="pager">
                <span>Página {data.meta.page} de {data.meta.totalPages}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn sm icon" disabled={!data.meta.hasPreviousPage} onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))} aria-label="Anterior"><ChevronLeft /></button>
                  <button className="btn sm icon" disabled={!data.meta.hasNextPage} onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))} aria-label="Próxima"><ChevronRight /></button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
