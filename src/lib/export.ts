import JSZip from "jszip";
import { GRAPPLING_HOOK, type VoxelBone } from "./model";

export const MODEL_NAME = "grappling_hook";
export const MODEL_VERSION = "3.1.0";

const BRASS_COLORS = new Set(["#c1951c", "#e2b63a", "#8a6d18", "#7c6318", "#b98a1e", "#b98a1f"]);

function textureIndexFor(color: string): number {
  return BRASS_COLORS.has(color.toLowerCase()) ? 0 : 1;
}

function hash2(x: number, y: number): number {
  return (x * 73856093) ^ (y * 19349663);
}

async function paintTexture(draw: (ctx: CanvasRenderingContext2D, rnd: (x: number, y: number) => number) => void): Promise<ArrayBuffer> {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d unavailable");
  draw(ctx, hash2);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("texture render failed");
  return blob.arrayBuffer();
}

export async function generateTextures() {
  const brass = await paintTexture((ctx, rnd) => {
    ctx.fillStyle = "#c1951c";
    ctx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = rnd(x, y);
        if (((x + y) % 2) === 0) {
          ctx.fillStyle = "#b58a1c";
          ctx.fillRect(x, y, 1, 1);
        }
        if (n % 13 === 0) {
          ctx.fillStyle = "#e2b63a";
          ctx.fillRect(x, y, 1, 1);
        }
        if (n % 29 === 0) {
          ctx.fillStyle = "#8a6d18";
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  const quartz = await paintTexture((ctx, rnd) => {
    ctx.fillStyle = "#fff7e0";
    ctx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = rnd(x + 3, y + 7);
        if (n % 7 === 0) ctx.fillStyle = "#f0e2ae";
        else if (n % 19 === 0) ctx.fillStyle = "#ffffff";
        else ctx.fillStyle = "#fff7e0";
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  return { brass, quartz };
}

interface BBFace {
  uv: [number, number, number, number];
  texture: number;
}

function buildFaces(): Record<string, BBFace> {
  const f = (texture: number): BBFace => ({ uv: [0, 0, 16, 16], texture });
  return {
    north: f(0),
    east: f(0),
    south: f(0),
    west: f(0),
    up: f(0),
    down: f(0),
  };
}

function buildElements(bones: VoxelBone[]) {
  const elements: unknown[] = [];
  bones.forEach((bone) => {
    bone.cubes.forEach((cube, i) => {
      const tex = textureIndexFor(cube.color ?? "#c1951c");
      const faces = buildFaces();
      Object.values(faces).forEach((f) => (f.texture = tex));
      elements.push({
        name: `${bone.name}_${i}`,
        from: cube.from,
        to: cube.to,
        rotation: {
          origin: bone.pivot,
          axis: "y",
          angle: 0,
        },
        autouv: 0,
        color: 0,
        shade: true,
        box_uv: true,
        faces,
      });
    });
  });
  return elements;
}

const dataUri = (bytes: ArrayBuffer): string =>
  `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;

export function buildBBModel(brass: ArrayBuffer, quartz: ArrayBuffer): object {
  return {
    meta: {
      format_version: "4.10",
      model_format: "free",
      box_uv: true,
    },
    name: MODEL_NAME,
    model_identifier: `modforge:${MODEL_NAME}`,
    resolution: { width: 16, height: 16 },
    elements: buildElements(GRAPPLING_HOOK),
    outliner: [
      {
        name: `steampunk_${MODEL_NAME}`,
        children: GRAPPLING_HOOK.map((b) => b.name),
      },
    ],
    textures: [
      {
        id: "0",
        path: "textures/steampunk_brass.png",
        name: "steampunk_brass.png",
        source: dataUri(brass),
        particle: false,
        render_mode: "default",
        wrapped: false,
      },
      {
        id: "1",
        path: "textures/ender_quartz.png",
        name: "ender_quartz.png",
        source: dataUri(quartz),
        particle: false,
        render_mode: "default",
        wrapped: false,
      },
    ],
  };
}

export function buildMetadata(): object {
  return {
    name: MODEL_NAME,
    type: "bbmodel",
    generator: "ModForge ForgeCore",
    version: MODEL_VERSION,
    seed: "0x7F3A91",
    bones: GRAPPLING_HOOK.length,
    cubes: GRAPPLING_HOOK.reduce((n, b) => n + b.cubes.length, 0),
    textures: ["textures/steampunk_brass.png", "textures/ender_quartz.png"],
  };
}

export async function saveModelZip(): Promise<string> {
  const { brass, quartz } = await generateTextures();
  const zip = new JSZip();

  zip.file(`${MODEL_NAME}.bbmodel`, JSON.stringify(buildBBModel(brass, quartz), null, 2));
  zip.file(`${MODEL_NAME}.bbmode.json`, JSON.stringify(buildMetadata(), null, 2));
  zip.file("textures/steampunk_brass.png", brass);
  zip.file("textures/ender_quartz.png", quartz);

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${MODEL_NAME}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  return MODEL_NAME;
}