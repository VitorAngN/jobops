import { describe, expect, it } from "vitest";

import { createSession, validSession } from "./auth.js";

describe("sessão", () => {
  it("aceita token válido e recusa adulterado ou vencido", () => {
    const now = Date.now();
    const { token } = createSession(now);
    expect(validSession(token, now)).toBe(true);
    expect(validSession(token.replace(/.$/, (c) => (c === "a" ? "b" : "a")), now)).toBe(false);
    expect(validSession(`${now + 1e12}.${token.split(".")[1]}`, now)).toBe(false);
    expect(validSession(token, now + 31 * 86_400_000)).toBe(false);
    expect(validSession("lixo", now)).toBe(false);
  });
});
