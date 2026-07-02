import { describe, it, expect, vi, beforeEach } from "vitest";

import { yawlApi } from "./api";

describe("API Tests", () => {
  const apiConfig = { apiKey: "test-key", env: "staging" as const };
  const data = { visit: { id: "test-id", visitor_id: "test-visitor-id" } };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fail when wrong key", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );
    const api = yawlApi(apiConfig);
    await expect(api.sendVisit(data)).rejects.toThrowError("Unauthorized");
  });

  it("should send visit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Ahoy::Visit created" }), {
        status: 200,
      })
    );
    const api = yawlApi(apiConfig);
    await expect(api.sendVisit(data)).resolves.toMatchObject({
      message: "Ahoy::Visit created",
    });
  });
});
