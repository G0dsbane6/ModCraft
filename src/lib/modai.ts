type Feature = {
  type: "item" | "block" | "tool" | "armor" | "food" | "weapon" | "ore" | "plant" | "mob" | "recipe" | "creative_tab";
  name: string;
  id: string;
  props: Record<string, string>;
};

const FEATURE_KEYWORDS: { keyword: string; type: Feature["type"] }[] = [
  { keyword: "sword", type: "weapon" }, { keyword: "axe", type: "tool" }, { keyword: "pickaxe", type: "tool" }, { keyword: "shovel", type: "tool" }, { keyword: "hoe", type: "tool" },
  { keyword: "helmet", type: "armor" }, { keyword: "chestplate", type: "armor" }, { keyword: "leggings", type: "armor" }, { keyword: "boots", type: "armor" },
  { keyword: "food", type: "food" }, { keyword: "eat", type: "food" },
  { keyword: "ore", type: "ore" }, { keyword: "block", type: "block" }, { keyword: "plant", type: "plant" }, { keyword: "tree", type: "plant" },
  { keyword: "mob", type: "mob" }, { keyword: "entity", type: "mob" }, { keyword: "recipe", type: "recipe" }, { keyword: "craft", type: "recipe" },
  { keyword: "tab", type: "creative_tab" }, { keyword: "group", type: "creative_tab" },
];

export function parseRequest(text: string): Feature[] {
  const features: Feature[] = [];
  const lower = text.toLowerCase();

  const found = new Set<Feature["type"]>();
  for (const { keyword, type } of FEATURE_KEYWORDS) {
    if (lower.includes(keyword) && !found.has(type)) {
      found.add(type);
      const name = extractName(text, keyword);
      features.push({ type, name, id: name.toLowerCase().replace(/[^a-z0-9_]/g, "_"), props: {} });
    }
  }

  if (features.length === 0) {
    features.push({ type: "item", name: text.match(/(\w+\s?\w+)/)?.[1]?.trim() || "CustomItem", id: "custom_item", props: {} });
  }

  return features;
}

function extractName(text: string, keyword: string): string {
  const patterns = [
    new RegExp(`(?:a|an|the)?\\s*(\\w+)\\s+${keyword}`, "i"),
    new RegExp(`${keyword}\\s+(?:called|named)?\\s*(\\w+)`, "i"),
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].charAt(0).toUpperCase() + m[1].slice(1);
  }
  return keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function generateModProject(params: {
  name: string;
  description: string;
  loader: string;
  version: string;
  author: string;
  features: Feature[];
}): { path: string; content: string }[] {
  const { name, description, loader, version, author, features } = params;
  const modId = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const pkg = `com.${author.toLowerCase().replace(/[^a-z0-9]/g, "")}.${modId}`;
  const pkgPath = pkg.replace(/\./g, "/");
  const clsName = name.replace(/[^a-zA-Z0-9]/g, "");

  const files: { path: string; content: string }[] = [];

  // --- shared gradle files ---
  files.push({ path: "settings.gradle", content: `rootProject.name = "${name}"\n` });
  files.push({ path: "gradle.properties", content: `org.gradle.jvmargs=-Xmx2g\norg.gradle.parallel=true\n` });
  files.push({ path: "gradle/wrapper/gradle-wrapper.properties", content: `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.10-bin.zip\nnetworkTimeout=10000\nvalidateDistributionUrl=true\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\n` });
  files.push({ path: "gradlew", content: `#!/bin/sh\n\nPRG="$0"\nwhile [ -h "$PRG" ] ; do PRG=$(readlink "$PRG"); done\ncd $(dirname "$PRG")\njava -jar gradle/wrapper/gradle-wrapper.jar "$@"\n` });
  files.push({ path: "gradlew.bat", content: `@rem Gradle wrapper\n@echo off\n"%JAVA_HOME%/bin/java" -jar "%~dp0/gradle/wrapper/gradle-wrapper.jar" %*\n` });

  // --- loader-specific build + metadata ---
  if (loader === "fabric") {
    files.push({ path: "build.gradle", content: `plugins {\n\tid 'fabric-loom' version '1.8-SNAPSHOT'\n\tid 'java'\n}\ngroup = '${pkg}'\nversion = '1.0.0'\nrepositories { mavenCentral(); maven { url 'https://maven.fabricmc.net/' } }\ndependencies {\n\tminecraft 'com.mojang:minecraft:${version}'\n\tmappings 'net.fabricmc:yarn:${version}+build.1:v2'\n\tmodImplementation 'net.fabricmc:fabric-loader:0.16.9'\n\tmodImplementation 'net.fabricmc.fabric-api:fabric-api:0.110.0+${version}'\n}\njava { toolchain.languageVersion = JavaLanguageVersion.of(21) }\n` });
    const entrypoints = [`${pkg}.${clsName}`];
    const depends: Record<string, string> = { fabricloader: ">=0.16.0", minecraft: `~${version}`, java: ">=21" };
    files.push({ path: "src/main/resources/fabric.mod.json", content: JSON.stringify({ schemaVersion: 1, id: modId, version: "1.0.0", name, description, authors: [author], license: "MIT", environment: "*", entrypoints: { main: entrypoints }, depends }, null, 2) });
    files.push({ path: `src/main/java/${pkgPath}/${clsName}.java`, content: `package ${pkg};\n\nimport net.fabricmc.api.ModInitializer;\nimport net.fabricmc.fabric.api.itemgroup.v1.ItemGroupEvents;\nimport net.minecraft.item.ItemGroup;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\n\npublic class ${clsName} implements ModInitializer {\n\tpublic static final Logger LOGGER = LoggerFactory.getLogger("${modId}");\n\tpublic static final String MOD_ID = "${modId}";\n\n\t@Override\n\tpublic void onInitialize() {\n\t\tModItems.register();\n\t\tModBlocks.register();\n\t\tLOGGER.info("${name} initialized!");\n\t}\n}\n` });
    files.push({ path: `src/main/java/${pkgPath}/ModItems.java`, content: generateItemsFabric(pkg, pkgPath, modId, features) });
    files.push({ path: `src/main/java/${pkgPath}/ModBlocks.java`, content: generateBlocksFabric(pkg, pkgPath, modId, features) });
  } else if (loader === "neoforge") {
    files.push({ path: "build.gradle", content: `plugins { id 'java'; id 'net.neoforged.moddev' version '2.0.0' }\ngroup = '${pkg}'\nversion = '1.0.0'\nneoForge { version = '21.4.0-beta'; runs { client {} }; mods { "${modId}" { sourceSet sourceSets.main } } }\ndependencies { }\njava { toolchain.languageVersion = JavaLanguageVersion.of(21) }\n` });
    files.push({ path: "src/main/resources/META-INF/neoforge.mods.toml", content: `modLoader="javafml"\nloaderVersion="[4,)"\nlicense="MIT"\n[[mods]]\nmodId="${modId}"\nversion="1.0.0"\ndisplayName="${name}"\nauthors="${author}"\ndescription='''${description}'''\n` });
    files.push({ path: `src/main/java/${pkgPath}/${clsName}.java`, content: `package ${pkg};\n\nimport net.neoforged.bus.api.IEventBus;\nimport net.neoforged.fml.common.Mod;\n\n@Mod("${modId}")\npublic class ${clsName} {\n\tpublic ${clsName}(IEventBus bus) {\n\t\tModItems.ITEMS.register(bus);\n\t\tModBlocks.BLOCKS.register(bus);\n\t}\n}\n` });
    files.push({ path: `src/main/java/${pkgPath}/ModItems.java`, content: generateItemsNeo(pkg, pkgPath, modId, features) });
    files.push({ path: `src/main/java/${pkgPath}/ModBlocks.java`, content: generateBlocksNeo(pkg, pkgPath, modId, features) });
  } else if (loader === "paper") {
    files.push({ path: "build.gradle", content: `plugins { id 'java' }\ngroup = '${pkg}'\nversion = '1.0.0'\nrepositories { mavenCentral(); maven { url 'https://repo.papermc.io/repository/maven-public/' } }\ndependencies { compileOnly 'io.papermc.paper:paper-api:${version}-R0.1-SNAPSHOT' }\njava { toolchain.languageVersion = JavaLanguageVersion.of(21) }\n` });
    files.push({ path: "src/main/resources/plugin.yml", content: `name: ${name}\nversion: 1.0.0\nmain: ${pkg}.${clsName}\napi-version: '${version}'\nauthor: ${author}\ndescription: ${description}\n` });
    files.push({ path: `src/main/java/${pkgPath}/${clsName}.java`, content: `package ${pkg};\n\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic final class ${clsName} extends JavaPlugin {\n\t@Override\n\tpublic void onEnable() { getLogger().info("${name} enabled!"); }\n\t@Override\n\tpublic void onDisable() { getLogger().info("${name} disabled!"); }\n}\n` });
  } else if (loader === "quilt") {
    files.push({ path: "build.gradle", content: `plugins { id 'org.quiltmc.loom' version '1.7.+' }\ngroup = '${pkg}'\nversion = '1.0.0'\nrepositories { mavenCentral(); maven { url 'https://maven.quiltmc.org/repository/release/' } }\ndependencies {\n\tminecraft 'com.mojang:minecraft:${version}'\n\tmappings 'org.quiltmc:quilt-mappings:${version}+build.1:v2'\n\tmodImplementation 'org.quiltmc:quilt-loader:0.26.0'\n}\njava { toolchain.languageVersion = JavaLanguageVersion.of(21) }\n` });
    files.push({ path: "src/main/resources/quilt.mod.json", content: JSON.stringify({ schemaVersion: 1, id: modId, version: "1.0.0", name, description, authors: [{ name: author }], license: "MIT", environment: "*", entrypoints: { init: [`${pkg}.${clsName}`] }, depends: { "quilt_loader": ">=0.26.0", "minecraft": `~${version}` } }, null, 2) });
    files.push({ path: `src/main/java/${pkgPath}/${clsName}.java`, content: `package ${pkg};\n\nimport org.quiltmc.loader.api.ModContainer;\nimport org.quiltmc.qsl.base.api.entrypoint.ModInitializer;\n\npublic class ${clsName} implements ModInitializer {\n\t@Override\n\tpublic void onInitialize(ModContainer mod) { System.out.println("${name} loaded!"); }\n}\n` });
  } else if (loader === "resource-pack") {
    files.push({ path: "pack.mcmeta", content: JSON.stringify({ pack: { pack_format: 42, description } }, null, 2) });
    files.push({ path: `assets/${modId}/lang/en_us.json`, content: JSON.stringify({ [`pack.${modId}.name`]: name }, null, 2) });
  } else if (loader === "datapack") {
    files.push({ path: "pack.mcmeta", content: JSON.stringify({ pack: { pack_format: 48, description } }, null, 2) });
    files.push({ path: `data/${modId}/functions/hello.mcfunction`, content: `say ${name} loaded!\n` });
  }

  return files;
}

function generateItemsFabric(pkg: string, pkgPath: string, modId: string, features: Feature[]): string {
  let code = `package ${pkg};\n\nimport net.minecraft.item.*;\nimport net.minecraft.registry.*;\nimport net.minecraft.util.Identifier;\n\npublic class ModItems {\n`;
  code += `\tpublic static final ItemGroup TAB = ItemGroup.Builder.create(null, -1).displayName(Text.literal("${modId}")).icon(() -> new ItemStack(Items.DIAMOND)).build();\n\n`;
  for (const f of features) {
    const id = f.id;
    if (f.type === "item" || f.type === "food") {
      const food = f.type === "food" ? `.food(new FoodComponent.Builder().hunger(6).saturationModifier(0.6f).build())` : "";
      code += `\tpublic static final Item ${id.toUpperCase()} = new Item(new Item.Settings().maxCount(64)${food});\n`;
    } else if (f.type === "weapon") {
      code += `\tpublic static final Item ${id.toUpperCase()} = new SwordItem(ToolMaterials.DIAMOND, 5, -2.4f, new Item.Settings().maxCount(1));\n`;
    } else if (f.type === "tool") {
      code += `\tpublic static final Item ${id.toUpperCase()} = new PickaxeItem(ToolMaterials.DIAMOND, 3, -2.8f, new Item.Settings().maxCount(1));\n`;
    }
  }
  code += `\n\tpublic static void register() {\n`;
  for (const f of features) {
    code += `\t\tRegistry.register(Registries.ITEM, Identifier.of("${modId}", "${f.id}"), ${f.id.toUpperCase()});\n`;
  }
  code += `\t}\n}\n`;
  return code;
}

function generateBlocksFabric(pkg: string, pkgPath: string, modId: string, features: Feature[]): string {
  const blocks = features.filter(f => f.type === "block" || f.type === "ore");
  if (blocks.length === 0) {
    return `package ${pkg};\n\npublic class ModBlocks {\n\tpublic static void register() {}\n}\n`;
  }
  let code = `package ${pkg};\n\nimport net.minecraft.block.*;\nimport net.minecraft.registry.*;\nimport net.minecraft.util.Identifier;\n\npublic class ModBlocks {\n`;
  for (const f of blocks) {
    const hardness = f.type === "ore" ? "3.0f" : "2.0f";
    code += `\tpublic static final Block ${f.id.toUpperCase()} = new Block(AbstractBlock.Settings.create().strength(${hardness}).requiresTool());\n`;
  }
  code += `\n\tpublic static void register() {\n`;
  for (const f of blocks) {
    code += `\t\tRegistry.register(Registries.BLOCK, Identifier.of("${modId}", "${f.id}"), ${f.id.toUpperCase()});\n`;
  }
  code += `\t}\n}\n`;
  return code;
}

function generateItemsNeo(pkg: string, pkgPath: string, modId: string, features: Feature[]): string {
  let code = `package ${pkg};\n\nimport net.minecraft.world.item.*;\nimport net.neoforged.neoforge.registries.DeferredItem;\nimport net.neoforged.neoforge.registries.DeferredRegister;\nimport net.minecraft.core.registries.Registries;\n\npublic class ModItems {\n`;
  code += `\tpublic static final DeferredRegister.Items ITEMS = DeferredRegister.createItems("${modId}");\n\n`;
  for (const f of features) {
    if (f.type === "item" || f.type === "food") {
      const props = f.type === "food" ? ".food(new FoodProperties.Builder().nutrition(6).saturationModifier(0.6f).build())" : "";
      code += `\tpublic static final DeferredItem<Item> ${f.id.toUpperCase()} = ITEMS.registerSimpleItem("${f.id}", new Item.Properties()${props});\n`;
    } else if (f.type === "weapon") {
      code += `\tpublic static final DeferredItem<SwordItem> ${f.id.toUpperCase()} = ITEMS.register("${f.id}", () -> new SwordItem(Tiers.DIAMOND, 5, -2.4f, new Item.Properties()));\n`;
    }
  }
  code += `}\n`;
  return code;
}

function generateBlocksNeo(pkg: string, pkgPath: string, modId: string, features: Feature[]): string {
  const blocks = features.filter(f => f.type === "block" || f.type === "ore");
  if (blocks.length === 0) {
    return `package ${pkg};\n\nimport net.neoforged.neoforge.registries.DeferredRegister;\nimport net.minecraft.core.registries.Registries;\nimport net.minecraft.world.level.block.Block;\n\npublic class ModBlocks {\n\tpublic static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(Registries.BLOCK, "${modId}");\n}\n`;
  }
  let code = `package ${pkg};\n\nimport net.minecraft.world.level.block.*;\nimport net.neoforged.neoforge.registries.DeferredRegister;\nimport net.minecraft.core.registries.Registries;\nimport net.minecraft.world.level.block.state.BlockBehaviour;\n\npublic class ModBlocks {\n`;
  code += `\tpublic static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(Registries.BLOCK, "${modId}");\n\n`;
  for (const f of blocks) {
    code += `\tpublic static final Block ${f.id.toUpperCase()} = new Block(BlockBehaviour.Properties.of().strength(2.0f).requiresCorrectToolForDrops());\n`;
    code += `\tpublic static final Supplier<Block> ${f.id.toUpperCase()}_BLOCK = BLOCKS.register("${f.id}", () -> ${f.id.toUpperCase()});\n`;
  }
  code += `}\n`;
  return code;
}
