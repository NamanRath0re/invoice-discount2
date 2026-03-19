import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Mock user database - replace with real database integration
const mockUsers = [
  {
    id: "1",
    email: "dealer@example.com",
    password: "password123",
    entityType: "dealer",
    name: "John Dealer",
  },
  {
    id: "2",
    email: "customer@example.com",
    password: "password123",
    entityType: "customer",
    customerType: "business",
    name: "Jane Customer",
  },
  {
    id: "3",
    email: "individual@example.com",
    password: "password123",
    entityType: "customer",
    customerType: "individual",
    name: "Bob Individual",
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check password (in production, use bcrypt to compare hashed passwords)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Create session token (in production, use a proper JWT or session library)
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        entityType: user.entityType,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    ).toString("base64")

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
