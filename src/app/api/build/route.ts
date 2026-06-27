import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

const WRAPPER_JAR_URL = "https://github.com/gradle/gradle/raw/v8.10.0/gradle/wrapper/gradle-wrapper.jar";

async function ensureGradleWrapper(tmpDir: string) {
  const jarPath = path.join(tmpDir, "gradle", "wrapper", "gradle-wrapper.jar");
  if (fs.existsSync(jarPath)) return;
  fs.mkdirSync(path.dirname(jarPath), { recursive: true });
  const res = await fetch(WRAPPER_JAR_URL);
  if (!res.ok) throw new Error(`Failed to download gradle-wrapper.jar (HTTP ${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(jarPath, buffer);
}

export async function POST(req: NextRequest) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "modcraft-"));
  try {
    const { name, files, loader } = await req.json();
    if (!name || !files?.length) {
      return NextResponse.json({ error: "No files to build" }, { status: 400 });
    }

    for (const f of files) {
      const fp = path.join(tmpDir, f.path);
      fs.mkdirSync(path.dirname(fp), { recursive: true });
      fs.writeFileSync(fp, f.content);
    }

    const hasGradle = files.some((f: { path: string }) => f.path === "gradlew");
    const hasBedrockBp = files.some((f: { path: string }) => f.path.includes("_BP/manifest.json"));
    const isNonGradle = !hasGradle;

    if (isNonGradle) {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const f of files) zip.file(f.path, f.content);

      if (hasBedrockBp) {
        const blob = await zip.generateAsync({ type: "base64" });
        return NextResponse.json({ jar: blob, jarName: `${name.replace(/[^a-zA-Z0-9]/g, "_")}.mcaddon` });
      }

      const blob = await zip.generateAsync({ type: "base64" });
      return NextResponse.json({ jar: blob, jarName: `${name.replace(/[^a-zA-Z0-9]/g, "_")}.jar` });
    }

    const gradlew = path.join(tmpDir, "gradlew");
    if (fs.existsSync(gradlew)) {
      fs.chmodSync(gradlew, 0o755);
    }

    try {
      await ensureGradleWrapper(tmpDir);
      execSync(`cd "${tmpDir}" && ./gradlew build --no-daemon 2>&1`, {
        timeout: 180_000,
        maxBuffer: 10 * 1024 * 1024,
        shell: "/bin/zsh",
      });
    } catch (buildErr) {
      const stderr = buildErr instanceof Error ? buildErr.message : "";
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const f of files) zip.file(f.path, f.content);
      const blob = await zip.generateAsync({ type: "base64" });
      return NextResponse.json({ zip: blob, buildError: stderr.slice(0, 2000), note: "Build failed — ZIP with source returned" });
    }

    const libDir = path.join(tmpDir, "build", "libs");
    const jars = fs.existsSync(libDir)
      ? fs.readdirSync(libDir).filter(f => f.endsWith(".jar") && !f.endsWith("-sources.jar"))
      : [];

    if (jars.length === 0) {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const f of files) zip.file(f.path, f.content);
      const blob = await zip.generateAsync({ type: "base64" });
      return NextResponse.json({ zip: blob, note: "No JAR produced — ZIP returned" });
    }

    const jarPath = path.join(libDir, jars[0]);
    const jarBuffer = fs.readFileSync(jarPath);
    const base64 = jarBuffer.toString("base64");

    return NextResponse.json({
      jar: base64,
      jarName: jars[0],
      note: null,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Build failed" }, { status: 500 });
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
