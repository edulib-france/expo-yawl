import { generateUUID } from "./generateUUID";

export const VISIT_ID_TTL = 30 * 60 * 1000;

export class VisitId {
  private id: string;
  private createdAt: number;

  constructor(id = generateUUID()) {
    this.id = id;
    this.createdAt = Date.now();
  }

  get value(): string {
    if (Date.now() - this.createdAt >= VISIT_ID_TTL) {
      this.id = generateUUID();
      this.createdAt = Date.now();
    }
    return this.id;
  }

  reset() {
    this.id = "";
    this.createdAt = 0;
  }
}
