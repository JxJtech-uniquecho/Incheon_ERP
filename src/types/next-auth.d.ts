import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    accountStatus?: string;
    loginId?: string;
    branchId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      accountStatus?: string;
      loginId?: string;
      branchId?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accountStatus?: string;
    loginId?: string;
    branchId?: string | null;
  }
}
