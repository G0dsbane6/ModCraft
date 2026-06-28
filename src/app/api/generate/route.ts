import { NextRequest, NextResponse } from "next/server";
import { generateModFiles } from "@/lib/ai";
import { parseRequest, generateModProject, generateQuestion } from "@/lib/modai";
import type { ChatMessage } from "@/lib/modai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, loader, version, author } = body;
    const history: ChatMessage[] = body.history || [];
    const customPrompt = body.customPrompt ?? true;

    if (!name || !description || !loader || !version || !author) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Try external AI first if key is configured
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      try {
        const files = await generateModFiles({ name, description, loader, version, author, customPrompt: !!customPrompt });
        return NextResponse.json({ files, source: "api", type: "files" });
      } catch {
        // fall through to local engine
      }
    }

    // Local mod AI engine — check if we need to ask a question
    const question = generateQuestion(history, description, loader);

    if (question) {
      return NextResponse.json({
        type: "question",
        question: question.text,
        options: question.options,
      });
    }

    const features = parseRequest(description);
    const files = generateModProject({ name, description, loader, version, author, features });
    return NextResponse.json({
      type: "files",
      files,
      source: "local",
      features: features.map(f => `${f.type}:${f.name}`),
    });
  } catch (err) {
    console.error("Generation error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
