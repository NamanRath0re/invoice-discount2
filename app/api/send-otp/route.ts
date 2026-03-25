export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch(
      "http://192.168.6.6/2013/api/v1/kyc/send-otp", // use HTTP
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-tenant-code": "demo",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    return Response.json(data)
  } catch (error) {
    console.error("Proxy error:", error)

    return Response.json(
      { message: "Proxy failed" },
      { status: 500 }
    )
  }
}