import { NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")

    if (!token) {
      return NextResponse.json(
        { detail: "Unauthorized" },
        { status: 401 }
      )
    }

    const payload = await request.json()
    console.log("Assess payload:", payload)

    const response = await fetch(`${FASTAPI_URL}/api/analysis/assess`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log("FastAPI response:", { status: response.status, data: JSON.stringify(data, null, 2) })

    if (!response.ok) {
      console.error("FastAPI error details:", data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Assessment error:", error)
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    )
  }
}
