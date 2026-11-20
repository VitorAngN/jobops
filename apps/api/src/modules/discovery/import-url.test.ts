import { describe, expect, it } from "vitest";

import { assertPublicUrl, parseJobPage } from "./import-url.js";

describe("importar por link", () => {
  it("usa o JSON-LD JobPosting quando existe", () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [{ "@type": "Organization" }, {
        "@type": "JobPosting",
        title: "Estágio em Back-end",
        hiringOrganization: { name: "Acme" },
        employmentType: "INTERN",
        jobLocation: { address: { addressLocality: "Londrina", addressRegion: "PR" } },
        datePosted: "2026-11-10",
        description: "<p>Node.js</p>",
      }],
    })}</script>`;
    expect(parseJobPage(html, "https://acme.gupy.io/jobs/1")).toMatchObject({
      source: "GUPY", title: "Estágio em Back-end", company: "Acme", level: "INTERNSHIP", location: "Londrina, PR", description: "Node.js",
    });
  });

  it("entende JSON-LD escapado como HTML (formato da Gupy)", () => {
    const ld = JSON.stringify({ "@type": "JobPosting", title: "Estágio Dev", hiringOrganization: { name: "PUCPR" }, description: "<p>Java &amp; SQL</p>" })
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    expect(parseJobPage(`<script type="application/ld+json">${ld}</script>`, "https://x.gupy.io/job/1")).toMatchObject({
      title: "Estágio Dev", company: "PUCPR", description: "Java & SQL",
    });
  });

  it("cai para as tags og quando não há JSON-LD", () => {
    const html = `<meta property="og:title" content="Junior Backend Developer"><meta property="og:site_name" content="Beta">`;
    expect(parseJobPage(html, "https://jobs.beta.com/1")).toMatchObject({ source: null, title: "Junior Backend Developer", company: "Beta", level: "JUNIOR" });
  });

  it("recusa endereços locais", () => {
    expect(() => assertPublicUrl("http://localhost:3333/api")).toThrow();
    expect(() => assertPublicUrl("http://192.168.0.1/")).toThrow();
    expect(() => assertPublicUrl("file:///etc/passwd")).toThrow();
    expect(() => assertPublicUrl("https://acme.gupy.io/jobs/1")).not.toThrow();
  });
});
