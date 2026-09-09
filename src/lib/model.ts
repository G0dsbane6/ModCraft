export interface VoxelCube {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  emissive?: string;
}

export interface VoxelBone {
  name: string;
  pivot: [number, number, number];
  cubes: VoxelCube[];
}

const BRASS = "#c1951c";
const BRASS_BRIGHT = "#e2b63a";
const BRASS_DARK = "#8a6d18";
const STEEL = "#7c6318";
const QUARTZ = "#fff7e0";
const QUARTZ_GLOW = "#f3d06a";

export const GRAPPLING_HOOK: VoxelBone[] = [
  {
    name: "body",
    pivot: [0, 0.7, 0],
    cubes: [
      { from: [-0.5, 0.3, -0.5], to: [0.5, 1.25, 0.5], color: BRASS },
      { from: [-0.42, 0.16, -0.42], to: [0.42, 0.3, 0.42], color: STEEL },
      { from: [-0.42, 1.25, -0.42], to: [0.42, 1.4, 0.42], color: BRASS_DARK },
      { from: [-0.3, -0.08, -0.3], to: [0.3, 0.16, 0.3], color: BRASS_BRIGHT },
      { from: [-0.24, -0.3, -0.24], to: [0.24, -0.08, 0.24], color: BRASS_DARK },
    ],
  },
  {
    name: "crystal",
    pivot: [0, 1.6, 0],
    cubes: [
      {
        from: [-0.2, 1.4, -0.2],
        to: [0.2, 1.78, 0.2],
        color: QUARTZ,
        emissive: QUARTZ_GLOW,
      },
      {
        from: [-0.12, 1.78, -0.12],
        to: [0.12, 2.02, 0.12],
        color: "#fffaf0",
        emissive: QUARTZ_GLOW,
      },
    ],
  },
  {
    name: "gears",
    pivot: [0, 0.62, -0.6],
    cubes: [
      { from: [-0.42, 0.42, -0.95], to: [0.42, 0.82, -0.55], color: BRASS_BRIGHT },
      { from: [-0.3, 0.3, -1.08], to: [0.3, 0.62, -0.95], color: BRASS_DARK },
      { from: [-0.18, 0.82, -0.92], to: [0.18, 0.98, -0.6], color: BRASS },
    ],
  },
  {
    name: "claw_l",
    pivot: [0.5, 0.35, 0],
    cubes: [
      { from: [0.42, 0.12, -0.32], to: [1.35, 0.62, 0.32], color: BRASS_DARK },
      { from: [1.32, 0.16, -0.2], to: [1.66, 0.58, 0.2], color: STEEL },
    ],
  },
  {
    name: "claw_r",
    pivot: [-0.5, 0.35, 0],
    cubes: [
      { from: [-1.35, 0.12, -0.32], to: [-0.42, 0.62, 0.32], color: BRASS_DARK },
      { from: [-1.66, 0.16, -0.2], to: [-1.32, 0.58, 0.2], color: STEEL },
    ],
  },
  {
    name: "gem_l",
    pivot: [0.55, 1.0, 0],
    cubes: [
      {
        from: [0.44, 0.9, -0.1],
        to: [0.66, 1.12, 0.1],
        color: QUARTZ,
        emissive: QUARTZ_GLOW,
      },
    ],
  },
  {
    name: "gem_r",
    pivot: [-0.55, 1.0, 0],
    cubes: [
      {
        from: [-0.66, 0.9, -0.1],
        to: [-0.44, 1.12, 0.1],
        color: QUARTZ,
        emissive: QUARTZ_GLOW,
      },
    ],
  },
];

export interface ModelStats {
  bones: number;
  cubes: number;
  resolution: string;
  seed: string;
}

export const UPSCALED_MODEL_STATS: ModelStats = {
  bones: 7,
  cubes: 16,
  resolution: "16×16",
  seed: "0x7F3A91",
};