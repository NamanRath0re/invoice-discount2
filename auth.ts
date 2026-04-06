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
          const res = await fetch(`https://192.168.6.6/www8/2013/api/v1/auth/login`, {
            method:  "POST",
             headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify({
              tenant_code: process.env.API_TENANT_CODE ?? "demo",
              email:       credentials.email,
              password:    credentials.password,
            }),
          })
          
          const text = await res.text();

          const body = JSON.parse(text) as ApiLoginResponse;
          console.log("Login API response:", body)

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
