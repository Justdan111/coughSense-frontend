import { NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")

    if (!token) {
      return NextResponse.json(
        { detail: "Unauthorized" },
        { status: 401 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": token,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    )
  }
}
