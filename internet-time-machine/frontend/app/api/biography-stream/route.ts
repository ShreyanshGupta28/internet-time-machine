import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  const authHeader = request.headers.get("Authorization");

  if (!domain) {
    return NextResponse.json({ detail: "Domain parameter is required." }, { status: 400 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${backendUrl}/api/v1/biography/${domain}/generate`, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errBody.detail || "Failed to initialize story generation stream." },
        { status: response.status }
      );
    }

    // Prepare standard Server-Sent Events headers
    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    });

    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ detail: "Backend did not return readable stream." }, { status: 500 });
    }

    // Proxy the stream chunks byte-for-byte to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, { headers: responseHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Failed to communicate with biography service." },
      { status: 500 }
    );
  }
}
