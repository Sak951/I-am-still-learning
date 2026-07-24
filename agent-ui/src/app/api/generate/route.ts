import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
      backendUrl = `http://${backendUrl}`;
    }
    
    // Support Render internal DNS routing on port 10000
    try {
      const urlObj = new URL(backendUrl);
      if (!urlObj.port && !urlObj.hostname.includes(".") && urlObj.hostname !== "localhost") {
        backendUrl = `${backendUrl}:10000`;
      }
    } catch (e) {
      // Fallback on parsing error
    }
    
    // Proxy request to Flask web_demo.py server
    const response = await fetch(`${backendUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: body.prompt,
        temperature: body.temperature ?? 0.8,
        max_length: body.max_length ?? 150,
        top_k: body.top_k ?? 50,
        top_p: body.top_p ?? 0.95,
        repetition_penalty: body.repetition_penalty ?? 1.25,
      }),
      // Set a generous timeout (60s) to allow local CPU inference to complete
      signal: AbortSignal.timeout(60000), 
    });

    if (!response.ok) {
      const errMsg = await response.text();
      return NextResponse.json(
        { error: `Model server returned status ${response.status}: ${errMsg}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ generated_text: data.generated_text });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Inference backend offline. Launch with: python scripts/web_demo.py --checkpoint <path>` },
      { status: 503 }
    );
  }
}
