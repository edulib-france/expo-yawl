import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("expo-crypto", () => {
  let count = 0;
  return {
    randomUUID: () => `test-uuid-${++count}`,
  };
});

import { VISIT_ID_TTL, VisitId } from "./visitId";

describe("VisitId", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a uuid on construction", () => {
    const visitId = new VisitId();
    expect(visitId.value).toMatch(/^test-uuid-\d+$/);
  });

  it("accepts an explicit id on construction", () => {
    const visitId = new VisitId("my-custom-id");
    expect(visitId.value).toBe("my-custom-id");
  });

  it("returns the same id before TTL expires", () => {
    const visitId = new VisitId();
    const first = visitId.value;
    expect(visitId.value).toBe(first);
  });

  it("returns a new id after TTL expires", () => {
    const visitId = new VisitId();
    const first = visitId.value;

    vi.spyOn(Date, "now").mockReturnValue(Date.now() + VISIT_ID_TTL);

    expect(visitId.value).not.toBe(first);
  });

  it("does not rotate id just before TTL expires", () => {
    const visitId = new VisitId();
    const first = visitId.value;

    vi.spyOn(Date, "now").mockReturnValue(Date.now() + VISIT_ID_TTL - 1);

    expect(visitId.value).toBe(first);
  });

  it("generates a new id after reset()", () => {
    const visitId = new VisitId("before-reset");
    visitId.reset();
    // after reset, createdAt is 0 so TTL is exceeded — value rotates to a fresh uuid
    expect(visitId.value).toMatch(/^test-uuid-\d+$/);
  });
});
