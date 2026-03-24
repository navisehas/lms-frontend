import { NextResponse } from "next/server";

function getBackendBaseUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_URL,
    "http://localhost:5000",
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim()) {
      return candidate.trim().replace(/\/+$/, "");
    }
  }

  return "http://localhost:5000";
}

export async function GET(request) {
  const backendBase = getBackendBaseUrl();
  const backendUrl = `${backendBase}/admin/course-report`;
  const authorization = request.headers.get("authorization");

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const body = await response.arrayBuffer();
    const upstreamType = response.headers.get("content-type") || "";
    const contentType = response.ok
      ? (upstreamType || "application/pdf")
      : (upstreamType || "application/json");
    const contentDisposition = response.headers.get("content-disposition");

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": contentType,
        ...(contentDisposition ? { "content-disposition": contentDisposition } : {}),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cannot reach backend report service." },
      { status: 502 }
    );
  }
}
