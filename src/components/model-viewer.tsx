"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { Cube, Globe, Download } from "@/components/icons";
import { Card, PanelHeader, Pill } from "@/components/ui";
import { GRAPPLING_HOOK, type VoxelBone } from "@/lib/model";
import { saveModelZip, MODEL_NAME } from "@/lib/export";

type ThreeNS = typeof THREE;

function buildVoxelBones(THREE: ThreeNS, bones: VoxelBone[], scene: THREE.Scene): THREE.Group {
  const root = new THREE.Group();

  bones.forEach((bone) => {
    const pivotGroup = new THREE.Group();
    pivotGroup.name = bone.name;
    pivotGroup.userData.boneName = bone.name;
    pivotGroup.position.set(bone.pivot[0], bone.pivot[1], bone.pivot[2]);
    root.add(pivotGroup);

    bone.cubes.forEach((cube) => {
      const size = [
        cube.to[0] - cube.from[0],
        cube.to[1] - cube.from[1],
        cube.to[2] - cube.from[2],
      ];
      const color = new THREE.Color(cube.color ?? "#c1951c");
      const mat = cube.emissive
        ? new THREE.MeshStandardMaterial({
            color,
            emissive: cube.emissive,
            emissiveIntensity: 0.55,
            roughness: 0.3,
            flatShading: true,
          })
        : new THREE.MeshStandardMaterial({
            color,
            roughness: 0.38,
            metalness: 0.25,
            flatShading: true,
          });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
      mesh.position.set(
        (cube.from[0] + cube.to[0]) / 2 - bone.pivot[0],
        (cube.from[1] + cube.to[1]) / 2 - bone.pivot[1],
        (cube.from[2] + cube.to[2]) / 2 - bone.pivot[2]
      );
      pivotGroup.add(mesh);
    });
  });

  scene.add(root);
  return root;
}

export default function ModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ setAutoRotating: (v: boolean) => void; setSimulation: (v: boolean) => void } | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [simulation, setSimulation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    let sim = false;

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed) return;

      const container = containerRef.current;
      if (!container) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(4.4, 3.4, 4.4);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1.05, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 3;
      controls.maxDistance = 12;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.6;

      const hemi = new THREE.HemisphereLight(0xffffff, 0xfff3cf, 1.25);
      const key = new THREE.DirectionalLight(0xfff6df, 2.6);
      key.position.set(4, 6, 3);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -3;
      key.shadow.camera.right = 3;
      key.shadow.camera.top = 4;
      key.shadow.camera.bottom = -4;
      const glow = new THREE.PointLight(0xffd97a, 8, 4, 2);
      glow.position.set(0, 2.2, 0);
      scene.add(hemi, key, glow);

      const grid = new THREE.GridHelper(5, 10, new THREE.Color("#b98a1e"), new THREE.Color("#e8d79a"));
      const gridMat = grid.material as THREE.Material;
      gridMat.transparent = true;
      gridMat.opacity = 0.4;
      grid.position.y = 0.001;

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(2.4, 64),
        new THREE.MeshStandardMaterial({ color: "#fffdf7", roughness: 0.95 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(grid, floor);

      const forest: THREE.Mesh[] = [];
      for (let i = 0; i < 16; i++) {
        const trunk = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 1.1, 0.14),
          new THREE.MeshStandardMaterial({ color: 0x5a4120, roughness: 0.9, flatShading: true })
        );
        trunk.position.set((i % 4) * 1.35 - 2, 0.55, Math.floor(i / 4) * 1.35 - 0.5);
        forest.push(trunk);
        scene.add(trunk);
      }
      forest.forEach((m) => (m.visible = false));

      const root = buildVoxelBones(THREE, GRAPPLING_HOOK, scene);
      root.position.y = 0.55;
      root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });

      const names = new Map<string, THREE.Object3D>();
      root.children.forEach((c) => names.set(c.userData.boneName, c));

      const clock = new THREE.Clock();

      const animate = () => {
        if (disposed) return;
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        const clawL = names.get("claw_l");
        const clawR = names.get("claw_r");
        const crystal = names.get("crystal");
        const gears = names.get("gears");

        if (clawL && clawR) {
          clawL.rotation.z = -0.15 - Math.sin(t * 1.4) * 0.45;
          clawR.rotation.z = 0.15 + Math.sin(t * 1.4) * 0.45;
        }
        if (crystal) crystal.position.y = Math.sin(t * 2.1) * 0.09;
        if (gears) gears.rotation.y = t * 0.9;
        glow.intensity = 7 + Math.sin(t * 2.1) * 2.2;

        grid.visible = !sim;
        forest.forEach((m) => (m.visible = sim && !(m.position.x > 0 && m.position.z > 0.6)));
        scene.background = sim ? new THREE.Color(0x201607) : null;
        scene.fog = sim ? new THREE.FogExp2(0x201607, 0.5) : null;
        (floor.material as THREE.MeshStandardMaterial).color.set(sim ? 0x3a2610 : 0xfffdf7);

        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(container);

      apiRef.current = {
        setAutoRotating: (v: boolean) => (controls.autoRotate = v),
        setSimulation: (v: boolean) => (sim = v),
      };

      cleanup = () => {
        ro.disconnect();
        renderer.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <Card className="h-full">
      <PanelHeader
        icon={<Cube className="w-3.5 h-3.5" />}
        title="Immersive 3D Sim"
        tag="webgl"
        right={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                setSaving(true);
                try {
                  await saveModelZip();
                } finally {
                  setTimeout(() => setSaving(false), 1200);
                }
              }}
              disabled={saving}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[10.5px] uppercase tracking-wide transition-all disabled:opacity-70 text-bone bg-gradient-to-r from-gold-deep to-gold border-transparent hover:brightness-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              {saving ? "packing…" : `save ${MODEL_NAME}.zip`}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !simulation;
                setSimulation(next);
                apiRef.current?.setSimulation(next);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10.5px] font-mono uppercase tracking-wide transition-all ${
                simulation
                  ? "bg-gold-pale/60 text-gold-deep border-gold-pale"
                  : "bg-paper text-ink-3 border-hairline hover:text-ink-2"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {simulation ? "Simulation" : "Flat grid"}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !autoRotate;
                setAutoRotate(next);
                apiRef.current?.setAutoRotating(next);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[10.5px] font-mono uppercase tracking-wide transition-all ${
                autoRotate
                  ? "bg-gold-pale/60 text-gold-deep border-gold-pale"
                  : "bg-paper text-ink-3 border-hairline"
              }`}
            >
              {autoRotate ? "Orbit on" : "Orbit off"}
            </button>
          </div>
        }
      />

      <div ref={containerRef} className={`bb-grid relative flex-1 min-h-[190px] bb-vignette ${simulation ? "bb-sim" : ""}`}>
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-between px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <Pill>7 bones</Pill>
            <Pill>16 cubes</Pill>
          </div>
          <Pill>gfx-ready</Pill>
        </div>
      </div>
    </Card>
  );
}