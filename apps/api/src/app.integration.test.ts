import { AddressInfo } from "node:net";
import { describe, expect, it, beforeAll, afterAll } from "vitest";

import { app } from "./app.js";

let baseUrl: string;
let server: ReturnType<typeof app.listen>;

describe("API integration", () => {
  beforeAll(async () => {
    server = app.listen(0);

    await new Promise<void>((resolve) => {
      server.once("listening", resolve);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/api`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  it("returns health status", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as { status: string; service: string };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      service: "jobops-api",
    });
  });

  it("returns validation errors before touching persistence", async () => {
    const response = await fetch(`${baseUrl}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName: "",
        title: "",
      }),
    });
    const body = (await response.json()) as { error: string; issues: unknown[] };

    expect(response.status).toBe(400);
    expect(body.error).toBe("ValidationError");
    expect(body.issues.length).toBeGreaterThan(0);
  });
});
