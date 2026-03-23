// // Augment next-auth types to include our custom fields.
// // This file must be included in tsconfig "include" — it is, via "**/*.ts".

// declare module "next-auth" {
//   interface User {
//     role:         string
//     tenant:       string
//     accessToken:  string
//     refreshToken: string
//   }

//   interface Session {
//     user: {
//       id:           string
//       name:         string | null
//       email:        string | null
//       image:        string | null
//       role:         string
//       tenant:       string
//       accessToken:  string
//       refreshToken: string
//     }
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id:           string
//     role:         string
//     tenant:       string
//     accessToken:  string
//     refreshToken: string
//   }
// }

// export {}

import type { ApiMenuItem } from "@/auth"

declare module "next-auth" {
  interface User {
    role:         string
    permissions:  string[]
    menu:         ApiMenuItem[]
    accessToken:  string
    refreshToken: string
  }

  interface Session {
    user: {
      id:           string
      name:         string | null
      email:        string | null
      image:        string | null
      role:         string
      permissions:  string[]
      menu:         ApiMenuItem[]
      accessToken:  string
      refreshToken: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:           string
    role:         string
    permissions:  string[]
    menu:         ApiMenuItem[]
    accessToken:  string
    refreshToken: string
  }
}

export {}
