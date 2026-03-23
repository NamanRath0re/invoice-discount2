// import NextAuth from "next-auth"
// import Credentials from "next-auth/providers/credentials"
// import type { JWT } from "next-auth/jwt"
// import type { Session, User } from "next-auth"

// // ─── JWT payload shape returned by your API ───────────────────────────────────
// interface ApiJwtPayload {
//   user_id: string
//   tenant:  string
//   role:    string
//   iss:     string
//   iat:     number
//   exp:     number
// }

// // ─── API login response shape ─────────────────────────────────────────────────
// interface ApiLoginResponse {
//   success: boolean
//   message: string | null
//   data: {
//     access_token:  string
//     refresh_token: string
//   } | null
// }

// /**
//  * Decode the payload of a JWT without verifying its signature.
//  * We trust the API issued a valid token — we only need the claims.
//  */
// function decodeJwtPayload(token: string): ApiJwtPayload | null {
//   try {
//     const segment = token.split(".")[1]
//     const padded  = segment.replace(/-/g, "+").replace(/_/g, "/")
//     const json    = Buffer.from(padded, "base64").toString("utf8")
//     return JSON.parse(json) as ApiJwtPayload
//   } catch {
//     return null
//   }
// }

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email:    { label: "Email",    type: "email" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials): Promise<User | null> {
//         try {
//           process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // Disable TLS verification for local development  
//           const res = await fetch(`https://192.168.6.6/2013/api/v1/auth/login`, {
//             method:  "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               tenant_code: "demo",
//               email:       credentials.email,
//               password:    credentials.password,
//             }),
//           })
//           // console.log("API response body:", await res.json())
          
//           const body = (await res.json()) as ApiLoginResponse
//           console.log("API response status:", body)
          
//           if (!body.success || !body.data) return null

//           const { access_token, refresh_token } = body.data
//           const payload = decodeJwtPayload(access_token)

//           if (!payload) return null

//           return {
//             id:           payload.user_id,
//             name:         String(credentials.email), // API has no name field at login
//             email:        String(credentials.email),
//             role:         payload.role,
//             tenant:       payload.tenant,
//             accessToken:  access_token,
//             refreshToken: refresh_token,
//           }
//         } catch (err) {
//           console.error("[auth] authorize error:", err)
//           return null
//         }
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },

//   callbacks: {
//     jwt({ token, user }: { token: JWT; user?: User }): JWT {
//       // `user` is only defined on the very first sign-in
//       if (user) {
//         token.id           = user.id           ?? ""
//         token.role         = user.role
//         token.tenant       = user.tenant
//         token.accessToken  = user.accessToken
//         token.refreshToken = user.refreshToken
//       }
//       return token
//     },

//     session({ session, token }: { session: Session; token: JWT }): Session {
//       session.user.id           = token.id
//       session.user.role         = token.role
//       session.user.tenant       = token.tenant
//       session.user.accessToken  = token.accessToken
//       session.user.refreshToken = token.refreshToken
//       return session
//     },
//   },

//   pages: {
//     signIn: "/login",
//   },
// })

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

// ─── Shapes matching the real API response ────────────────────────────────────

export interface ApiMenuItem {
  id:         string
  parent_id:  string | null
  code:       string | null
  name:       string
  route_path: string | null
  icon:       string | null
  sort_order: string
  children:   ApiMenuItem[]
}

interface ApiUser {
  id:   string
  name: string
  role: string
}

interface ApiLoginResponse {
  success: boolean
  message: string
  data: {
    access_token:  string
    refresh_token: string
    user:          ApiUser
    permissions:   string[]
    menu:          ApiMenuItem[]
  } | null
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<User | null> {
        try {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // Disable TLS verification for local development  
          // const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
          const res = await fetch(`https://192.168.6.6/2013/api/v1/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenant_code: process.env.API_TENANT_CODE ?? "demo",
              email:       credentials.email,
              password:    credentials.password,
            }),
          })

          const body = (await res.json()) as ApiLoginResponse

          if (!body.success || !body.data) return null

          const { access_token, refresh_token, user, permissions, menu } = body.data

          return {
            id:           user.id,
            name:         user.name,
            email:        String(credentials.email),
            role:         user.role,
            permissions:  permissions,
            menu:         menu,
            accessToken:  access_token,
            refreshToken: refresh_token,
          }
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }): JWT {
      if (user) {
        token.id           = user.id ?? ""
        token.role         = user.role
        token.permissions  = user.permissions
        token.menu         = user.menu
        token.accessToken  = user.accessToken
        token.refreshToken = user.refreshToken
      }
      return token
    },

    session({ session, token }: { session: Session; token: JWT }): Session {
      session.user.id           = token.id
      session.user.role         = token.role
      session.user.permissions  = token.permissions
      session.user.menu         = token.menu
      session.user.accessToken  = token.accessToken
      session.user.refreshToken = token.refreshToken
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
})
