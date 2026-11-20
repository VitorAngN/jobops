import { describe, expect, it } from "vitest";

import { extractSkills, matchResume, rankResumes } from "./match.js";

describe("comparador de currículo", () => {
  it("reconhece variações e símbolos", () => {
    const names = extractSkills("Experiência com NodeJS, C#, .NET Core, CI/CD e k8s; inglês intermediário").map((s) => s.name);
    expect(names).toEqual(expect.arrayContaining(["Node.js", "C#", ".NET", "CI/CD", "Kubernetes", "Inglês"]));
  });

  it("não acha palavra dentro de outra", () => {
    const names = extractSkills("goiania, typescripts? reactive, javaScript").map((s) => s.name);
    expect(names).not.toContain("Go");
    expect(names).not.toContain("React");
    expect(names).toContain("JavaScript");
    expect(names).not.toContain("Java");
  });

  it("mostra o que falta no currículo", () => {
    const r = matchResume("Buscamos estagiário com Docker, Linux, AWS e Python", "Projetos em Python e Docker");
    expect(r).toEqual({ coverage: 50, matched: ["Python", "Docker"], missing: ["AWS", "Linux"] });
  });

  it("ordena os currículos e ignora os vazios", () => {
    const vaga = "DevOps: Docker, Kubernetes, Terraform, AWS";
    const ranking = rankResumes(vaga, [
      { id: "1", name: "Back-end", content: "Node.js, PostgreSQL, Docker" },
      { id: "2", name: "DevOps", content: "Docker, Kubernetes, Terraform" },
      { id: "3", name: "Sem texto", content: null },
    ]);
    expect(ranking.map((r) => r.name)).toEqual(["DevOps", "Back-end"]);
    expect(ranking[0].coverage).toBe(75);
  });
});
