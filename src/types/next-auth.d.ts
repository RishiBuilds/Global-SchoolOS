import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    schoolId: string;
    schoolName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      schoolId: string;
      schoolName: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    schoolId: string;
    schoolName: string;
  }
}
