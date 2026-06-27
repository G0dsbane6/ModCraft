const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = process.env.OPENAI_API_URL || "https://openrouter.ai/api/v1";

export async function generateModFiles(params: {
  name: string;
  description: string;
  loader: string;
  version: string;
  author: string;
  customPrompt?: boolean;
}): Promise<{ path: string; content: string }[]> {
  if (!API_KEY) {
    throw new Error("OPENAI_API_KEY not set in .env.local");
  }

  const isOpenRouter = API_KEY.startsWith("sk-or-");
  const baseUrl = isOpenRouter ? API_URL : "https://api.openai.com/v1";
  const model = isOpenRouter ? "openai/gpt-4o" : "gpt-4o";

  const pkg = `com.${params.author.toLowerCase().replace(/[^a-z0-9]/g, "")}.${params.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const systemPrompt = `You are a Minecraft modding expert. Generate project files for a ${params.loader} mod.

Output a raw JSON array of objects: each has "path" (relative file path) and "content" (file contents as string).
Do NOT wrap in markdown code blocks. Use Gradle Java 21. Include gradlew + gradlew.bat + gradle wrapper properties.`;

  const userPrompt = `Create a Minecraft ${params.loader} mod "${params.name}" for MC ${params.version} by ${params.author}.
Package: ${pkg}
${params.customPrompt ? `User request:\n${params.description}` : `Description: ${params.description}

Include:
- build.gradle with deps
- settings.gradle
- gradle.properties
- gradle/wrapper/gradle-wrapper.properties
- gradlew, gradlew.bat
- main mod class in src/main/java/
- ${params.loader === "fabric" ? "fabric.mod.json" : params.loader === "neoforge" ? "META-INF/neoforge.mods.toml" : params.loader === "quilt" ? "quilt.mod.json" : params.loader === "paper" ? "plugin.yml" : params.loader === "velocity" ? "velocity-plugin.json" : params.loader === "resource-pack" ? "pack.mcmeta" : "pack.mcmeta"}`}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...(isOpenRouter ? { "HTTP-Referer": "http://localhost:3000", "X-Title": "ModCraft" } : {}),
    },
    body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.3, max_tokens: 4096 }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text.slice(0, 400)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI returned empty response");

  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

export function generateFallbackFiles(params: {
  name: string;
  description: string;
  loader: string;
  version: string;
  author: string;
}): { path: string; content: string }[] {
  const pkg = `com.${params.author.toLowerCase().replace(/[^a-z0-9]/g, "")}.${params.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const className = params.name.replace(/[^a-zA-Z0-9]/g, "");
  const common = [
    { path: "settings.gradle", content: `rootProject.name = "${params.name}"\n` },
    { path: "gradle.properties", content: `org.gradle.jvmargs=-Xmx2g\norg.gradle.parallel=true\n` },
    { path: "gradle/wrapper/gradle-wrapper.properties", content: `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.10-bin.zip\nnetworkTimeout=10000\nvalidateDistributionUrl=true\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\n` },
    { path: "gradlew", content: `#!/bin/sh\n\n# Gradle wrapper script\n"$(cd "$(dirname "$0")" && pwd)"/gradle/wrapper/gradle-wrapper.jar\n` },
    { path: "gradlew.bat", content: `@rem Gradle wrapper script for Windows\n@echo off\n"%JAVA_HOME%/bin/java" -jar "%~dp0/gradle/wrapper/gradle-wrapper.jar" %*\n` },
  ];

  if (params.loader === "fabric") {
    return [...common,
      { path: "build.gradle", content: `plugins {\n\tid 'fabric-loom' version '1.8-SNAPSHOT'\n\tid 'java'\n}\ngroup = '${pkg}'\nversion = '1.0.0'\nrepositories {\n\tmavenCentral()\n\tmaven { url 'https://maven.fabricmc.net/' }\n}\ndependencies {\n\tminecraft 'com.mojang:minecraft:${params.version}'\n\tmappings 'net.fabricmc:yarn:${params.version}+build.1:v2'\n\tmodImplementation 'net.fabricmc:fabric-loader:0.16.9'\n\tmodImplementation 'net.fabricmc.fabric-api:fabric-api:0.110.0+${params.version}'\n}\njava {\n\ttoolchain.languageVersion = JavaLanguageVersion.of(21)\n}\n` },
      { path: "src/main/resources/fabric.mod.json", content: JSON.stringify({ schemaVersion: 1, id: params.name.toLowerCase().replace(/[^a-z0-9]/g, ""), version: "1.0.0", name: params.name, description: params.description, authors: [params.author], license: "MIT", environment: "*", entrypoints: { main: [`${pkg}.${className}`] }, depends: { fabricloader: ">=0.16.0", minecraft: `~${params.version}`, java: ">=21" } }, null, 2) },
      { path: `src/main/java/${pkg.replace(/\./g, "/")}/${className}.java`, content: `package ${pkg};\n\nimport net.fabricmc.api.ModInitializer;\n\npublic class ${className} implements ModInitializer {\n\t@Override\n\tpublic void onInitialize() {\n\t\tSystem.out.println("${params.name} loaded!");\n\t}\n}\n` },
    ];
  }

  if (params.loader === "neoforge") {
    return [...common,
      { path: "build.gradle", content: `plugins {\n\tid 'java'\n\tid 'net.neoforged.moddev' version '2.0.0'\n}\ngroup = '${pkg}'\nversion = '1.0.0'\nneoForge {\n\tversion = '21.4.0-beta'\n\truns { client {} }\n\tmods { "${params.name.toLowerCase().replace(/[^a-z0-9]/g, "")}" { sourceSet sourceSets.main } }\n}\njava { toolchain.languageVersion = JavaLanguageVersion.of(21) }\n` },
      { path: "src/main/resources/META-INF/neoforge.mods.toml", content: `modLoader="javafml"\nloaderVersion="[4,)"\nlicense="MIT"\n[[mods]]\nmodId="${params.name.toLowerCase().replace(/[^a-z0-9]/g, "")}"\nversion="1.0.0"\ndisplayName="${params.name}"\nauthors="${params.author}"\ndescription='''${params.description}'''\n` },
      { path: `src/main/java/${pkg.replace(/\./g, "/")}/${className}.java`, content: `package ${pkg};\n\nimport net.neoforged.fml.common.Mod;\n\n@Mod("${params.name.toLowerCase().replace(/[^a-z0-9]/g, "")}")\npublic class ${className} {\n\tpublic ${className}() {\n\t}\n}\n` },
    ];
  }

  if (params.loader === "paper") {
    return [...common,
      { path: "build.gradle", content: `plugins { id 'java' }\ngroup = '${pkg}'\nversion = '1.0.0'\nrepositories { mavenCentral(); maven { url 'https://repo.papermc.io/repository/maven-public/' } }\ndependencies { compileOnly 'io.papermc.paper:paper-api:${params.version}-R0.1-SNAPSHOT' }\njava { toolchain.languageVersion = JavaLanguageVersion.of(21) }\n` },
      { path: "src/main/resources/plugin.yml", content: `name: ${params.name}\nversion: 1.0.0\nmain: ${pkg}.${className}\napi-version: '${params.version}'\nauthor: ${params.author}\ndescription: ${params.description}\n` },
      { path: `src/main/java/${pkg.replace(/\./g, "/")}/${className}.java`, content: `package ${pkg};\n\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic final class ${className} extends JavaPlugin {\n\t@Override\n\tpublic void onEnable() { getLogger().info("${params.name} enabled!"); }\n}\n` },
    ];
  }

  return common;
}
