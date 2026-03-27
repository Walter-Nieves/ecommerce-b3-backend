import { Role } from "./enums";

declare global {
  namespace Express {
    interface Locals {
      user: {
        sub?: string;
        role: Role;
      };
    }
  }
}
