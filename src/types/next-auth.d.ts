import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

// Augmentación de tipos: añadimos id y role a la sesión y al JWT.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
