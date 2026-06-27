export type ModLoader = "resource-pack" | "datapack" | "fabric" | "forge" | "neoforge" | "quilt" | "paper" | "velocity";

export type ModProject = {
  id: string;
  name: string;
  description: string;
  loader: ModLoader;
  version: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  files: ModFile[];
  generated: boolean;
};

export type ModFile = {
  path: string;
  content: string;
};

export const MC_VERSIONS = [
  "26.2", "26.1.2", "26.1.1", "26.1",
  "1.21.11", "1.21.10", "1.21.9", "1.21.8", "1.21.7", "1.21.6",
  "1.21.5", "1.21.4", "1.21.3", "1.21.2", "1.21.1", "1.21",
  "1.20.6", "1.20.5", "1.20.4", "1.20.3", "1.20.2", "1.20.1", "1.20",
  "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19",
  "1.18.2", "1.18.1", "1.18",
] as const;

export const LOADER_ICONS: Record<ModLoader, string> = {
  fabric: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 8l8 8M8 16l8-8"/></svg>`,
  forge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H8l-2 8h12l-2-8z"/><rect x="6" y="10" width="12" height="4" rx="1"/><path d="M10 14v6h4v-6"/></svg>`,
  neoforge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/></svg>`,
  quilt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5L12 2z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  paper: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg>`,
  velocity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z"/></svg>`,
  "resource-pack": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>`,
  datapack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/><circle cx="12" cy="12" r="2"/></svg>`,
};

export const LOADERS: { id: ModLoader; label: string; description: string }[] = [
  { id: "fabric", label: "Fabric", description: "Lightweight mod loader by FabricMC" },
  { id: "forge", label: "Forge", description: "The original Minecraft modding API" },
  { id: "neoforge", label: "NeoForge", description: "Modern fork of Forge" },
  { id: "quilt", label: "Quilt", description: "Open-source Fabric fork by QuiltMC" },
  { id: "paper", label: "Paper", description: "High-performance server plugin API" },
  { id: "velocity", label: "Velocity", description: "Modern proxy plugin platform" },
  { id: "resource-pack", label: "Resource Pack", description: "Texture and asset packs" },
  { id: "datapack", label: "Datapack", description: "Data-driven vanilla modifications" },
];
