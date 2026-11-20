import { useEffect, useState } from "react";

export type Route = "inicio" | "encontradas" | "pipeline" | "candidaturas" | "curriculos" | "busca";
const ROUTES: Route[] = ["inicio", "encontradas", "pipeline", "candidaturas", "curriculos", "busca"];

const read = (): Route => {
  const r = window.location.hash.replace(/^#\/?/, "") as Route;
  return ROUTES.includes(r) ? r : "inicio";
};

/** Rotas por hash (#/pipeline): funciona em qualquer hospedagem estática. */
export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return [route, (r) => (window.location.hash = `/${r}`)];
}
