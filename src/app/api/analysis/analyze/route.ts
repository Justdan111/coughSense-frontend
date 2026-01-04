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

    const formData = await request.formData()
    
    // Log the form data fields for debugging
    console.log("Analysis API Route - FormData fields:", Array.from(formData.keys()))

    const response = await fetch(`${FASTAPI_URL}/api/analysis/analyze`, {
      method: "POST",
      headers: {
        "Authorization": token,
      },
      body: formData,
    })

    const data = await response.json()
    
    // Log response for debugging
    console.log("Analysis API Route - Response status:", response.status)
    if (!response.ok) {
      console.log("Analysis API Route - Error response:", data)
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    )
  }
}
