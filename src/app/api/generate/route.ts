import { NextRequest, NextResponse } from "next/server";
import { generateModFiles } from "@/lib/ai";
import { parseRequest, generateModProject } from "@/lib/modai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, loader, version, author, customPrompt } = body;

    if (!name || !description || !loader || !version || !author) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Try external AI first if key is configured
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      try {
        const files = await generateModFiles({ name, description, loader, version, author, customPrompt: !!customPrompt });
        return NextResponse.json({ files, source: "api" });
      } catch {
        // fall through to local engine
      }
    }

    // Local mod AI engine — no API key needed
    const features = parseRequest(description);
    const files = generateModProject({ name, description, loader, version, author, features });
    return NextResponse.json({ files, source: "local", features: features.map(f => `${f.type}:${f.name}`) });
  } catch (err) {
    console.error("Generation error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
