import { describe, it, expect } from "vitest";

import { yawlApi } from "./api";

describe("API Tests", () => {
  const apiConfig = { apiKey: "test-key", env: "staging" as const };
  const data = { visit: { id: "test-id", visitor_id: "test-visitor-id" } };
  it("should failed when wrong key", async () => {
    const api = yawlApi(apiConfig);
    await expect(api.sendVisit(data)).rejects.toThrowError("Unauthorized");
  });
  it("should send visit", async () => {
    const api = yawlApi({
      ...apiConfig,
      apiKey: "cda712a73aff22114b6f62871697ea15",
    });
    await expect(api.sendVisit(data)).resolves.toMatchObject({
      message: "Ahoy::Visit created",
    });
  });
});
