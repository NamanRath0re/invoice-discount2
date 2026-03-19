import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

// ─── JWT payload shape returned by your API ───────────────────────────────────
interface ApiJwtPayload {
  user_id: string
  tenant:  string
  role:    string
  iss:     string
  iat:     number
  exp:     number
}

// ─── API login response shape ─────────────────────────────────────────────────
interface ApiLoginResponse {
  success: boolean
  message: string | null
  data: {
    access_token:  string
    refresh_token: string
  } | null
}

/**
 * Decode the payload of a JWT without verifying its signature.
 * We trust the API issued a valid token — we only need the claims.
 */
function decodeJwtPayload(token: string): ApiJwtPayload | null {
  try {
    const segment = token.split(".")[1]
    const padded  = segment.replace(/-/g, "+").replace(/_/g, "/")
    const json    = Buffer.from(padded, "base64").toString("utf8")
    return JSON.parse(json) as ApiJwtPayload
  } catch {
    return null
  }
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
          const res = await fetch(`https://192.168.6.6/2013/api/v1/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenant_code: "demo",
              email:       credentials.email,
              password:    credentials.password,
            }),
          })

          const body = (await res.json()) as ApiLoginResponse

          if (!body.success || !body.data) return null

          const { access_token, refresh_token } = body.data
          const payload = decodeJwtPayload(access_token)

          if (!payload) return null

          return {
            id:           payload.user_id,
            name:         String(credentials.email), // API has no name field at login
            email:        String(credentials.email),
            role:         payload.role,
            tenant:       payload.tenant,
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
      // `user` is only defined on the very first sign-in
      if (user) {
        token.id           = user.id           ?? ""
        token.role         = user.role
        token.tenant       = user.tenant
        token.accessToken  = user.accessToken
        token.refreshToken = user.refreshToken
      }
      return token
    },

    session({ session, token }: { session: Session; token: JWT }): Session {
      session.user.id           = token.id
      session.user.role         = token.role
      session.user.tenant       = token.tenant
      session.user.accessToken  = token.accessToken
      session.user.refreshToken = token.refreshToken
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
})