"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type DeskDevice = "laptop" | "tablet" | "phone" | "notebook";

interface ThreeDeskProps {
  evening: boolean;
  onSelectDevice: (device: DeskDevice) => void;
  setHoveredDevice: (device: string | null) => void;
  focusedDevice: DeskDevice | null;
  onSpeakerTap?: () => void;
  speakerPlaying?: boolean;
  lampOn?: boolean;
  onLampToggle?: () => void;
  /** Element that is moved (via transform) to sit just above the speaker on screen, every frame. */
  speakerAnchorRef?: React.RefObject<HTMLDivElement | null>;
  /** Half the anchored panel's width, so the anchor stays fully inside the viewport. */
  speakerAnchorHalfWidth?: number;
}

export default function ThreeDesk({
  evening,
  onSelectDevice,
  setHoveredDevice,
  focusedDevice,
  onSpeakerTap,
  speakerPlaying = false,
  lampOn = false,
  onLampToggle,
  speakerAnchorRef,
  speakerAnchorHalfWidth = 148,
}: ThreeDeskProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const eveningRef = useRef(evening);
  const focusedDeviceRef = useRef(focusedDevice);
  const onSelectDeviceRef = useRef(onSelectDevice);
  const onSpeakerTapRef = useRef(onSpeakerTap);
  const speakerPlayingRef = useRef(speakerPlaying);
  const lampOnRef = useRef(lampOn);
  const onLampToggleRef = useRef(onLampToggle);
  const speakerAnchorHolder = useRef(speakerAnchorRef);
  const anchorHalfWidthRef = useRef(speakerAnchorHalfWidth);
  const setHoveredDeviceRef = useRef(setHoveredDevice);

  useEffect(() => {
    eveningRef.current = evening;
  }, [evening]);

  useEffect(() => {
    focusedDeviceRef.current = focusedDevice;
  }, [focusedDevice]);

  useEffect(() => {
    onSelectDeviceRef.current = onSelectDevice;
  }, [onSelectDevice]);

  useEffect(() => {
    onSpeakerTapRef.current = onSpeakerTap;
  }, [onSpeakerTap]);

  useEffect(() => {
    speakerPlayingRef.current = speakerPlaying;
  }, [speakerPlaying]);

  useEffect(() => {
    lampOnRef.current = lampOn;
  }, [lampOn]);

  useEffect(() => {
    onLampToggleRef.current = onLampToggle;
  }, [onLampToggle]);

  useEffect(() => {
    speakerAnchorHolder.current = speakerAnchorRef;
    anchorHalfWidthRef.current = speakerAnchorHalfWidth;
  }, [speakerAnchorRef, speakerAnchorHalfWidth]);

  useEffect(() => {
    setHoveredDeviceRef.current = setHoveredDevice;
  }, [setHoveredDevice]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // ─── Scene & Perspective Camera ─────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf4f4f7, 0.018);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    const defaultCamPos = new THREE.Vector3(0, 4.25, 6.7);
    const defaultCamLookAt = new THREE.Vector3(0, 1.0, 0.05); // aimed above the desk so the scene sits below the hero text
    camera.position.copy(defaultCamPos);
    camera.lookAt(defaultCamLookAt);

    // Renderer with ACES Tone Mapping & Multi-Sample Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap is deprecated in this three.js version
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    // ─── Photorealistic Studio Environment Map (PMREM) ─────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRoom = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(envRoom).texture;
    scene.environment = envTexture;

    // ─── Cinematic Studio Lighting ─────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Studio Key Sun Light (Warm morning sun casting soft contact shadows)
    const sunLight = new THREE.DirectionalLight(0xfffbf2, 2.3);
    sunLight.position.set(5.5, 12, 6.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 28;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.radius = 2.8;
    scene.add(sunLight);

    // Soft sky fill light from left
    const skyFill = new THREE.DirectionalLight(0xd4e6ff, 0.75);
    skyFill.position.set(-8, 5, 2);
    scene.add(skyFill);

    // Warm evening key light (no visible fixture; fades in with the evening toggle)
    const lampLight = new THREE.SpotLight(0xffaf50, 0, 14, Math.PI / 3.2, 0.45, 1.2);
    lampLight.position.set(3.4, 3.8, -1.2);
    lampLight.target.position.set(0.3, 0.1, 0.3);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.width = 1024;
    lampLight.shadow.mapSize.height = 1024;
    lampLight.shadow.bias = -0.0004;
    lampLight.shadow.radius = 2;
    scene.add(lampLight);
    scene.add(lampLight.target);

    // Screen Bounce Light (Subtle backlit glow casting onto keyboard & pad)
    const screenBounce = new THREE.PointLight(0x818cf8, 0.85, 3.2, 1.8);
    screenBounce.position.set(0.15, 0.7, 0.25);
    scene.add(screenBounce);

    // ─── Procedural Texture Generators ─────────────────────────────────────

    // 1. Organic Wood Grain Texture (Natural oak with knots and satin sheen)
    const makeWoodTexture = () => {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext("2d")!;

      ctx.fillStyle = "#dfd2bc";
      ctx.fillRect(0, 0, 1024, 512);

      // Fine grain streaks
      ctx.fillStyle = "rgba(175, 148, 120, 0.22)";
      for (let i = 0; i < 450; i++) {
        const y = Math.random() * 512;
        const h = Math.random() * 2 + 0.8;
        ctx.fillRect(0, y, 1024, h);
      }

      // Annual growth rings
      ctx.fillStyle = "rgba(140, 115, 88, 0.15)";
      for (let i = 0; i < 42; i++) {
        const y = (i / 42) * 512 + Math.sin(i * 0.45) * 8;
        ctx.fillRect(0, y, 1024, 2.8);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      return tex;
    };

    // 2. Leather Desk Pad with stitched edge
    const makeLeatherTexture = () => {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext("2d")!;

      ctx.fillStyle = "#1e1e24";
      ctx.fillRect(0, 0, 1024, 512);

      // Pebble grain
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      for (let i = 0; i < 22000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 1.4, 1.4);
      }

      // Stitched edge
      ctx.strokeStyle = "rgba(215, 190, 160, 0.45)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(20, 20, 984, 472);

      return new THREE.CanvasTexture(c);
    };

    // 3. Realistic MacBook Keyboard Texture with Laser-Etched Keys & Glow
    const makeKeyboardTexture = () => {
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 420;
      const ctx = c.getContext("2d")!;

      // Anodized dark well
      ctx.fillStyle = "#08080b";
      ctx.fillRect(0, 0, 1200, 420);

      // Function Row
      const fKeys = 14;
      const fW = (1160 - (fKeys - 1) * 7) / fKeys;
      for (let i = 0; i < fKeys; i++) {
        ctx.fillStyle = "#2e3038";
        ctx.roundRect(20 + i * (fW + 7), 16, fW, 26, 4);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText(i === 0 ? "esc" : `F${i}`, 26 + i * (fW + 7), 33);
      }

      // 4 Main Typing Rows
      const rows = [
        ["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "delete"],
        ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
        ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "return"],
        ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
      ];

      rows.forEach((row, rIdx) => {
        const y = 52 + rIdx * 54;
        let curX = 20;
        const totalKeys = row.length;
        const standardW = (1160 - (totalKeys - 1) * 7) / totalKeys;

        row.forEach((key) => {
          let kw = standardW;
          if (key === "delete" || key === "tab" || key === "caps") kw = standardW * 1.5;
          if (key === "return" || key === "shift") kw = standardW * 1.7;

          // Keycap body with subtle edge highlight
          ctx.fillStyle = "#2e3038";
          ctx.roundRect(curX, y, kw, 46, 5);
          ctx.fill();

          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(key, curX + kw / 2 - 8, y + 28);

          curX += kw + 7;
        });
      });

      // Bottom Row (Spacebar & modifiers)
      const bY = 52 + 4 * 54;
      ctx.fillStyle = "#2e3038";
      ctx.roundRect(20, bY, 70, 48, 5);
      ctx.fill();
      ctx.roundRect(98, bY, 70, 48, 5);
      ctx.fill();
      ctx.roundRect(176, bY, 90, 48, 5);
      ctx.fill();
      // Spacebar
      ctx.roundRect(274, bY, 360, 48, 5);
      ctx.fill();
      // Right keys
      ctx.roundRect(642, bY, 90, 48, 5);
      ctx.fill();
      ctx.roundRect(740, bY, 70, 48, 5);
      ctx.fill();
      ctx.roundRect(820, bY + 24, 60, 24, 4);
      ctx.fill();
      ctx.roundRect(888, bY, 60, 24, 4);
      ctx.fill();
      ctx.roundRect(888, bY + 24, 60, 24, 4);
      ctx.fill();
      ctx.roundRect(956, bY + 24, 60, 24, 4);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    };

    // 4. Contact Shadow Radial Texture Generator
    const makeContactShadowTexture = () => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 124);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
      grad.addColorStop(0.35, "rgba(0, 0, 0, 0.38)");
      grad.addColorStop(0.75, "rgba(0, 0, 0, 0.12)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    };

    // 5. Notebook page textures (ruled paper, spine shading, handwriting in blue ink)
    const makePageTexture = (side: "left" | "right") => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 688;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fbf6e8";
      ctx.fillRect(0, 0, 512, 688);
      // paper grain
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = `rgba(120,100,60,${Math.random() * 0.05})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 688, 1.5, 1.5);
      }
      // ruled lines
      ctx.strokeStyle = "rgba(110,118,135,0.38)";
      ctx.lineWidth = 1.2;
      for (let y = 96; y < 650; y += 32) {
        ctx.beginPath();
        ctx.moveTo(28, y);
        ctx.lineTo(484, y);
        ctx.stroke();
      }
      // shading toward the spine
      const sx0 = side === "left" ? 512 : 0;
      const sx1 = side === "left" ? 512 - 120 : 120;
      const g = ctx.createLinearGradient(sx0, 0, sx1, 0);
      g.addColorStop(0, "rgba(40,30,10,0.32)");
      g.addColorStop(1, "rgba(40,30,10,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 688);

      const ink = "#1f2f6e";
      const hand = "'Caveat', 'Bradley Hand', 'Segoe Script', 'Comic Sans MS', cursive";
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      if (side === "right") {
        ctx.font = `bold 38px ${hand}`;
        ctx.fillText("Guestbook", 44, 82);
        ctx.font = `28px ${hand}`;
        ["Come say hi!", "Sign my notebook:", "tell me what you'd", "like to build ✍"].forEach((t, i) =>
          ctx.fillText(t, 44, 126 + i * 32)
        );
        ctx.font = `bold 24px ${hand}`;
        ctx.fillText("— click to write a note", 44, 290);
        ctx.beginPath();
        ctx.moveTo(44, 302);
        ctx.quadraticCurveTo(140, 314, 250, 300);
        ctx.stroke();
      } else {
        ctx.font = `22px ${hand}`;
        ctx.fillText("Sat 11 May", 330, 70);
        ctx.font = `bold 30px ${hand}`;
        ctx.fillText("To do", 44, 82);
        ctx.font = `25px ${hand}`;
        [
          ["Review PR", true],
          ["Deploy agents", true],
          ["Fix RAG latency", false],
          ["Write docs", false],
        ].forEach(([t, done], i) => {
          const y = 126 + i * 32;
          ctx.strokeRect(44, y - 18, 18, 18);
          if (done) {
            ctx.beginPath();
            ctx.moveTo(47, y - 8);
            ctx.lineTo(53, y - 2);
            ctx.lineTo(66, y - 24);
            ctx.stroke();
          }
          ctx.fillText(t as string, 76, y - 2);
        });
        // little system diagram
        const box = (x: number, y: number, t: string) => {
          ctx.strokeRect(x, y, 88, 40);
          ctx.font = `20px ${hand}`;
          ctx.fillText(t, x + 12, y + 27);
        };
        box(44, 300, "Client");
        box(190, 300, "API");
        box(336, 300, "VDR");
        [[132, 320, 190], [278, 320, 336]].forEach(([x0, y0, x1]) => {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1 - 4, y0);
          ctx.moveTo(x1 - 12, y0 - 6);
          ctx.lineTo(x1 - 4, y0);
          ctx.lineTo(x1 - 12, y0 + 6);
          ctx.stroke();
        });
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };

    const woodTex = makeWoodTexture();
    const leatherTex = makeLeatherTexture();
    const keyboardTex = makeKeyboardTexture();
    // Canvas colours are authored in sRGB; without this they render washed-out
    // (e.g. the near-black #1e1e24 pad looked light grey).
    [woodTex, leatherTex, keyboardTex].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
    });
    const contactShadowTex = makeContactShadowTexture();
    const notebookTex = makePageTexture("right");
    const notebookLeftTex = makePageTexture("left");

    // ─── Physically Based Materials (PBR) ──────────────────────────────────
    const woodDeskMat = new THREE.MeshPhysicalMaterial({
      map: woodTex,
      roughness: 0.52,
      metalness: 0.04,
      clearcoat: 0.28,
      clearcoatRoughness: 0.3,
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      map: leatherTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    const macAluminiumMat = new THREE.MeshStandardMaterial({
      color: 0xa4a8af,
      metalness: 0.88,
      roughness: 0.22,
    });

    const polishedBrassMat = new THREE.MeshStandardMaterial({
      color: 0xdeb841,
      metalness: 0.94,
      roughness: 0.18,
    });

    const matteDarkMat = new THREE.MeshStandardMaterial({
      color: 0x141417,
      roughness: 0.65,
      metalness: 0.25,
    });

    const whitePotMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4f4f6,
      roughness: 0.25,
      clearcoat: 0.6,
    });

    const succulentLeafMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.45,
      metalness: 0.05,
    });

    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    // ─── 3D Desk & Mat ─────────────────────────────────────────────────────
    // Desk Wood Slab with beveled chamfer
    const deskMesh = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.22, 5.8), woodDeskMat);
    deskMesh.position.set(0, -0.11, 0);
    deskMesh.receiveShadow = true;
    scene.add(deskMesh);

    // Leather Desk Pad with stitched edge
    const padMesh = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.018, 3.3), leatherMat);
    padMesh.position.set(0.1, 0.01, 0.22);
    padMesh.receiveShadow = true;
    scene.add(padMesh);

    // Helper for contact shadows
    const addContactShadow = (x: number, z: number, w: number, d: number, opacity = 0.55) => {
      const mat = contactShadowMat.clone(); // per-plane opacity (shared material made the last value win)
      mat.opacity = opacity;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(x, 0.0205, z); // pad top is 0.019: keep clear of it to avoid z-fighting
      scene.add(plane);
    };

    addContactShadow(0.15, 0.15, 3.2, 2.2, 0.6); // Laptop shadow
    addContactShadow(-2.5, 0.35, 2.2, 1.8, 0.45); // Tablet shadow
    addContactShadow(2.45, 0.45, 1.3, 1.8, 0.45); // Phone shadow
    addContactShadow(2.4, -1.4, 0.9, 0.9, 0.45); // Mug shadow
    addContactShadow(-3.2, -0.5, 1.0, 1.0, 0.45); // Plant shadow
    addContactShadow(3.7, -1.15, 1.4, 1.4, 0.45); // Plant pot shadow
    addContactShadow(-1.25, 1.4, 1.9, 1.3, 0.45); // Notebook shadow
    addContactShadow(1.7, -1.45, 1.1, 0.8, 0.45); // Clock shadow
    addContactShadow(3.25, 0.6, 0.85, 0.85, 0.45); // Speaker shadow
    addContactShadow(-1.65, -0.95, 1.1, 1.1, 0.45); // Pen stand shadow
    addContactShadow(-3.35, 1.6, 0.85, 0.85, 0.45); // Lamp base shadow

    // ─── Dynamic High-DPI Screen Canvas Textures ───────────────────────────
    const laptopCanvas = document.createElement("canvas");
    laptopCanvas.width = 1536;
    laptopCanvas.height = 960;
    const lCtx = laptopCanvas.getContext("2d")!;
    const laptopTexture = new THREE.CanvasTexture(laptopCanvas);

    const tabletCanvas = document.createElement("canvas");
    tabletCanvas.width = 1280;
    tabletCanvas.height = 960;
    const tCtx = tabletCanvas.getContext("2d")!;
    const tabletTexture = new THREE.CanvasTexture(tabletCanvas);

    const phoneCanvas = document.createElement("canvas");
    phoneCanvas.width = 640;
    phoneCanvas.height = 1280;
    const pCtx = phoneCanvas.getContext("2d")!;
    const phoneTexture = new THREE.CanvasTexture(phoneCanvas);

    // Screens: sRGB + mipmaps + anisotropy stop the washed-out colours and the
    // shimmering text that appeared whenever the camera drifted with the mouse.
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    [laptopTexture, tabletTexture, phoneTexture].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = maxAniso;
    });

    const paintGlyph = (name: string, c: CanvasRenderingContext2D) => {
    const SZ = 90;
      c.fillStyle = "#fff";
      c.strokeStyle = "#fff";
      c.lineWidth = 5;
      c.lineCap = "round";
      c.lineJoin = "round";
      switch (name) {
        case "facetime":
          c.beginPath(); c.roundRect(14, 28, 40, 34, 8); c.fill();
          c.beginPath(); c.moveTo(58, 40); c.lineTo(78, 28); c.lineTo(78, 62); c.lineTo(58, 50); c.fill();
          break;
        case "calendar":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#ef4444"; c.font = "bold 15px Arial"; c.textAlign = "center"; c.fillText("Monday", 45, 24);
          c.fillStyle = "#111"; c.font = "300 52px Arial"; c.fillText("29", 45, 72);
          break;
        case "photos": {
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          const cols = ["#f8c01e", "#f97316", "#ef4444", "#d946ef", "#6366f1", "#3b82f6", "#22c55e", "#a3e635"];
          cols.forEach((col, i) => {
            const a = (i / 8) * Math.PI * 2;
            c.fillStyle = col; c.globalAlpha = 0.85;
            c.beginPath(); c.ellipse(45 + Math.cos(a) * 14, 45 + Math.sin(a) * 14, 15, 15, 0, 0, Math.PI * 2); c.fill();
          });
          c.globalAlpha = 1;
          break;
        }
        case "camera":
          c.fillStyle = "#222"; c.beginPath(); c.roundRect(10, 24, 70, 48, 9); c.fill();
          c.fillStyle = "#555"; c.beginPath(); c.arc(45, 48, 17, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#111"; c.beginPath(); c.arc(45, 48, 11, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#facc15"; c.fillRect(66, 29, 6, 5);
          break;
        case "mail":
          c.beginPath(); c.roundRect(14, 24, 62, 44, 6); c.fill();
          c.strokeStyle = "#3b82f6"; c.lineWidth = 4;
          c.beginPath(); c.moveTo(16, 28); c.lineTo(45, 52); c.lineTo(74, 28); c.stroke();
          break;
        case "clock":
          c.fillStyle = "#000"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#fff"; c.beginPath(); c.arc(45, 45, 38, 0, Math.PI * 2); c.fill();
          c.strokeStyle = "#111"; c.lineWidth = 4;
          c.beginPath(); c.moveTo(45, 45); c.lineTo(45, 20); c.moveTo(45, 45); c.lineTo(28, 54); c.stroke();
          c.strokeStyle = "#f97316"; c.lineWidth = 2;
          c.beginPath(); c.moveTo(45, 45); c.lineTo(50, 66); c.stroke();
          break;
        case "maps":
          c.fillStyle = "#f4efe0"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#86d17a"; c.fillRect(40, 0, 50, 40);
          c.strokeStyle = "#fff"; c.lineWidth = 8;
          c.beginPath(); c.moveTo(-5, 70); c.lineTo(95, 20); c.stroke();
          c.fillStyle = "#3b82f6"; c.beginPath(); c.arc(32, 50, 14, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#fff"; c.beginPath(); c.moveTo(32, 40); c.lineTo(40, 58); c.lineTo(32, 54); c.lineTo(24, 58); c.fill();
          break;
        case "weather":
          c.fillStyle = "#facc15"; c.beginPath(); c.arc(32, 34, 17, 0, Math.PI * 2); c.fill();
          c.fillStyle = "rgba(255,255,255,0.95)";
          c.beginPath(); c.arc(40, 58, 15, 0, Math.PI * 2); c.arc(58, 52, 18, 0, Math.PI * 2); c.arc(72, 62, 11, 0, Math.PI * 2); c.fill();
          c.fillRect(40, 58, 32, 15);
          break;
        case "reminders":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          [["#3b82f6", 24], ["#ef4444", 46], ["#f59e0b", 68]].forEach(([col, y]) => {
            c.strokeStyle = col as string; c.lineWidth = 4;
            c.beginPath(); c.arc(20, y as number, 6, 0, Math.PI * 2); c.stroke();
            c.strokeStyle = "#d4d4d8"; c.lineWidth = 2;
            c.beginPath(); c.moveTo(34, (y as number) + 8); c.lineTo(84, (y as number) + 8); c.stroke();
          });
          break;
        case "notes":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#fcd34d"; c.fillRect(0, 0, SZ, 26);
          c.strokeStyle = "#d4d4d8"; c.lineWidth = 2;
          [44, 58, 72].forEach((y) => { c.beginPath(); c.moveTo(0, y); c.lineTo(SZ, y); c.stroke(); });
          break;
        case "stocks":
          c.fillStyle = "#000"; c.fillRect(0, 0, SZ, SZ);
          c.strokeStyle = "#fff"; c.lineWidth = 3;
          c.beginPath(); c.moveTo(6, 62); c.lineTo(22, 50); c.lineTo(34, 58); c.lineTo(50, 34); c.lineTo(62, 44); c.lineTo(84, 22); c.stroke();
          c.strokeStyle = "#38bdf8"; c.lineWidth = 3;
          c.beginPath(); c.moveTo(52, 6); c.lineTo(52, 84); c.stroke();
          break;
        case "news":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#fb2c5b"; c.beginPath(); c.moveTo(18, 22); c.lineTo(72, 22); c.lineTo(36, 70); c.lineTo(18, 70); c.fill();
          break;
        case "books":
          c.beginPath(); c.moveTo(45, 28); c.quadraticCurveTo(28, 20, 12, 26); c.lineTo(12, 66); c.quadraticCurveTo(28, 60, 45, 70); c.fill();
          c.beginPath(); c.moveTo(45, 28); c.quadraticCurveTo(62, 20, 78, 26); c.lineTo(78, 66); c.quadraticCurveTo(62, 60, 45, 70); c.fill();
          break;
        case "appstore":
          c.lineWidth = 7;
          c.beginPath(); c.moveTo(45, 20); c.lineTo(28, 70); c.moveTo(45, 20); c.lineTo(62, 70); c.moveTo(22, 54); c.lineTo(68, 54); c.stroke();
          break;
        case "podcasts":
          c.fillStyle = "#fff"; c.beginPath(); c.arc(45, 38, 10, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.roundRect(40, 46, 10, 28, 5); c.fill();
          c.lineWidth = 5; c.beginPath(); c.arc(45, 40, 24, Math.PI * 0.8, Math.PI * 0.2, false); c.stroke();
          break;
        case "tv":
          c.fillStyle = "#000"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#fff"; c.font = "bold 36px Arial"; c.textAlign = "center"; c.fillText("tv", 55, 58);
          c.fillStyle = "#38bdf8"; c.beginPath(); c.arc(24, 46, 8, 0, Math.PI * 2); c.fill();
          break;
        case "health":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#fb2c5b";
          c.beginPath(); c.moveTo(45, 70); c.bezierCurveTo(8, 44, 22, 14, 45, 34); c.bezierCurveTo(68, 14, 82, 44, 45, 70); c.fill();
          break;
        case "home":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#f59e0b"; c.beginPath(); c.moveTo(45, 14); c.lineTo(78, 40); c.lineTo(78, 76); c.lineTo(12, 76); c.lineTo(12, 40); c.fill();
          c.fillStyle = "#fff"; c.fillRect(34, 46, 22, 30);
          break;
        case "wallet":
          c.fillStyle = "#000"; c.fillRect(0, 0, SZ, SZ);
          ["#f97316", "#22c55e", "#3b82f6", "#e5e7eb"].forEach((col, i) => {
            c.fillStyle = col; c.beginPath(); c.roundRect(10, 18 + i * 8, 70, 30, 6); c.fill();
          });
          c.fillStyle = "#d6d3d1"; c.beginPath(); c.roundRect(8, 44, 74, 32, 8); c.fill();
          break;
        case "settings":
          c.fillStyle = "#6b7280"; c.beginPath(); c.arc(45, 45, 32, 0, Math.PI * 2); c.fill();
          c.strokeStyle = "#d1d5db"; c.lineWidth = 6;
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            c.beginPath(); c.moveTo(45 + Math.cos(a) * 26, 45 + Math.sin(a) * 26); c.lineTo(45 + Math.cos(a) * 34, 45 + Math.sin(a) * 34); c.stroke();
          }
          c.fillStyle = "#374151"; c.beginPath(); c.arc(45, 45, 14, 0, Math.PI * 2); c.fill();
          break;
        case "phone":
          c.beginPath(); c.moveTo(26, 22); c.lineTo(40, 20); c.lineTo(46, 38); c.lineTo(38, 44); c.quadraticCurveTo(44, 58, 54, 64); c.lineTo(62, 56); c.lineTo(78, 64); c.lineTo(76, 74); c.quadraticCurveTo(40, 82, 16, 36); c.quadraticCurveTo(16, 26, 26, 22); c.fill();
          break;
        case "safari":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#3b82f6"; c.beginPath(); c.arc(45, 45, 36, 0, Math.PI * 2); c.fill();
          c.fillStyle = "#ef4444"; c.beginPath(); c.moveTo(45, 45); c.lineTo(60, 28); c.lineTo(52, 52); c.fill();
          c.fillStyle = "#fff"; c.beginPath(); c.moveTo(45, 45); c.lineTo(30, 62); c.lineTo(38, 38); c.fill();
          break;
        case "messages":
          c.beginPath(); c.ellipse(45, 42, 32, 24, 0, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.moveTo(22, 56); c.lineTo(16, 74); c.lineTo(38, 62); c.fill();
          break;
        case "music":
          c.fillStyle = "#fff"; c.fillRect(0, 0, SZ, SZ);
          c.fillStyle = "#fb2c5b"; c.fillRect(38, 22, 6, 42); c.fillRect(62, 18, 6, 42);
          c.beginPath(); c.moveTo(38, 22); c.lineTo(68, 16); c.lineTo(68, 28); c.lineTo(38, 34); c.fill();
          c.beginPath(); c.ellipse(32, 64, 10, 8, 0, 0, Math.PI * 2); c.ellipse(56, 60, 10, 8, 0, 0, Math.PI * 2); c.fill();
          break;
      }
    };


    const drawIcon = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      name: string,
      fill: string | [string, string]
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 90, size / 90);
      ctx.beginPath();
      ctx.roundRect(0, 0, 90, 90, 21);
      ctx.clip();
      if (Array.isArray(fill)) {
        const g = ctx.createLinearGradient(0, 0, 0, 90);
        g.addColorStop(0, fill[0]);
        g.addColorStop(1, fill[1]);
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fillRect(0, 0, 90, 90);
      paintGlyph(name, ctx);
      ctx.restore();
    };

    // iOS-style home screen painted onto a 640×1280 canvas
    const drawPhoneHomeScreen = (ctx: CanvasRenderingContext2D) => {
      const W = 640;
      const H = 1280;

      // Wallpaper: warm orange → red with pink / purple waves
      const bg = ctx.createLinearGradient(0, 0, W, H * 0.6);
      bg.addColorStop(0, "#ff8a00");
      bg.addColorStop(0.55, "#ff6a00");
      bg.addColorStop(1, "#e8330c");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#ffb000";
      ctx.beginPath();
      ctx.moveTo(0, 330);
      ctx.bezierCurveTo(120, 380, 60, 560, 0, 640);
      ctx.fill();

      ctx.fillStyle = "#f0e8e4"; // pale swoosh
      ctx.beginPath();
      ctx.moveTo(0, 470);
      ctx.bezierCurveTo(120, 520, 260, 760, 470, 1010);
      ctx.lineTo(0, 1010);
      ctx.fill();

      ctx.fillStyle = "#ff4d3d";
      ctx.beginPath();
      ctx.moveTo(130, 560);
      ctx.bezierCurveTo(300, 600, 500, 760, 640, 820);
      ctx.lineTo(640, 1000);
      ctx.bezierCurveTo(420, 880, 220, 700, 130, 560);
      ctx.fill();

      ctx.fillStyle = "#e8206b";
      ctx.beginPath();
      ctx.moveTo(0, 1000);
      ctx.bezierCurveTo(180, 880, 420, 900, 640, 940);
      ctx.lineTo(640, 1280);
      ctx.lineTo(0, 1280);
      ctx.fill();

      ctx.fillStyle = "#a23fb5";
      ctx.beginPath();
      ctx.moveTo(230, 1010);
      ctx.bezierCurveTo(420, 930, 560, 980, 640, 1030);
      ctx.lineTo(640, 1280);
      ctx.lineTo(260, 1280);
      ctx.bezierCurveTo(200, 1180, 190, 1090, 230, 1010);
      ctx.fill();

      // Status bar
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px -apple-system, 'Helvetica Neue', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("9:41", 112, 82);
      for (let i = 0; i < 4; i++) ctx.fillRect(486 + i * 9, 78 - (i + 1) * 5, 6, (i + 1) * 5 + 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      [6, 12, 18].forEach((r) => {
        ctx.beginPath();
        ctx.arc(538, 78, r, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.roundRect(566, 58, 38, 20, 6);
      ctx.stroke();
      ctx.fillRect(570, 62, 30, 12);

      // Notch
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(168, 0);
      ctx.lineTo(168, 20);
      ctx.quadraticCurveTo(168, 82, 218, 82);
      ctx.lineTo(422, 82);
      ctx.quadraticCurveTo(472, 82, 472, 20);
      ctx.lineTo(472, 0);
      ctx.fill();
      ctx.fillStyle = "#1c1c20";
      ctx.beginPath();
      ctx.roundRect(282, 44, 76, 10, 5);
      ctx.fill();
      ctx.fillStyle = "#101a2a";
      ctx.beginPath();
      ctx.arc(388, 50, 8, 0, Math.PI * 2);
      ctx.fill();

      // Icon helpers
      const SZ = 90;
      const label = (txt: string, cx: number, y: number) => {
        ctx.fillStyle = "#fff";
        ctx.font = "19px -apple-system, 'Helvetica Neue', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(txt, cx, y);
      };
      type AppIcon = [string, string, string | [string, string]];
      const grid: AppIcon[][] = [
        [["FaceTime", "facetime", ["#4ee06a", "#16a34a"]], ["Calendar", "calendar", "#fff"], ["Photos", "photos", "#fff"], ["Camera", "camera", ["#d4d4d8", "#71717a"]]],
        [["Mail", "mail", ["#38bdf8", "#2563eb"]], ["Clock", "clock", "#000"], ["Maps", "maps", "#fff"], ["Weather", "weather", ["#3aa0ff", "#1d6fe0"]]],
        [["Reminders", "reminders", "#fff"], ["Notes", "notes", "#fff"], ["Stocks", "stocks", "#000"], ["News", "news", "#fff"]],
        [["Books", "books", ["#fb923c", "#ea580c"]], ["App Store", "appstore", ["#38bdf8", "#2563eb"]], ["Podcasts", "podcasts", ["#c084fc", "#7e22ce"]], ["TV", "tv", "#000"]],
        [["Health", "health", "#fff"], ["Home", "home", "#fff"], ["Wallet", "wallet", "#000"], ["Settings", "settings", ["#d1d5db", "#6b7280"]]],
      ];
      const cx = [126, 256, 386, 516];
      grid.forEach((row, r) => {
        row.forEach(([name, g, fill], c) => {
          const x = cx[c] - SZ / 2;
          const y = 140 + r * 152;
          drawIcon(ctx, x, y, SZ, g, fill);
          label(name, cx[c], y + SZ + 22);
        });
      });

      // Page dots
      [0, 1, 2].forEach((i) => {
        ctx.fillStyle = i === 1 ? "#fff" : "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(297 + i * 24, 1072, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dock
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.roundRect(56, 1090, 528, 142, 38);
      ctx.fill();
      const dock: AppIcon[] = [
        ["", "phone", ["#4ee06a", "#16a34a"]],
        ["", "safari", "#fff"],
        ["", "messages", ["#4ee06a", "#16a34a"]],
        ["", "music", "#fff"],
      ];
      dock.forEach(([, g, fill], i) => drawIcon(ctx, cx[i] - SZ / 2, 1116, SZ, g, fill));
    };

    // macOS-style desktop (nebula wallpaper, menu bar, dock) painted onto a 1536×960 canvas
    const drawMacDesktop = (ctx: CanvasRenderingContext2D) => {
      const W = 1536;
      const H = 960;
      const FONT = "-apple-system, 'Helvetica Neue', Arial, sans-serif";

      // Deterministic RNG so the wallpaper never changes between renders
      let seed = 1337;
      const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };

      // Nebula wallpaper
      ctx.fillStyle = "#04051a";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "screen";
      const glow = (x: number, y: number, r: number, color: string, a: number) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color.replace("A", String(a)));
        g.addColorStop(1, color.replace("A", "0"));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      };
      glow(380, 330, 520, "rgba(40,80,230,A)", 1);
      glow(520, 760, 460, "rgba(20,170,255,A)", 1);
      glow(900, 640, 380, "rgba(20,220,220,A)", 0.95);
      glow(1150, 400, 480, "rgba(150,60,240,A)", 1);
      glow(1330, 300, 300, "rgba(210,50,170,A)", 0.9);
      glow(300, 820, 260, "rgba(215,150,225,A)", 0.55);
      glow(760, 380, 300, "rgba(60,100,230,A)", 0.5);
      glow(1100, 760, 280, "rgba(80,60,170,A)", 0.5);
      // dust lanes
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 12; i++) {
        const x = rnd() * W;
        const y = 100 + rnd() * 700;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 70 + rnd() * 90);
        g.addColorStop(0, "rgba(10,10,40,0.28)");
        g.addColorStop(1, "rgba(10,10,40,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - 200, y - 200, 400, 400);
      }
      // stars
      for (let i = 0; i < 2400; i++) {
        const x = rnd() * W;
        const y = rnd() * H;
        const r = rnd() < 0.96 ? 0.5 + rnd() * 0.9 : 1.4 + rnd() * 1.4;
        ctx.fillStyle = `rgba(255,255,255,${0.35 + rnd() * 0.65})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      [[1125, 392, 70], [415, 405, 40], [735, 565, 55]].forEach(([x, y, r]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.25, "rgba(210,230,255,0.4)");
        g.addColorStop(1, "rgba(210,230,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      });

      // Menu bar
      ctx.fillStyle = "rgba(24,26,50,0.62)";
      ctx.fillRect(0, 0, W, 30);
      ctx.fillStyle = "#fff";
      ctx.beginPath(); // apple mark
      ctx.arc(26, 17, 6.5, 0, Math.PI * 2);
      ctx.arc(32, 17, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(24, 9, 10, 8);
      ctx.fillStyle = "#24c24a";
      ctx.beginPath();
      ctx.ellipse(30, 8, 3, 1.6, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.font = `bold 15px ${FONT}`;
      ctx.fillText("Finder", 62, 21);
      ctx.font = `14px ${FONT}`;
      ["File", "Edit", "View", "Go", "Window", "Help"].forEach((m, i) => ctx.fillText(m, 134 + [0, 44, 88, 142, 176, 250][i], 21));
      ctx.textAlign = "right";
      ctx.fillText("Sat 11 May  11:39 AM", W - 22, 21);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); // battery
      ctx.roundRect(1240, 11, 22, 11, 3);
      ctx.stroke();
      ctx.fillRect(1242, 13, 15, 7);
      [4, 8, 12].forEach((r) => {
        ctx.beginPath();
        ctx.arc(1300, 22, r, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      });
      ctx.beginPath(); // search
      ctx.arc(1338, 15, 5, 0, Math.PI * 2);
      ctx.moveTo(1342, 19);
      ctx.lineTo(1347, 24);
      ctx.stroke();

      // ─── Code editor window (VS Code style) ───────────────────────────────
      const WX = 96;
      const WY = 54;
      const WW = W - 192;
      const WH = 792;
      const MONO = "'SF Mono', Menlo, Consolas, 'Courier New', monospace";
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = "#11131c";
      ctx.beginPath();
      ctx.roundRect(WX, WY, WW, WH, 12);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(WX, WY, WW, WH, 12);
      ctx.clip();

      // Title bar
      ctx.fillStyle = "#1d2030";
      ctx.fillRect(WX, WY, WW, 38);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(WX + 22 + i * 22, WY + 19, 6.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#9aa3b8";
      ctx.font = `13px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText("VDRVerificationEngine.ts — settlemint-vdr", WX + WW / 2, WY + 24);

      // Activity bar
      const AB = 54;
      ctx.fillStyle = "#171925";
      ctx.fillRect(WX, WY + 38, AB, WH - 38 - 26);
      [0, 1, 2, 3, 4].forEach((i) => {
        ctx.strokeStyle = i === 0 ? "#e5e7eb" : "#5b6275";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(WX + 17, WY + 62 + i * 52, 20, 20, 4);
        ctx.stroke();
      });
      ctx.fillStyle = "#6d7cff";
      ctx.fillRect(WX, WY + 56, 2, 36);

      // Explorer sidebar
      const SBW = 250;
      ctx.fillStyle = "#1a1c28";
      ctx.fillRect(WX + AB, WY + 38, SBW, WH - 38 - 26);
      ctx.textAlign = "left";
      ctx.fillStyle = "#8b93a8";
      ctx.font = `600 11px ${FONT}`;
      ctx.fillText("EXPLORER", WX + AB + 18, WY + 62);
      const tree: Array<[string, number, string, boolean?]> = [
        ["▾ SETTLEMINT-VDR", 0, "#c9d1e3"],
        ["▾ src", 1, "#c9d1e3"],
        ["▾ services", 2, "#c9d1e3"],
        ["VDRVerificationEngine.ts", 3, "#ffffff", true],
        ["agents.ts", 3, "#9aa3b8"],
        ["rag.ts", 3, "#9aa3b8"],
        ["▾ contracts", 2, "#c9d1e3"],
        ["Registry.sol", 3, "#9aa3b8"],
        ["▸ api", 2, "#c9d1e3"],
        ["package.json", 1, "#9aa3b8"],
        ["docker-compose.yml", 1, "#9aa3b8"],
        ["README.md", 1, "#9aa3b8"],
      ];
      tree.forEach(([name, depth, col, active], i) => {
        const y = WY + 92 + i * 26;
        if (active) {
          ctx.fillStyle = "rgba(109,124,255,0.22)";
          ctx.fillRect(WX + AB, y - 17, SBW, 25);
        }
        ctx.fillStyle = col;
        ctx.font = `13px ${FONT}`;
        ctx.fillText(name, WX + AB + 18 + depth * 16, y);
      });

      // Editor area
      const EX = WX + AB + SBW;
      const EW = WW - AB - SBW;
      ctx.fillStyle = "#11131c";
      ctx.fillRect(EX, WY + 38, EW, WH - 38 - 26);
      // tabs
      ctx.fillStyle = "#171925";
      ctx.fillRect(EX, WY + 38, EW, 38);
      [["VDRVerificationEngine.ts", true], ["agents.ts", false], ["Registry.sol", false]].forEach(([name, act], i) => {
        const tx = EX + i * 212;
        ctx.fillStyle = act ? "#11131c" : "#171925";
        ctx.fillRect(tx, WY + 38, 210, 38);
        if (act) {
          ctx.fillStyle = "#6d7cff";
          ctx.fillRect(tx, WY + 38, 210, 2);
        }
        ctx.fillStyle = act ? "#e5e7eb" : "#7b8399";
        ctx.font = `13px ${FONT}`;
        ctx.fillText(name as string, tx + 18, WY + 62);
      });

      // Syntax-highlighted code
      const KEYWORDS = /^(import|from|export|class|private|readonly|async|await|const|return|new|true|false|interface|type)$/;
      const code = [
        "import { PolygonRegistry } from '@settlemint/core';",
        "import { MultiTenantRAG } from '@enterprise/ai';",
        "import { StateGraph } from '@langchain/langgraph';",
        "",
        "// Tamper-proof document verification service",
        "export class VDRVerificationEngine {",
        "  private readonly dailyCapacity = 100_000;",
        "",
        "  async verifyDocument(id: string): Promise<Proof> {",
        "    const hash = await PolygonRegistry.hashOf(id);",
        "    const diff = await MultiTenantRAG.analyze(id);",
        "    return { verified: true, hash, latencyMs: 12 };",
        "  }",
        "}",
        "",
        "// Multi-agent review pipeline",
        "const graph = new StateGraph(AgentState)",
        "  .addNode('retrieve', retrieveDocs)",
        "  .addNode('review', reviewWithLLM)",
        "  .addEdge('retrieve', 'review')",
        "  .compile();",
      ];
      const CODE_Y = WY + 106;
      const LH = 24;
      const CODE_X = EX + 64;
      ctx.font = `15px ${MONO}`;
      const cw = ctx.measureText("M").width;
      const TERM_H = 176;
      const codeClipBottom = WY + WH - 26 - TERM_H;
      ctx.save();
      ctx.beginPath();
      ctx.rect(EX, WY + 76, EW - 96, codeClipBottom - (WY + 76));
      ctx.clip();
      // active line highlight
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(EX, CODE_Y + 9 * LH - 17, EW, LH);
      code.forEach((line, i) => {
        const y = CODE_Y + i * LH;
        ctx.fillStyle = i === 9 ? "#c9d1e3" : "#4b5266";
        ctx.textAlign = "right";
        ctx.fillText(String(i + 1), EX + 44, y);
        ctx.textAlign = "left";
        const re = /(\/\/.*$)|('[^']*')|(\b[A-Za-z_]\w*\b)|(\d[\d_]*)|(\s+|.)/g;
        let m: RegExpExecArray | null;
        let x = CODE_X;
        while ((m = re.exec(line))) {
          const tok = m[0];
          let col = "#abb2bf";
          if (m[1]) col = "#5c6370";
          else if (m[2]) col = "#98c379";
          else if (m[3]) {
            if (KEYWORDS.test(tok)) col = "#c678dd";
            else if (/^[A-Z]/.test(tok)) col = "#e5c07b";
            else if (line[re.lastIndex] === "(") col = "#61afef";
          } else if (m[4]) col = "#d19a66";
          ctx.fillStyle = col;
          ctx.fillText(tok, x, y);
          x += cw * tok.length;
        }
      });
      // blinking-cursor stand-in
      ctx.fillStyle = "#6d7cff";
      ctx.fillRect(CODE_X + cw * 49, CODE_Y + 9 * LH - 15, 2, 20);
      ctx.restore();

      // Minimap
      const MMX = EX + EW - 90;
      ctx.fillStyle = "#13151f";
      ctx.fillRect(MMX, WY + 76, 90, codeClipBottom - (WY + 76));
      code.forEach((line, i) => {
        if (!line.trim()) return;
        const indent = line.length - line.trimStart().length;
        ctx.fillStyle = line.trim().startsWith("//") ? "rgba(92,99,112,0.8)" : i % 3 === 0 ? "rgba(198,120,221,0.7)" : "rgba(97,175,239,0.6)";
        ctx.fillRect(MMX + 8 + indent * 2.5, WY + 90 + i * 7, Math.min(70, line.trim().length * 1.5), 3);
      });

      // Terminal panel
      const TY = WY + WH - 26 - TERM_H;
      ctx.fillStyle = "#0d0f17";
      ctx.fillRect(EX, TY, EW, TERM_H);
      ctx.fillStyle = "#2a2e3f";
      ctx.fillRect(EX, TY, EW, 1);
      ctx.font = `600 12px ${FONT}`;
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText("TERMINAL", EX + 20, TY + 24);
      ctx.fillStyle = "#6d7cff";
      ctx.fillRect(EX + 20, TY + 30, 66, 2);
      ctx.font = `14px ${MONO}`;
      const term: Array<[string, string]> = [
        ["$ npm run verify", "#e5e7eb"],
        ["✓ 50,214 documents verified · avg 12ms", "#4ade80"],
        ["✓ Polygon registry in sync (block 61,204,118)", "#4ade80"],
        ["agent graph compiled · 4 nodes · 0 errors", "#7dd3fc"],
        ["$ ▌", "#e5e7eb"],
      ];
      term.forEach(([t, col], i) => {
        ctx.fillStyle = col;
        ctx.fillText(t, EX + 20, TY + 58 + i * 23);
      });

      // Status bar
      ctx.fillStyle = "#3b5bdb";
      ctx.fillRect(WX, WY + WH - 26, WW, 26);
      ctx.fillStyle = "#fff";
      ctx.font = `12px ${FONT}`;
      ctx.fillText("⎇ main", WX + 14, WY + WH - 8);
      ctx.fillText("✓ 0  ⚠ 0", WX + 90, WY + WH - 8);
      ctx.textAlign = "right";
      ctx.fillText("Ln 10, Col 50    Spaces: 2    UTF-8    TypeScript", WX + WW - 16, WY + WH - 8);
      ctx.textAlign = "left";
      ctx.restore();

      // Dock
      type DockApp = [string, string | [string, string]];
      const dockApps: DockApp[] = [
        ["finder", ["#56b6ff", "#1e6fe0"]], ["launchpad", ["#e5e7eb", "#9ca3af"]], ["safari", "#fff"], ["messages", ["#4ee06a", "#16a34a"]],
        ["mail", ["#38bdf8", "#2563eb"]], ["maps", "#fff"], ["photos", "#fff"], ["facetime", ["#4ee06a", "#16a34a"]],
        ["calendarMon", "#fff"], ["contacts", "#d9d9de"], ["reminders", "#fff"], ["notes", "#fff"],
        ["tv", "#000"], ["music", "#fff"], ["podcasts", ["#c084fc", "#7e22ce"]], ["appstore", ["#38bdf8", "#2563eb"]],
        ["settings", ["#d1d5db", "#6b7280"]], ["terminal", "#0a0a0a"], ["chrome", "#fff"], ["files", "#fff"], ["trash", ["#e5e7eb", "#9ca3af"]],
      ];
      const IS = 56;
      const GAP = 6;
      const dockW = dockApps.length * (IS + GAP) + 18;
      const dockX = (W - dockW) / 2;
      const dockY = H - 86;
      ctx.fillStyle = "rgba(200,205,235,0.32)";
      ctx.beginPath();
      ctx.roundRect(dockX, dockY, dockW, 74, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      dockApps.forEach(([name, fill], i) => drawIcon(ctx, dockX + 15 + i * (IS + GAP), dockY + 9, IS, name, fill));
    };

    // iPadOS-style home screen (4:3) painted onto a 1280×960 canvas
    const drawTabletHomeScreen = (ctx: CanvasRenderingContext2D) => {
      // real local time (this canvas is redrawn whenever the minute changes)
      const nowDate = new Date();
      const clockNow = {
        time: nowDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M/i, ""),
        longDate: nowDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
        weekday: nowDate.toLocaleDateString("en-US", { weekday: "long" }),
        day: nowDate.getDate(),
      };
      const W = 1280;
      const H = 960;
      const FONT = "-apple-system, 'Helvetica Neue', Arial, sans-serif";

      // Wallpaper
      ctx.fillStyle = "#dc4a44";
      ctx.fillRect(0, 0, W, H);
      const top = ctx.createLinearGradient(0, 0, W * 0.8, 0);
      top.addColorStop(0, "rgba(255,150,60,0)");
      top.addColorStop(0.7, "rgba(255,160,64,0.75)");
      top.addColorStop(1, "rgba(255,160,64,0.2)");
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, W, 330);
      const pink = ctx.createLinearGradient(0, 600, 0, H);
      pink.addColorStop(0, "rgba(210,70,120,0)");
      pink.addColorStop(1, "rgba(200,80,150,0.55)");
      ctx.fillStyle = pink;
      ctx.fillRect(0, 600, W, 360);

      ctx.fillStyle = "#a9b6cc"; // grey-blue wedge, top right
      ctx.beginPath();
      ctx.moveTo(1110, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, 520);
      ctx.bezierCurveTo(1150, 380, 1000, 330, 960, 310);
      ctx.bezierCurveTo(1050, 200, 1090, 100, 1110, 0);
      ctx.fill();

      const blue = ctx.createLinearGradient(0, 300, 0, H);
      blue.addColorStop(0, "#0f4a86");
      blue.addColorStop(0.55, "#2b5da3");
      blue.addColorStop(1, "#9a5bb0");
      ctx.fillStyle = blue; // deep-blue wave
      ctx.beginPath();
      ctx.moveTo(960, 310);
      ctx.bezierCurveTo(860, 420, 640, 640, 616, 735);
      ctx.bezierCurveTo(640, 800, 760, 770, 880, 690);
      ctx.bezierCurveTo(1020, 590, 1160, 520, W, 520);
      ctx.lineTo(W, H);
      ctx.lineTo(980, H);
      ctx.lineTo(760, H);
      ctx.bezierCurveTo(700, 880, 640, 800, 616, 735);
      ctx.fill();
      ctx.fillStyle = "rgba(190,80,150,0.35)";
      ctx.fillRect(600, 760, W - 600, 200);

      ctx.fillStyle = "#aeb8cb"; // bottom-left corner
      ctx.beginPath();
      ctx.moveTo(0, 780);
      ctx.lineTo(0, H);
      ctx.lineTo(165, H);
      ctx.bezierCurveTo(100, 900, 40, 840, 0, 780);
      ctx.fill();

      // Status bar (right)
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `13px ${FONT}`;
      ctx.textAlign = "right";
      ctx.fillText("100%", 1236, 20);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(1240, 9, 24, 12, 3.5);
      ctx.stroke();
      ctx.fillRect(1242, 11, 20, 8);
      [3, 6, 9].forEach((r) => {
        ctx.beginPath();
        ctx.arc(1180, 21, r, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      });

      // Clock + date
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.font = `300 76px ${FONT}`;
      ctx.fillText(clockNow.time, 70, 128);
      ctx.font = `23px ${FONT}`;
      ctx.fillText(clockNow.longDate, 76, 160);

      // Widgets
      const widget = (x: number, y: number, w: number, h: number, fill: string | CanvasGradient) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 24);
        ctx.fill();
      };
      const wrap = (txt: string, x: number, y: number, lh: number) => txt.split("\n").forEach((l, i) => ctx.fillText(l, x, y + i * lh));

      // Calendar widget
      widget(71, 185, 159, 159, "#fff");
      ctx.fillStyle = "#e0342b";
      ctx.font = `bold 13px ${FONT}`;
      ctx.fillText(clockNow.weekday.toUpperCase(), 88, 215);
      ctx.fillStyle = "#111";
      ctx.font = `300 42px ${FONT}`;
      ctx.fillText(String(clockNow.day), 87, 256);
      [["#2f7cf6", "Kickoff meeting wi...", "10:30–1:00 PM", 272], ["#34a853", "Bicycle tune-up", "1:30–2:15 PM", 310]].forEach(([col, a, b, y]) => {
        ctx.fillStyle = col as string;
        ctx.fillRect(88, y as number, 3, 30);
        ctx.fillStyle = "#111";
        ctx.font = `bold 14px ${FONT}`;
        ctx.fillText(a as string, 98, (y as number) + 13);
        ctx.fillStyle = "#6b7280";
        ctx.font = `13px ${FONT}`;
        ctx.fillText(b as string, 98, (y as number) + 29);
      });

      // Weather widget
      const wg = ctx.createLinearGradient(0, 185, 0, 344);
      wg.addColorStop(0, "#2f8ec4");
      wg.addColorStop(1, "#6aaed4");
      widget(253, 185, 159, 159, wg);
      ctx.fillStyle = "#fff";
      ctx.font = `600 16px ${FONT}`;
      ctx.fillText("San Francisco", 270, 213);
      ctx.font = `300 52px ${FONT}`;
      ctx.fillText("61°", 268, 262);
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.arc(278, 284, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `14px ${FONT}`;
      ctx.fillText("Mostly Sunny", 270, 322);
      ctx.fillText("H:70° L:53°", 270, 340);

      // News widget
      widget(71, 367, 341, 158, "#fff");
      ctx.fillStyle = "#d3202a";
      ctx.font = `bold 20px ${FONT}`;
      ctx.fillText("Top Stories", 88, 398);
      drawIcon(ctx, 377, 380, 20, "news", "#fff");
      ctx.fillStyle = "#9ca3af";
      ctx.font = `10px ${FONT}`;
      ctx.fillText("NBC", 88, 421);
      ctx.fillStyle = "#111";
      ctx.font = `bold 16px ${FONT}`;
      wrap("Climate concerns as Siberia experiences\nrecord-breaking heat", 88, 440, 18);
      ctx.fillStyle = "#9ca3af";
      ctx.font = `9px serif`;
      ctx.fillText("THE WALL STREET JOURNAL.", 88, 477);
      ctx.fillStyle = "#111";
      ctx.font = `bold 16px ${FONT}`;
      wrap("Traditional Sports Look to Gamers to\nReshape Viewers' Experience", 88, 496, 18);
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.roundRect(356, 418, 52, 40, 5);
      ctx.fill();
      ctx.fillStyle = "#3b6aa0";
      ctx.beginPath();
      ctx.roundRect(356, 470, 52, 40, 5);
      ctx.fill();

      // Music widget
      widget(71, 548, 341, 159, "#fff");
      ctx.fillStyle = "#8b2a3a";
      ctx.beginPath();
      ctx.roundRect(88, 562, 38, 38, 6);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.font = `bold 17px ${FONT}`;
      ctx.fillText("Chromatica", 136, 578);
      ctx.fillStyle = "#e0425c";
      ctx.font = `15px ${FONT}`;
      ctx.fillText("Lady Gaga", 136, 598);
      drawIcon(ctx, 380, 562, 22, "music", "#fff");
      ["#4b5563", "#e8f04a", "#111111", "#e6d9c2"].forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(87 + i * 80.5, 623, 67, 67, 5);
        ctx.fill();
      });
      ctx.fillStyle = "#ff6a1a";
      ctx.beginPath();
      ctx.arc(87 + 2 * 80.5 + 33, 656, 22, 0, Math.PI * 2);
      ctx.fill();

      // App grid
      const IS = 65;
      const colX = [513, 646, 779, 912, 1045, 1178];
      const rowY = [117, 268, 419, 570];
      type TabApp = [string, string, string | [string, string]];
      const green: [string, string] = ["#4ee06a", "#16a34a"];
      const blueG: [string, string] = ["#38bdf8", "#2563eb"];
      const apps: TabApp[][] = [
        [["FaceTime", "facetime", green], ["Calendar", "calendarMon", "#fff"], ["Clock", "clock", "#000"], ["Home", "home", "#fff"], ["Photos", "photos", "#fff"], ["Camera", "camera", ["#d4d4d8", "#71717a"]]],
        [["Reminders", "reminders", "#fff"], ["Notes", "notes", "#fff"], ["Voice Memos", "voicememos", "#0a0a0a"], ["Contacts", "contacts", "#d9d9de"], ["Maps", "maps", "#fff"], ["Find My", "findmy", "#d4d4d8"]],
        [["App Store", "appstore", blueG], ["Books", "books", ["#fb923c", "#ea580c"]], ["Podcasts", "podcasts", ["#c084fc", "#7e22ce"]], ["TV", "tv", "#000"], ["News", "news", "#fff"], ["Stocks", "stocks", "#000"]],
        [["Measure", "measure", "#0a0a0a"], ["Settings", "settings", ["#d1d5db", "#6b7280"]]],
      ];
      ctx.textAlign = "center";
      apps.forEach((row, r) =>
        row.forEach(([name, g, fill], c) => {
          drawIcon(ctx, colX[c] - IS / 2, rowY[r] - IS / 2, IS, g, fill);
          ctx.fillStyle = "#fff";
          ctx.font = `15px ${FONT}`;
          ctx.fillText(name, colX[c], rowY[r] + IS / 2 + 17);
        })
      );

      // Page dots
      [0, 1].forEach((i) => {
        ctx.fillStyle = i === 0 ? "#fff" : "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(633 + i * 14, 808, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dock
      const dockG = ctx.createLinearGradient(297, 0, 984, 0);
      dockG.addColorStop(0, "rgba(255,105,125,0.95)");
      dockG.addColorStop(1, "rgba(200,100,190,0.95)");
      ctx.fillStyle = dockG;
      ctx.beginPath();
      ctx.roundRect(297, 840, 687, 99, 34);
      ctx.fill();
      const dockApps: TabApp[] = [
        ["", "messages", green],
        ["", "safari", "#fff"],
        ["", "music", "#fff"],
        ["", "mail", blueG],
        ["", "files", "#fff"],
        ["", "photos", "#fff"],
        ["", "news", "#fff"],
        ["", "notes", "#fff"],
      ];
      const dockX = [346, 427, 509, 590, 672, 772, 853, 935];
      dockApps.forEach(([, g, fill], i) => drawIcon(ctx, dockX[i] - IS / 2, 889 - IS / 2, IS, g, fill));
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(722, 858);
      ctx.lineTo(722, 920);
      ctx.stroke();
    };

    // The laptop and phone screens are static (painted once). The tablet shows the real time, so it is
    // repainted once a minute, when the minute changes.
    let laptopDrawn = false;
    let lastTabletMinute = -1;
    let phoneDrawn = false;
    const updateScreens = () => {
      const drawLaptop = !laptopDrawn;
      const tabletMinute = Math.floor(Date.now() / 60000);
      const drawTablet = tabletMinute !== lastTabletMinute;
      if (!drawLaptop && !drawTablet && phoneDrawn) return;
      laptopDrawn = true;
      lastTabletMinute = tabletMinute;

      // ─── LAPTOP DISPLAY (static macOS desktop, drawn once) ───────────────
      if (drawLaptop) {
        drawMacDesktop(lCtx);
        laptopTexture.needsUpdate = true;
      }

      // ─── TABLET DISPLAY ───────────────────────────────────────────────────
      if (drawTablet) {
        drawTabletHomeScreen(tCtx);
        tabletTexture.needsUpdate = true;
      }

      // ─── PHONE DISPLAY (static iOS home screen, drawn once) ───────────────
      if (phoneDrawn) return;
      phoneDrawn = true;
      drawPhoneHomeScreen(pCtx);

      phoneTexture.needsUpdate = true;
    };

    // ─── 3D Interactive Device Models ──────────────────────────────────────
    const interactables: THREE.Object3D[] = [];

    const roundedPlane = (w: number, h: number, r: number) => {
      const x = -w / 2;
      const y = -h / 2;
      const shape = new THREE.Shape();
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
      shape.lineTo(x + w, y + h - r);
      shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
      shape.lineTo(x + r, y + h);
      shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
      shape.lineTo(x, y + r);
      shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
      const g = new THREE.ShapeGeometry(shape, 12);
      const pos = g.attributes.position;
      const uv = g.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
      return g;
    };

    const steelMat = new THREE.MeshPhysicalMaterial({
      color: 0xc7cacf,
      metalness: 1,
      roughness: 0.2,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });
    const blackGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x020203,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    });

    // Rounded-outline slab (proper plan-view corner radius, small bevel) used for device bodies
    const makeRoundedSlab = (w: number, h: number, r: number, thick: number, bevel: number) => {
      const iw = w - bevel * 2;
      const ih = h - bevel * 2;
      const ir = r - bevel;
      const x = -iw / 2;
      const y = -ih / 2;
      const shape = new THREE.Shape();
      shape.moveTo(x + ir, y);
      shape.lineTo(x + iw - ir, y);
      shape.absarc(x + iw - ir, y + ir, ir, -Math.PI / 2, 0, false);
      shape.lineTo(x + iw, y + ih - ir);
      shape.absarc(x + iw - ir, y + ih - ir, ir, 0, Math.PI / 2, false);
      shape.lineTo(x + ir, y + ih);
      shape.absarc(x + ir, y + ih - ir, ir, Math.PI / 2, Math.PI, false);
      shape.lineTo(x, y + ir);
      shape.absarc(x + ir, y + ir, ir, Math.PI, Math.PI * 1.5, false);
      const depth = thick - bevel * 2;
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 5,
        curveSegments: 20,
      });
      geo.translate(0, 0, -depth / 2);
      return geo;
    };

    // 1. MACBOOK PRO 14" (Center): silver unibody, thin black bezel with camera notch, full-size 3D keyboard
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.15, 0.02, 0.15);
    laptopGroup.scale.setScalar(0.92); // 14-inch is a touch smaller than the 16-inch
    laptopGroup.userData = { device: "laptop" };

    const lBase = new THREE.Mesh(makeRoundedSlab(2.55, 1.72, 0.07, 0.055, 0.02), steelMat);
    lBase.rotation.x = -Math.PI / 2;
    lBase.position.set(0, 0.0275, 0);
    lBase.castShadow = true;
    lBase.receiveShadow = true;
    laptopGroup.add(lBase);

    // Keyboard: real 3D keycaps (instanced) + one merged legend mesh, black-on-dark like the MacBook Pro
    type KeyDef = [string, number];
    const KB_W = 2.28; // total keyboard width
    const KB_ROWS: Array<{ h: number; keys: KeyDef[] }> = [
      {
        h: 0.62,
        keys: [["esc", 1.5], ...Array.from({ length: 12 }, (_, i): KeyDef => [`F${i + 1}`, 1]), ["", 1.5]],
      },
      {
        h: 1,
        keys: [..."`1234567890-=".split("").map((k): KeyDef => [k, 1]), ["delete", 1.5]],
      },
      {
        h: 1,
        keys: [["tab", 1.5], ..."QWERTYUIOP[]".split("").map((k): KeyDef => [k, 1]), ["\\", 1.5]],
      },
      {
        h: 1,
        keys: [["caps lock", 1.75], ..."ASDFGHJKL;'".split("").map((k): KeyDef => [k, 1]), ["return", 1.75]],
      },
      {
        h: 1,
        keys: [["shift", 2.25], ..."ZXCVBNM,./".split("").map((k): KeyDef => [k, 1]), ["shift", 2.25]],
      },
      {
        h: 1,
        keys: [["fn", 1], ["control", 1], ["option", 1], ["command", 1.25], ["", 5.5], ["command", 1.25], ["option", 1], ["◀", 1], ["▲▼", 1], ["▶", 1]],
      },
    ];
    const KB_UNIT = KB_W / 15; // width of a 1u key (incl. gap)
    const KEY_GAP = 0.012;
    const KEY_H = 0.013;
    const KB_Z = -0.3;
    const KEY_TOP = 0.0565 + KEY_H;

    // Legend atlas: one cell per unique label
    const labels = Array.from(new Set(KB_ROWS.flatMap((r) => r.keys.map((k) => k[0])).filter(Boolean)));
    const ATLAS_COLS = 10;
    const CELL_W = 160;
    const CELL_H = 80;
    const atlas = document.createElement("canvas");
    atlas.width = ATLAS_COLS * CELL_W;
    atlas.height = Math.ceil(labels.length / ATLAS_COLS) * CELL_H;
    {
      const g = atlas.getContext("2d")!;
      g.fillStyle = "#f1f2f6";
      g.textAlign = "center";
      g.textBaseline = "middle";
      labels.forEach((l, i) => {
        const cx = (i % ATLAS_COLS) * CELL_W + CELL_W / 2;
        const cy = Math.floor(i / ATLAS_COLS) * CELL_H + CELL_H / 2;
        const isWord = l.length > 1 && !/^F\d+$/.test(l) && l !== "▲▼";
        g.font = isWord ? "600 26px -apple-system, Arial, sans-serif" : "600 40px -apple-system, Arial, sans-serif";
        if (l === "▲▼") {
          g.font = "600 22px Arial";
          g.fillText("▲", cx, cy - 15);
          g.fillText("▼", cx, cy + 15);
        } else {
          g.fillText(l, cx, cy);
        }
      });
    }
    const atlasTex = new THREE.CanvasTexture(atlas);
    atlasTex.colorSpace = THREE.SRGBColorSpace;
    atlasTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Dark recessed well under the keys
    const kbWell = new THREE.Mesh(
      new RoundedBoxGeometry(KB_W + 0.05, 0.012, 0.9, 2, 0.004),
      new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.8 })
    );
    kbWell.position.set(0, 0.0555, KB_Z);
    kbWell.receiveShadow = true;
    laptopGroup.add(kbWell);

    const keyCount = KB_ROWS.reduce((n, r) => n + r.keys.length, 0) + 2; // +2 extra half-height arrow keys
    const keyCaps = new THREE.InstancedMesh(
      new RoundedBoxGeometry(1, 1, 1, 3, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1c1d23, roughness: 0.48, metalness: 0.1 }),
      keyCount
    );
    keyCaps.receiveShadow = true;
    const legendPos: number[] = [];
    const legendUv: number[] = [];
    const legendIdx: number[] = [];
    const dummy = new THREE.Object3D();
    let ki = 0;
    const addKey = (label: string, cx: number, cz: number, kw: number, kd: number) => {
      dummy.position.set(cx, 0.0565 + KEY_H / 2, cz);
      dummy.scale.set(kw, KEY_H, kd);
      dummy.updateMatrix();
      keyCaps.setMatrixAt(ki++, dummy.matrix);
      const li = labels.indexOf(label);
      if (li < 0) return;
      const u0 = ((li % ATLAS_COLS) * CELL_W) / atlas.width;
      const u1 = u0 + CELL_W / atlas.width;
      const v1 = 1 - (Math.floor(li / ATLAS_COLS) * CELL_H) / atlas.height;
      const v0 = v1 - CELL_H / atlas.height;
      // Legend quad sized to the cell's aspect so text isn't stretched
      const lw = Math.min(kw * 0.9, 0.16);
      const lh = lw * (CELL_H / CELL_W);
      const base = legendPos.length / 3;
      legendPos.push(cx - lw / 2, KEY_TOP + 0.0006, cz + lh / 2, cx + lw / 2, KEY_TOP + 0.0006, cz + lh / 2, cx + lw / 2, KEY_TOP + 0.0006, cz - lh / 2, cx - lw / 2, KEY_TOP + 0.0006, cz - lh / 2);
      legendUv.push(u0, v0, u1, v0, u1, v1, u0, v1);
      legendIdx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };

    const totalDepth = KB_ROWS.reduce((n, r) => n + r.h, 0) * KB_UNIT;
    let zCursor = KB_Z - totalDepth / 2;
    KB_ROWS.forEach((row, ri) => {
      const kd = row.h * KB_UNIT - KEY_GAP;
      const cz = zCursor + (row.h * KB_UNIT) / 2;
      let xCursor = -KB_W / 2;
      row.keys.forEach(([label, w]) => {
        const kw = w * KB_UNIT - KEY_GAP;
        const cx = xCursor + (w * KB_UNIT) / 2;
        if (ri === KB_ROWS.length - 1 && label === "▲▼") {
          // inverted-T arrows: two half-height keys stacked
          addKey("▲", cx, cz - kd / 4 - 0.002, kw, kd / 2 - 0.002);
          addKey("▼", cx, cz + kd / 4 + 0.002, kw, kd / 2 - 0.002);
        } else if (ri === KB_ROWS.length - 1 && (label === "◀" || label === "▶")) {
          addKey(label, cx, cz + kd / 4 + 0.002, kw, kd / 2 - 0.002);
        } else {
          addKey(label, cx, cz, kw, kd);
        }
        xCursor += w * KB_UNIT;
      });
      zCursor += row.h * KB_UNIT;
    });
    keyCaps.count = ki;
    keyCaps.instanceMatrix.needsUpdate = true;
    laptopGroup.add(keyCaps);

    const legendGeo = new THREE.BufferGeometry();
    legendGeo.setAttribute("position", new THREE.Float32BufferAttribute(legendPos, 3));
    legendGeo.setAttribute("uv", new THREE.Float32BufferAttribute(legendUv, 2));
    legendGeo.setIndex(legendIdx);
    legendGeo.computeVertexNormals();
    const legends = new THREE.Mesh(
      legendGeo,
      new THREE.MeshBasicMaterial({
        map: atlasTex,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    laptopGroup.add(legends);

    // Force Touch trackpad (large glass pad, slightly recessed edge)
    const trackpad = new THREE.Mesh(
      new RoundedBoxGeometry(1.15, 0.004, 0.62, 3, 0.002),
      new THREE.MeshPhysicalMaterial({ color: 0xb4b8bf, metalness: 0.9, roughness: 0.16, clearcoat: 0.9 })
    );
    trackpad.position.set(0, 0.0575, 0.475);
    trackpad.receiveShadow = true;
    laptopGroup.add(trackpad);

    // Front thumb notch
    const thumbNotch = new THREE.Mesh(
      roundedPlane(0.34, 0.035, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x8e9299, metalness: 0.9, roughness: 0.35 })
    );
    thumbNotch.rotation.x = -Math.PI / 2;
    thumbNotch.position.set(0, 0.0562, 0.835);
    laptopGroup.add(thumbNotch);

    // Hinge barrel
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 2.3, 20), matteDarkMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.052, -0.84);
    laptopGroup.add(hinge);

    // Display lid
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.05, -0.86);
    lidGroup.rotation.x = -Math.PI * 0.12;

    const LID_H = 1.585;
    const lidBacking = new THREE.Mesh(makeRoundedSlab(2.55, LID_H, 0.05, 0.04, 0.015), steelMat);
    lidBacking.position.set(0, LID_H / 2, 0);
    lidBacking.castShadow = true;
    lidGroup.add(lidBacking);

    const lidBezel = new THREE.Mesh(roundedPlane(2.516, LID_H - 0.03, 0.036), blackGlassMat);
    lidBezel.position.set(0, LID_H / 2, 0.0205);
    lidGroup.add(lidBezel);

    // 16:10 display: thin sides/top, taller bottom chin
    const screenMesh = new THREE.Mesh(
      roundedPlane(2.44, 1.525, 0.012),
      new THREE.MeshBasicMaterial({ map: laptopTexture, toneMapped: false })
    );
    screenMesh.position.set(0, LID_H / 2, 0.0212);
    lidGroup.add(screenMesh);

    const lidCam = new THREE.Mesh(
      new THREE.CircleGeometry(0.005, 12),
      new THREE.MeshStandardMaterial({ color: 0x1b2433, roughness: 0.2, metalness: 0.6 })
    );
    lidCam.position.set(0, LID_H / 2 + 1.525 / 2 - 0.016, 0.0216);
    lidGroup.add(lidCam);

    // Camera notch (14-inch style), sits in the top bezel edge of the display
    const lidNotch = new THREE.Mesh(roundedPlane(0.2, 0.034, 0.012), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    lidNotch.position.set(0, LID_H / 2 + 1.525 / 2 - 0.016, 0.0214);
    lidGroup.add(lidNotch);

    laptopGroup.add(lidGroup);
    scene.add(laptopGroup);
    interactables.push(lBase, screenMesh, lidBacking);

    // 2. IPAD PRO (Left on Metallic Stand with Apple Pencil)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(-2.5, 0.02, 0.35);
    tabletGroup.rotation.y = Math.PI * 0.15;
    tabletGroup.userData = { device: "tablet" };

    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.04, 32), polishedBrassMat);
    standBase.position.set(0, 0.02, 0);
    standBase.castShadow = true;
    tabletGroup.add(standBase);

    const standArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.08), macAluminiumMat);
    standArm.position.set(0, 0.3, -0.12);
    standArm.rotation.x = Math.PI * 0.14;
    tabletGroup.add(standArm);

    const T_W = 1.68;
    const T_H = 1.29;
    const tHead = new THREE.Group();
    tHead.position.set(0, 0.6, 0);
    tHead.rotation.x = -Math.PI * 0.15;

    // Silver aluminium body, thin black bezel, 4:3 edge-to-edge display
    const tChassis = new THREE.Mesh(makeRoundedSlab(T_W, T_H, 0.07, 0.03, 0.01), steelMat);
    tChassis.castShadow = true;
    tHead.add(tChassis);

    const tBezel = new THREE.Mesh(roundedPlane(T_W - 0.024, T_H - 0.024, 0.056), blackGlassMat);
    tBezel.position.set(0, 0, 0.0155);
    tHead.add(tBezel);

    const tScreen = new THREE.Mesh(
      roundedPlane(1.57, 1.178, 0.03),
      new THREE.MeshBasicMaterial({ map: tabletTexture, toneMapped: false })
    );
    tScreen.position.set(0, 0, 0.0162);
    tHead.add(tScreen);

    // Soft glass reflection
    const tReflect = new THREE.Mesh(
      roundedPlane(T_W - 0.024, T_H - 0.024, 0.056),
      new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.06, roughness: 0.03, clearcoat: 1, depthWrite: false })
    );
    tReflect.position.set(0, 0, 0.0175);
    tHead.add(tReflect);

    // Front camera + sensors on the left bezel (landscape orientation)
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x1b2433, roughness: 0.2, metalness: 0.6 });
    [[0, 0.011], [0.05, 0.005], [-0.05, 0.005], [-0.1, 0.004]].forEach(([dy, r]) => {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(r, 16), sensorMat);
      dot.position.set(-(T_W / 2 - 0.042), dy, 0.0163);
      tHead.add(dot);
    });

    // Top-edge buttons
    [-0.62, -0.46].forEach((x) => {
      const btn = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.01, 0.012, 2, 0.004), steelMat);
      btn.position.set(x, T_H / 2 + 0.002, 0);
      tHead.add(btn);
    });

    tabletGroup.add(tHead);
    scene.add(tabletGroup);
    interactables.push(tChassis, tScreen, standBase);

    // 3. IPHONE X-style (stainless steel frame, notch, edge-to-edge glass) on a MagSafe-style puck
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(2.45, 0.02, 0.45);
    phoneGroup.rotation.y = -Math.PI * 0.14;
    phoneGroup.userData = { device: "phone" };

    const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.03, 48), macAluminiumMat);
    puck.position.set(0, 0.015, 0);
    puck.castShadow = true;
    phoneGroup.add(puck);

    const pHead = new THREE.Group();
    const PHONE_SCALE = 0.85;
    pHead.scale.setScalar(PHONE_SCALE);
    // y/z keep the bottom edge resting on the puck at any scale
    pHead.position.set(0, 0.052 + 0.578 * PHONE_SCALE, 0.19 - 0.47 * PHONE_SCALE);
    pHead.rotation.x = -Math.PI * 0.22;

    // Polished steel band. RoundedBoxGeometry clamps its radius to half the thickness, which left
    // near-square corners poking out past the rounded glass, so the body is extruded from a
    // properly rounded outline (corner radius 0.1) with a small bevel instead.
    const BEVEL = 0.012;
    const bodyShape = new THREE.Shape();
    {
      const w = 0.74 - BEVEL * 2;
      const h = 1.5 - BEVEL * 2;
      const r = 0.1 - BEVEL;
      const x = -w / 2;
      const y = -h / 2;
      bodyShape.moveTo(x + r, y);
      bodyShape.lineTo(x + w - r, y);
      bodyShape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
      bodyShape.lineTo(x + w, y + h - r);
      bodyShape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
      bodyShape.lineTo(x + r, y + h);
      bodyShape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
      bodyShape.lineTo(x, y + r);
      bodyShape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    }
    const bodyDepth = 0.036 - BEVEL * 2;
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: bodyDepth,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 5,
      curveSegments: 20,
    });
    bodyGeo.translate(0, 0, -bodyDepth / 2);
    const pBody = new THREE.Mesh(bodyGeo, steelMat);
    pBody.castShadow = true;
    pHead.add(pBody);

    // Front glass sits inside the flat front face (0.716 × 1.476) so it never overhangs the bevel
    const pGlass = new THREE.Mesh(roundedPlane(0.704, 1.464, 0.08), blackGlassMat);
    pGlass.position.set(0, 0, 0.0185);
    pHead.add(pGlass);

    // Display with iOS home screen
    const pScreen = new THREE.Mesh(
      roundedPlane(0.68, 1.36, 0.068),
      new THREE.MeshBasicMaterial({ map: phoneTexture, toneMapped: false })
    );
    pScreen.position.set(0, 0, 0.0192);
    pHead.add(pScreen);

    // Soft glass reflection over the display
    const pReflect = new THREE.Mesh(
      roundedPlane(0.704, 1.464, 0.08),
      new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.07, roughness: 0.03, clearcoat: 1, depthWrite: false })
    );
    pReflect.position.set(0, 0, 0.0205);
    pHead.add(pReflect);

    // Side buttons: mute switch, volume up/down (left), side button (right)
    const addPhoneButton = (x: number, y: number, h: number) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(0.016, h, 0.018, 2, 0.007), steelMat);
      b.position.set(x, y, 0);
      pHead.add(b);
    };
    addPhoneButton(-0.376, 0.46, 0.05);
    addPhoneButton(-0.376, 0.34, 0.1);
    addPhoneButton(-0.376, 0.2, 0.1);
    addPhoneButton(0.376, 0.28, 0.2);

    // Slim stand plate behind the phone
    const standPlate = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.95, 0.03, 3, 0.012), steelMat);
    standPlate.position.set(0, -0.3, -0.05);
    standPlate.castShadow = true;
    pHead.add(standPlate);

    // Antenna bands on the steel frame
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.6 });
    [-0.62, 0.62].forEach((y) => {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.742, 0.008, 0.0365), bandMat);
      band.position.set(0, y, 0);
      pHead.add(band);
    });

    phoneGroup.add(pHead);
    scene.add(phoneGroup);
    interactables.push(pBody, pScreen, puck);

    // 4. JADE PLANT IN A MATTE WHITE POT (replaces the flowering plant)
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(3.7, 0.02, -1.15);
    flowerGroup.scale.setScalar(1.15);

    const whiteCeramicMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f3, roughness: 0.55, metalness: 0, side: THREE.DoubleSide });
    const jadeStemMat = new THREE.MeshStandardMaterial({ color: 0x6b7a4a, roughness: 0.7 });
    const jadeLeafMats = [0x2c6a3a, 0x357641, 0x245a31].map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.02, side: THREE.DoubleSide })
    );

    // Pot: soft egg-shaped body with a thick rounded lip, revolved from one profile
    const jadePotProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.18, 0.0),
      new THREE.Vector2(0.26, 0.03),
      new THREE.Vector2(0.32, 0.14),
      new THREE.Vector2(0.365, 0.34),
      new THREE.Vector2(0.385, 0.52),
      new THREE.Vector2(0.375, 0.545),
      new THREE.Vector2(0.35, 0.54),
      new THREE.Vector2(0.34, 0.5),
      new THREE.Vector2(0.0, 0.5),
    ];
    const jadePot = new THREE.Mesh(new THREE.LatheGeometry(jadePotProfile, 64), whiteCeramicMat);
    jadePot.castShadow = true;
    jadePot.receiveShadow = true;
    flowerGroup.add(jadePot);

    const jadeSoil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.335, 0.335, 0.02, 32),
      new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.95 })
    );
    jadeSoil.position.y = 0.502; // top at 0.512, clear of the pot's inner floor at 0.5 (was coplanar → z-fighting stripes)
    flowerGroup.add(jadeSoil);

    // Branches: [lean angle, lean distance, height, thickness]
    const branchDefs: Array<[number, number, number, number]> = [
      [0.0, 0.02, 0.78, 0.034],
      [0.9, 0.2, 0.62, 0.028],
      [1.9, 0.26, 0.5, 0.026],
      [2.9, 0.22, 0.66, 0.028],
      [3.9, 0.28, 0.46, 0.026],
      [4.8, 0.24, 0.6, 0.028],
      [5.5, 0.18, 0.4, 0.024],
    ];
    const zAxis = new THREE.Vector3(0, 0, 1);
    const upVec = new THREE.Vector3(0, 1, 0);
    branchDefs.forEach(([ang, lean, h, thick], bi) => {
      const dx = Math.cos(ang);
      const dz = Math.sin(ang);
      const base = new THREE.Vector3(dx * 0.03, 0.49, dz * 0.03);
      const mid = new THREE.Vector3(dx * lean * 0.45, 0.49 + h * 0.5, dz * lean * 0.45);
      const tip = new THREE.Vector3(dx * lean, 0.49 + h, dz * lean);
      const curve = new THREE.CatmullRomCurve3([base, mid, tip]);

      const branch = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, thick, 8, false), jadeStemMat);
      branch.castShadow = true;
      flowerGroup.add(branch);

      // Thick paired leaves at each node, getting smaller toward the tip
      const nodes = [0.35, 0.55, 0.75, 0.95];
      nodes.forEach((t, ni) => {
        const p = curve.getPoint(t);
        const tan = curve.getTangent(t);
        const side = new THREE.Vector3().crossVectors(tan, upVec).normalize();
        if (side.lengthSq() < 0.01) side.set(1, 0, 0);
        const size = 1.15 - ni * 0.17 + (bi % 2) * 0.06;
        [1, -1].forEach((k, ki) => {
          const dir = side
            .clone()
            .multiplyScalar(k * 0.9)
            .addScaledVector(tan, 0.35)
            .add(new THREE.Vector3(dx * 0.35, 0.18, dz * 0.35))
            .normalize();
          const len = 0.2 * size;
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), jadeLeafMats[(bi + ni + ki) % 3]);
          leaf.scale.set(0.1 * size, 0.02, len / 2);
          leaf.position.copy(p).addScaledVector(dir, len / 2 + 0.01);
          leaf.quaternion.setFromUnitVectors(zAxis, dir);
          leaf.rotateZ((bi + ni) * 0.7 + ki * 0.5); // vary the roll so leaves aren't all flat
          leaf.castShadow = true;
          flowerGroup.add(leaf);
        });
      });

      // Crown pair of leaves on the tip
      const crownDir = new THREE.Vector3(dx * 0.3, 1, dz * 0.3).normalize();
      [0.5, -0.5].forEach((spread, ci) => {
        const dir = crownDir.clone().add(new THREE.Vector3(-dz * spread, 0.1, dx * spread)).normalize();
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), jadeLeafMats[(bi + ci) % 3]);
        leaf.scale.set(0.07, 0.018, 0.075);
        leaf.position.copy(tip).addScaledVector(dir, 0.07);
        leaf.quaternion.setFromUnitVectors(zAxis, dir);
        leaf.castShadow = true;
        flowerGroup.add(leaf);
      });
    });

    scene.add(flowerGroup);

    // 5. STATEMENT COFFEE MUG: glossy sunset-gradient glaze with a dev-themed wraparound print,
    // yellow lip, white interior, sculpted handle and a latte-art coffee surface
    const MUG_X = 2.4;
    const MUG_Z = -1.4;
    const MUG_H = 0.68;
    const mugGroup = new THREE.Group();
    mugGroup.position.set(MUG_X, 0, MUG_Z);
    scene.add(mugGroup);

    // Wraparound artwork (circumference : height ≈ 3 : 1, so shapes aren't stretched)
    const makeMugLogoTexture = () => {
      const W = 1536;
      const H = 512;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d")!;
      const sky = g.createLinearGradient(0, H, 0, 0);
      sky.addColorStop(0, "#4b21ff");
      sky.addColorStop(0.5, "#ff3d9a");
      sky.addColorStop(1, "#ffa927");
      g.fillStyle = sky;
      g.fillRect(0, 0, W, H);

      // scattered code glyphs and lightning bolts
      const bolt = (x: number, y: number, s: number, color: string) => {
        g.save();
        g.translate(x, y);
        g.scale(s, s);
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(8, -26); g.lineTo(-10, 4); g.lineTo(-1, 4); g.lineTo(-8, 26); g.lineTo(12, -6); g.lineTo(2, -6); g.closePath();
        g.fill();
        g.restore();
      };
      const glyphs = ["</>", "{ }", "01", ";", "#", "//", "( )", "=>"];
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      g.textAlign = "center";
      g.textBaseline = "middle";
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 14; col++) {
          const x = (col + (row % 2) * 0.5) * (W / 14) + 40;
          const y = 90 + row * 80;
          if (Math.abs(x - W / 2) < 330 && y > 120 && y < 400) continue; // keep the middle clear for the badge
          g.save();
          g.translate(x, y);
          g.rotate((rnd() - 0.5) * 0.5);
          if (rnd() < 0.28) bolt(0, 0, 0.8 + rnd() * 0.5, "#ffe13a");
          else {
            g.font = "bold 44px monospace";
            g.fillStyle = `rgba(255,255,255,${0.35 + rnd() * 0.4})`;
            g.fillText(glyphs[Math.floor(rnd() * glyphs.length)], 0, 0);
          }
          g.restore();
        }
      }

      // rim band + base band
      g.fillStyle = "#ffd23a";
      g.fillRect(0, 0, W, 38);
      g.fillStyle = "#14102b";
      g.fillRect(0, H - 34, W, 34);
      g.fillStyle = "#ffd23a";
      g.fillRect(0, H - 40, W, 6);

      // front badge (centred, because the texture is offset so its middle faces the camera)
      const bx = W / 2 - 270;
      const by = 120;
      g.fillStyle = "#14102b";
      g.beginPath();
      g.roundRect(bx - 8, by - 8, 556, 292, 52);
      g.fill();
      g.fillStyle = "#fffaf0";
      g.beginPath();
      g.roundRect(bx, by, 540, 276, 46);
      g.fill();
      bolt(bx + 90, by + 138, 3.2, "#ffc400");
      g.fillStyle = "#14102b";
      g.font = "900 120px monospace";
      g.textAlign = "left";
      g.fillText("</>", bx + 165, by + 120);
      g.font = "800 50px -apple-system, Arial, sans-serif";
      g.fillStyle = "#7a2cff";
      g.fillText("DEV FUEL", bx + 170, by + 215);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.wrapS = THREE.RepeatWrapping;
      tex.offset.x = 0.5; // lathe u=0 faces +z (the camera): put the badge there
      return tex;
    };
    const mugLogoTex = makeMugLogoTexture();
    const mugGlaze = new THREE.MeshPhysicalMaterial({
      map: mugLogoTex,
      color: 0x8c8c8c, // darkens the map a touch so the strong key light doesn't bleach it
      roughness: 0.4,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.3, // keep the glaze saturated instead of washed out by the studio reflections
    });

    // Outer wall: gently flared, mapped with the artwork (v = height, u = around)
    const wallPts: THREE.Vector2[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      wallPts.push(new THREE.Vector2(0.255 + 0.055 * Math.pow(t, 1.15) + 0.012 * Math.sin(Math.PI * t) ** 2, t * MUG_H));
    }
    const mugWall = new THREE.Mesh(new THREE.LatheGeometry(wallPts, 72), mugGlaze);
    mugWall.castShadow = true;
    mugWall.receiveShadow = true;
    mugGroup.add(mugWall);
    const mugBottom = new THREE.Mesh(new THREE.CircleGeometry(0.255, 48), new THREE.MeshStandardMaterial({ color: 0x14102b, roughness: 0.6 }));
    mugBottom.rotation.x = Math.PI / 2;
    mugBottom.position.y = 0.002;
    mugGroup.add(mugBottom);

    // Rounded yellow lip + white interior
    const lipMat = new THREE.MeshPhysicalMaterial({ color: 0xffc400, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 0.5 });
    const lipPts: THREE.Vector2[] = [new THREE.Vector2(0.31, MUG_H - 0.01)];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (i / 10); // half-circle over the rim
      lipPts.push(new THREE.Vector2(0.298 + 0.014 * Math.cos(Math.PI - a), MUG_H - 0.004 + 0.012 * Math.sin(a)));
    }
    const mugLip = new THREE.Mesh(new THREE.LatheGeometry(lipPts, 72), lipMat);
    mugGroup.add(mugLip);
    const innerMat = new THREE.MeshPhysicalMaterial({ color: 0xf8f3ea, roughness: 0.3, clearcoat: 0.6, side: THREE.DoubleSide });
    const mugInner = new THREE.Mesh(
      new THREE.LatheGeometry(
        [new THREE.Vector2(0.2, 0.06), new THREE.Vector2(0.272, 0.1), new THREE.Vector2(0.284, MUG_H - 0.004)],
        72
      ),
      innerMat
    );
    mugGroup.add(mugInner);

    // Coffee surface with latte art (a rosetta leaf)
    const coffeeCanvas = document.createElement("canvas");
    coffeeCanvas.width = coffeeCanvas.height = 256;
    {
      const g = coffeeCanvas.getContext("2d")!;
      const rg = g.createRadialGradient(128, 128, 20, 128, 128, 128);
      rg.addColorStop(0, "#3b1f0d");
      rg.addColorStop(0.7, "#4a2a12");
      rg.addColorStop(1, "#7a4a22");
      g.fillStyle = rg;
      g.fillRect(0, 0, 256, 256);
      g.fillStyle = "#f2deC2";
      for (let i = 0; i < 6; i++) {
        const y = 66 + i * 22;
        const w = 62 - i * 7;
        g.beginPath();
        g.ellipse(128, y, w, 14, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = "#3b1f0d";
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(128, 50);
      g.lineTo(128, 208);
      g.stroke();
      g.fillStyle = "#f2deC2";
      g.beginPath();
      g.ellipse(128, 214, 10, 12, 0, 0, Math.PI * 2);
      g.fill();
    }
    const coffeeTex = new THREE.CanvasTexture(coffeeCanvas);
    coffeeTex.colorSpace = THREE.SRGBColorSpace;
    const coffee = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 48),
      new THREE.MeshStandardMaterial({ map: coffeeTex, roughness: 0.15 })
    );
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = MUG_H - 0.065;
    mugGroup.add(coffee);

    // Sculpted handle: a smooth tube swept along a D-shaped curve
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.292, 0.58, 0),
      new THREE.Vector3(0.42, 0.585, 0),
      new THREE.Vector3(0.5, 0.45, 0),
      new THREE.Vector3(0.47, 0.25, 0),
      new THREE.Vector3(0.355, 0.15, 0),
      new THREE.Vector3(0.272, 0.14, 0),
    ]);
    const mugHandle = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 48, 0.034, 16, false),
      new THREE.MeshPhysicalMaterial({ color: 0x7a1fff, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 0.5 })
    );
    mugHandle.castShadow = true;
    mugGroup.add(mugHandle);

    // Steam: a few soft puffs that rise, sway, grow and fade
    const makeSteamTexture = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    };
    const steamTex = makeSteamTexture();
    const STEAM_COUNT = 9;
    const steamPuffs = Array.from({ length: STEAM_COUNT }, (_, i) => {
      const mat = new THREE.SpriteMaterial({
        map: steamTex,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        color: 0x8a8f98,
      });
      const sprite = new THREE.Sprite(mat);
      scene.add(sprite);
      return { sprite, mat, phase: i / STEAM_COUNT, wisp: i % 3 };
    });
    const updateSteam = (time: number, isEve: boolean) => {
      const col = isEve ? 0xe8e2d8 : 0x8a8f98;
      steamPuffs.forEach(({ sprite, mat, phase, wisp }) => {
        const t = (time * 0.22 + phase) % 1; // 0 → 1 over the puff's life
        const sway = Math.sin(time * 1.3 + wisp * 2.1 + t * 5) * 0.05 * t;
        sprite.position.set(
          MUG_X + (wisp - 1) * 0.07 + sway,
          0.7 + t * 0.55,
          MUG_Z + Math.cos(time * 1.1 + wisp) * 0.03
        );
        const size = 0.08 + t * 0.2;
        sprite.scale.set(size, size, 1);
        mat.opacity = Math.sin(t * Math.PI) * (isEve ? 0.4 : 0.32);
        mat.color.setHex(col);
      });
    };

    // 6. MINIMALIST DESKTOP SUCCULENT PLANT (Organic Realism)
    const plantGroup = new THREE.Group();
    plantGroup.position.set(-3.2, 0.02, -0.5);

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.52, 16), whitePotMat);
    pot.position.set(0, 0.26, 0);
    pot.castShadow = true;
    plantGroup.add(pot);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.33, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x1f1610, roughness: 0.9 })
    );
    soil.position.set(0, 0.51, 0);
    plantGroup.add(soil);

    // Succulent Leaves rosette
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + (i % 2) * 0.2;
      const radius = 0.18 + (i % 3) * 0.06;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 8), succulentLeafMat);
      leaf.position.set(Math.cos(angle) * radius, 0.58 + (i % 3) * 0.05, Math.sin(angle) * radius);
      leaf.rotation.x = Math.sin(angle) * 0.45;
      leaf.rotation.z = -Math.cos(angle) * 0.45;
      leaf.castShadow = true;
      plantGroup.add(leaf);
    }
    scene.add(plantGroup);

    // 7. OPEN HARDCOVER NOTEBOOK (black cover, curved ruled pages, elastic band, ribbon) & BALLPOINT PEN
    const notebookGroup = new THREE.Group();
    notebookGroup.position.set(-1.25, 0.02, 1.4);
    notebookGroup.rotation.y = Math.PI * 0.06;
    notebookGroup.userData = { device: "notebook" };

    const PW = 0.58; // page width
    const PD = 0.78; // page depth
    const COVER_T = 0.014;
    const BLOCK_T = 0.018;

    // Black leatherette cover, slightly larger than the pages
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x15151b, roughness: 0.72, metalness: 0.05 });
    const cover = new THREE.Mesh(makeRoundedSlab(PW * 2 + 0.06, PD + 0.06, 0.03, COVER_T, 0.005), coverMat);
    cover.rotation.x = -Math.PI / 2;
    cover.position.set(0, COVER_T / 2, 0);
    cover.castShadow = true;
    cover.receiveShadow = true;
    notebookGroup.add(cover);
    interactables.push(cover);

    // Page-edge texture: fine alternating stripes so the stack reads as many sheets
    const edgeCanvas = document.createElement("canvas");
    edgeCanvas.width = 8;
    edgeCanvas.height = 64;
    {
      const g = edgeCanvas.getContext("2d")!;
      for (let y = 0; y < 64; y += 4) {
        g.fillStyle = y % 8 === 0 ? "#f4eedc" : "#d8cfb4";
        g.fillRect(0, y, 8, 4);
      }
    }
    const edgeTex = new THREE.CanvasTexture(edgeCanvas);
    edgeTex.colorSpace = THREE.SRGBColorSpace;
    edgeTex.wrapT = THREE.RepeatWrapping;
    edgeTex.repeat.set(1, 1);
    const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.9 });

    // Two page blocks with gently curved tops that dip into the spine
    [-1, 1].forEach((side) => {
      const x = side * (PW / 2 + 0.005);
      const block = new THREE.Mesh(new THREE.BoxGeometry(PW, BLOCK_T, PD), edgeMat);
      block.position.set(x, COVER_T + BLOCK_T / 2, 0);
      block.castShadow = true;
      block.receiveShadow = true;
      notebookGroup.add(block);

      const top = new THREE.PlaneGeometry(PW, PD, 40, 1);
      const pos = top.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const lx = pos.getX(i); // -PW/2 .. PW/2
        const fromSpine = side === 1 ? (lx + PW / 2) / PW : (PW / 2 - lx) / PW; // 0 at spine, 1 at outer edge
        pos.setZ(i, -0.004 * Math.exp(-fromSpine * 9) + 0.004 * fromSpine);
      }
      top.computeVertexNormals();
      const page = new THREE.Mesh(
        top,
        new THREE.MeshStandardMaterial({ map: side === 1 ? notebookTex : notebookLeftTex, roughness: 0.92 })
      );
      page.rotation.x = -Math.PI / 2;
      page.position.set(x, COVER_T + BLOCK_T + 0.0045, 0);
      page.receiveShadow = true;
      notebookGroup.add(page);
      interactables.push(page);
    });

    // Elastic closure band along the right edge of the back cover
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.004, PD + 0.07),
      new THREE.MeshStandardMaterial({ color: 0x0b0b0f, roughness: 0.8 })
    );
    band.position.set(PW + 0.045, COVER_T + 0.002, 0);
    notebookGroup.add(band);

    // Ribbon bookmark trailing out of the spine over the front edge
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, 0.002, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x8a1c2b, roughness: 0.6 })
    );
    ribbon.position.set(0.02, COVER_T + BLOCK_T + 0.0055, PD / 2 + 0.12);
    ribbon.rotation.y = 0.08;
    notebookGroup.add(ribbon);

    // Ballpoint pen resting diagonally on the right page
    const penGroup = new THREE.Group();
    const penBlack = new THREE.MeshPhysicalMaterial({ color: 0x0d0d11, roughness: 0.25, metalness: 0.4, clearcoat: 0.8 });
    const penSilver = new THREE.MeshStandardMaterial({ color: 0xcfd2d7, metalness: 1, roughness: 0.22 });
    const along = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number) => {
      const m = new THREE.Mesh(geo, mat);
      m.rotation.z = Math.PI / 2; // cylinders default to the Y axis; lay them along X
      m.position.x = x;
      m.castShadow = true;
      penGroup.add(m);
      return m;
    };
    along(new THREE.CylinderGeometry(0.0125, 0.0125, 0.46, 24), penBlack, -0.05); // barrel
    along(new THREE.CylinderGeometry(0.013, 0.013, 0.02, 24), penSilver, -0.29); // end cap ring
    along(new THREE.CylinderGeometry(0.0105, 0.0125, 0.02, 24), penSilver, 0.19); // collar
    along(new THREE.CylinderGeometry(0.0055, 0.0105, 0.12, 24), penBlack, 0.26); // grip taper
    along(new THREE.CylinderGeometry(0.0012, 0.0055, 0.04, 16), penSilver, 0.336); // metal tip
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.0025, 0.007), penSilver);
    clip.position.set(-0.13, 0.0145, 0);
    clip.castShadow = true;
    penGroup.add(clip);
    const clipBall = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 12, 8), penSilver);
    clipBall.position.set(-0.01, 0.0135, 0);
    penGroup.add(clipBall);
    penGroup.position.set(0.3, COVER_T + BLOCK_T + 0.0045 + 0.0135, 0.16);
    penGroup.rotation.y = -0.55;
    notebookGroup.add(penGroup);

    scene.add(notebookGroup);

    // 8. DIGITAL DESK CLOCK (live: shows the visitor's local time with a blinking colon)
    const clockGroup = new THREE.Group();
    clockGroup.position.set(1.7, 0.02, -1.45);
    clockGroup.scale.setScalar(1.1);

    const clockBrass = new THREE.MeshStandardMaterial({ color: 0xcaa24a, metalness: 1, roughness: 0.25 });
    const clockBase = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.03, 0.2, 3, 0.012), clockBrass);
    clockBase.position.y = 0.015;
    clockBase.castShadow = true;
    clockBase.receiveShadow = true;
    clockGroup.add(clockBase);

    const clockTilt = new THREE.Group();
    clockTilt.position.set(0, 0.19, 0);
    clockTilt.rotation.x = -0.3;
    clockGroup.add(clockTilt);

    const clockBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.62, 0.3, 0.1, 5, 0.035),
      new THREE.MeshStandardMaterial({ color: 0x23242a, roughness: 0.45, metalness: 0.5 })
    );
    clockBody.castShadow = true;
    clockTilt.add(clockBody);

    const clockGlass = new THREE.Mesh(roundedPlane(0.57, 0.25, 0.02), blackGlassMat);
    clockGlass.position.z = 0.0505;
    clockTilt.add(clockGlass);

    const clockCanvas = document.createElement("canvas");
    clockCanvas.width = 512;
    clockCanvas.height = 224;
    const clockCtx = clockCanvas.getContext("2d")!;
    const clockFaceTex = new THREE.CanvasTexture(clockCanvas);
    clockFaceTex.colorSpace = THREE.SRGBColorSpace;
    clockFaceTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const clockDisplay = new THREE.Mesh(
      roundedPlane(0.55, 0.23, 0.015),
      new THREE.MeshBasicMaterial({ map: clockFaceTex, toneMapped: false })
    );
    clockDisplay.position.z = 0.0512;
    clockTilt.add(clockDisplay);

    // Little top buttons
    [-0.1, 0, 0.1].forEach((x) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.012, 0.03, 2, 0.005), clockBrass);
      b.position.set(x, 0.153, -0.01);
      clockTilt.add(b);
    });

    let lastClockSecond = -1;
    const updateClock = () => {
      const now = new Date();
      const sec = now.getSeconds();
      if (sec === lastClockSecond) return;
      lastClockSecond = sec;
      const c = clockCtx;
      c.fillStyle = "#050507";
      c.fillRect(0, 0, 512, 224);
      const h24 = now.getHours();
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      const hh = String(h12).padStart(2, " ");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const colon = sec % 2 === 0 ? ":" : " ";
      c.save();
      c.shadowColor = "#ff4a2e";
      c.shadowBlur = 28;
      c.fillStyle = "#ff6a4d";
      c.font = "700 128px 'SF Mono', Menlo, Consolas, monospace";
      c.textBaseline = "alphabetic";
      c.textAlign = "left";
      c.fillText(`${hh}${colon}${mm}`, 26, 140);
      c.font = "700 40px 'SF Mono', Menlo, Consolas, monospace";
      c.fillText(String(sec).padStart(2, "0"), 440, 100);
      c.font = "600 24px -apple-system, Arial, sans-serif";
      c.fillText(h24 >= 12 ? "PM" : "AM", 446, 140);
      c.restore();
      c.fillStyle = "rgba(255,106,77,0.6)";
      c.font = "500 26px -apple-system, Arial, sans-serif";
      c.textAlign = "left";
      const date = now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
      c.fillText(date, 30, 196);
      clockFaceTex.needsUpdate = true;
    };
    updateClock();

    // Red LED glow that lights the desk around the clock (stronger in the evening)
    const clockLight = new THREE.PointLight(0xff5a3c, 0, 1.6, 2);
    clockLight.position.set(0, 0.25, 0.25);
    clockGroup.add(clockLight);

    scene.add(clockGroup);

    // 9. SMART SPEAKER beside the iPhone: blue woven-mesh sphere with a flat glowing touch top (HomePod mini style)
    const speakerGroup = new THREE.Group();
    speakerGroup.position.set(3.25, 0.02, 0.6);
    speakerGroup.userData = { device: "speaker" };

    // Woven mesh: diagonal blue strands over a dark teal underlay
    const meshCanvas = document.createElement("canvas");
    meshCanvas.width = meshCanvas.height = 256;
    {
      const g = meshCanvas.getContext("2d")!;
      g.fillStyle = "#082a36";
      g.fillRect(0, 0, 256, 256);
      g.lineCap = "round";
      const step = 16;
      for (const dir of [1, -1]) {
        g.strokeStyle = dir === 1 ? "#2c58a4" : "#234a8c";
        g.lineWidth = 5;
        for (let i = -256; i < 512; i += step) {
          g.beginPath();
          g.moveTo(i, dir === 1 ? 0 : 256);
          g.lineTo(i + 256, dir === 1 ? 256 : 0);
          g.stroke();
        }
      }
      // light edge on each strand for a woven look
      g.strokeStyle = "rgba(170,200,255,0.28)";
      g.lineWidth = 1.5;
      for (let i = -256; i < 512; i += step) {
        g.beginPath();
        g.moveTo(i - 1.5, 0);
        g.lineTo(i + 254.5, 256);
        g.stroke();
      }
    }
    const meshTex = new THREE.CanvasTexture(meshCanvas);
    meshTex.colorSpace = THREE.SRGBColorSpace;
    meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping;
    meshTex.repeat.set(10, 5);
    meshTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Sphere profile with a flat top and a small flat base, revolved around Y
    const SP_R = 0.25;
    const SP_SY = 0.92;
    const latBottom = (-80 * Math.PI) / 180;
    const latTop = (61.5 * Math.PI) / 180;
    const speakerProfile: THREE.Vector2[] = [new THREE.Vector2(0, Math.sin(latBottom))];
    for (let i = 0; i <= 40; i++) {
      const lat = latBottom + ((latTop - latBottom) * i) / 40;
      speakerProfile.push(new THREE.Vector2(Math.cos(lat), Math.sin(lat)));
    }
    speakerProfile.push(new THREE.Vector2(0, Math.sin(latTop)));
    const speakerBody = new THREE.Mesh(
      new THREE.LatheGeometry(speakerProfile, 64),
      new THREE.MeshStandardMaterial({ map: meshTex, color: 0x9aa8c8, roughness: 0.95, metalness: 0, side: THREE.DoubleSide })
    );
    speakerBody.scale.set(SP_R, SP_R * SP_SY, SP_R);
    const speakerLift = -Math.sin(latBottom) * SP_R * SP_SY;
    speakerBody.position.y = speakerLift;
    speakerBody.castShadow = true;
    speakerBody.receiveShadow = true;
    speakerGroup.add(speakerBody);

    // Touch surface: soft white-blue glow with "–" and "+"
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 256;
    {
      const g = glowCanvas.getContext("2d")!;
      const rg = g.createRadialGradient(128, 128, 8, 128, 128, 128);
      rg.addColorStop(0, "#ffffff");
      rg.addColorStop(0.45, "#cfe6ff");
      rg.addColorStop(0.8, "#7fb4e6");
      rg.addColorStop(1, "#4a86c4");
      g.fillStyle = rg;
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(40,80,150,0.75)";
      g.lineWidth = 6;
      g.lineCap = "round";
      g.beginPath(); // minus
      g.moveTo(30, 128);
      g.lineTo(58, 128);
      g.moveTo(198, 128); // plus
      g.lineTo(226, 128);
      g.moveTo(212, 114);
      g.lineTo(212, 142);
      g.stroke();
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    glowTex.colorSpace = THREE.SRGBColorSpace;
    const speakerTopY = speakerLift + Math.sin(latTop) * SP_R * SP_SY;
    const speakerTopR = Math.cos(latTop) * SP_R;
    const speakerTop = new THREE.Mesh(
      new THREE.CircleGeometry(speakerTopR * 0.88, 64),
      new THREE.MeshBasicMaterial({ map: glowTex, toneMapped: false })
    );
    speakerTop.rotation.x = -Math.PI / 2;
    speakerTop.position.y = speakerTopY + 0.0008;
    speakerGroup.add(speakerTop);

    // Braided power cable, same blue
    const speakerCable = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.05, 0.03, -0.2),
          new THREE.Vector3(0.14, 0.012, -0.42),
          new THREE.Vector3(0.06, 0.012, -0.72),
        ]),
        16,
        0.006,
        8,
        false
      ),
      new THREE.MeshStandardMaterial({ color: 0x3d63a8, roughness: 0.85 })
    );
    speakerGroup.add(speakerCable);


    // Tap feedback: a ripple ring on top of the speaker and one spreading across the desk
    const speakerRing = new THREE.Mesh(
      new THREE.RingGeometry(speakerTopR * 0.9, speakerTopR * 0.98, 64),
      new THREE.MeshBasicMaterial({ color: 0xa5d2ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    );
    speakerRing.rotation.x = -Math.PI / 2;
    speakerRing.position.y = speakerTopY + 0.002;
    speakerGroup.add(speakerRing);
    const deskRing = new THREE.Mesh(
      new THREE.RingGeometry(0.27, 0.285, 64),
      new THREE.MeshBasicMaterial({ color: 0x7fb4ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    );
    deskRing.rotation.x = -Math.PI / 2;
    deskRing.position.y = 0.021;
    speakerGroup.add(deskRing);
    // Soft blue light that spills from the touch surface (stronger in the evening / on tap)
    const speakerLight = new THREE.PointLight(0x6fb4ff, 0, 1.5, 2);
    speakerLight.position.set(0, speakerTopY + 0.08, 0);
    speakerGroup.add(speakerLight);
    interactables.push(speakerBody, speakerTop);

    let speakerPulseStart = -10;
    const tapSpeaker = () => {
      speakerPulseStart = timer.getElapsed();
      onSpeakerTapRef.current?.();
    };

    scene.add(speakerGroup);

    // 9b. PEN & PENCIL STAND: matte-black perforated metal cup with a brass rim, holding pens and pencils
    const standGroup = new THREE.Group();
    standGroup.position.set(-1.65, 0.02, -0.95);
    standGroup.scale.setScalar(1.35);
    standGroup.rotation.y = 0.35;
    scene.add(standGroup);

    const meshStandCanvas = document.createElement("canvas");
    meshStandCanvas.width = 512;
    meshStandCanvas.height = 256;
    {
      const g = meshStandCanvas.getContext("2d")!;
      g.fillStyle = "#202226";
      g.fillRect(0, 0, 512, 256);
      g.fillStyle = "#0a0b0d";
      for (let y = 8; y < 256; y += 16) {
        for (let x = (y / 16) % 2 ? 8 : 0; x < 512; x += 16) {
          g.beginPath();
          g.arc(x + 8, y, 4.2, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    const meshStandTex = new THREE.CanvasTexture(meshStandCanvas);
    meshStandTex.colorSpace = THREE.SRGBColorSpace;
    meshStandTex.wrapS = meshStandTex.wrapT = THREE.RepeatWrapping;
    meshStandTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const STAND_H = 0.36;
    const STAND_R = 0.17;
    const standBody = new THREE.Mesh(
      new THREE.CylinderGeometry(STAND_R, STAND_R * 0.94, STAND_H, 48, 1, true),
      new THREE.MeshStandardMaterial({ map: meshStandTex, color: 0xb0b4bc, roughness: 0.45, metalness: 0.7, side: THREE.DoubleSide })
    );
    standBody.position.y = STAND_H / 2;
    standBody.castShadow = true;
    standBody.receiveShadow = true;
    standGroup.add(standBody);
    const standFloor = new THREE.Mesh(new THREE.CircleGeometry(STAND_R * 0.94, 36), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.9 }));
    standFloor.rotation.x = -Math.PI / 2;
    standFloor.position.y = 0.03;
    standGroup.add(standFloor);
    const standBrass = new THREE.MeshStandardMaterial({ color: 0xd4a53c, metalness: 1, roughness: 0.25 });
    [0.012, STAND_H - 0.008].forEach((y, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(i === 0 ? STAND_R * 0.95 : STAND_R, 0.011, 12, 48), standBrass);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      ring.castShadow = true;
      standGroup.add(ring);
    });
    const penStandBase = new THREE.Mesh(new THREE.CylinderGeometry(STAND_R * 0.97, STAND_R * 1.0, 0.025, 48), standBrass);
    penStandBase.position.y = 0.0125;
    penStandBase.castShadow = true;
    standGroup.add(penStandBase);

    // Writing tools, each a group whose origin is the bottom end, standing along +Y
    const addTool = (build: (g: THREE.Group) => void, yaw: number, lean: number, ox: number, oz: number) => {
      const tool = new THREE.Group();
      build(tool);
      tool.position.set(ox, 0.05, oz);
      tool.rotation.order = "YXZ";
      tool.rotation.set(lean, yaw, 0);
      standGroup.add(tool);
    };
    const cyl = (parent: THREE.Object3D, rTop: number, rBot: number, h: number, y: number, mat: THREE.Material, seg = 14) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
      m.position.y = y + h / 2;
      m.castShadow = true;
      parent.add(m);
      return m;
    };
    const silverTool = new THREE.MeshStandardMaterial({ color: 0xd2d6dc, metalness: 1, roughness: 0.25 });
    const makePen = (color: number, len: number) => (g: THREE.Group) => {
      const body = new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, clearcoat: 0.7 });
      cyl(g, 0.0125, 0.0125, len * 0.8, 0, body);
      cyl(g, 0.0135, 0.0135, len * 0.17, len * 0.8, new THREE.MeshPhysicalMaterial({ color: 0x15151a, roughness: 0.3, clearcoat: 0.6 }));
      cyl(g, 0.004, 0.0125, 0.03, len * 0.97, body); // tapered cap top
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.004, len * 0.22, 0.006), silverTool);
      clip.position.set(0.014, len * 0.86, 0);
      g.add(clip);
    };
    const makePencil = (color: number, len: number) => (g: THREE.Group) => {
      const wood = new THREE.MeshStandardMaterial({ color: 0xe6c08a, roughness: 0.8 });
      cyl(g, 0.0115, 0.0115, len * 0.88, 0, new THREE.MeshStandardMaterial({ color, roughness: 0.5 }), 6); // hexagonal barrel
      const cone = cyl(g, 0.002, 0.0115, len * 0.1, len * 0.88, wood, 6);
      void cone;
      cyl(g, 0.0017, 0.0017, 0.01, len * 0.98 + 0.004, new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.5 }), 6); // graphite point
    };
    const makeBrush = (g: THREE.Group) => {
      const len = 0.5;
      cyl(g, 0.007, 0.011, len * 0.7, 0, new THREE.MeshPhysicalMaterial({ color: 0x1fa88a, roughness: 0.35, clearcoat: 0.6 }), 12);
      cyl(g, 0.0085, 0.0085, 0.05, len * 0.7, silverTool, 12);
      cyl(g, 0.0005, 0.0085, 0.07, len * 0.7 + 0.05, new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.9 }), 12);
    };
    addTool(makePen(0x2a62ff, 0.54), 0.2, 0.14, 0.03, 0.02);
    addTool(makePen(0xe8333c, 0.5), 1.9, 0.2, -0.04, 0.0);
    addTool(makePen(0x1fc77a, 0.52), 3.6, 0.12, 0.0, -0.05);
    addTool(makePencil(0xffc400, 0.5), 5.0, 0.26, 0.05, -0.02);
    addTool(makePencil(0xff6a2a, 0.48), 2.8, 0.17, -0.03, 0.04);
    addTool(makePencil(0x7a3bff, 0.52), 0.9, 0.3, 0.0, 0.05);
    addTool(makeBrush, 4.3, 0.2, -0.02, -0.03);

    // 9c. ARTICULATED DESK LAMP (left side): switches on in evening mode, off by day
    const lampGroup = new THREE.Group();
    lampGroup.userData = { device: "lamp" };
    lampGroup.position.set(-3.35, 0.02, 1.6);
    lampGroup.scale.setScalar(1.15);
    scene.add(lampGroup);
    const lampMetal = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.4, metalness: 0.7 });
    const lampBrass = new THREE.MeshStandardMaterial({ color: 0xd4a53c, metalness: 1, roughness: 0.25 });

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 48), lampMetal);
    lampBase.position.y = 0.025;
    lampBase.castShadow = true;
    lampBase.receiveShadow = true;
    lampGroup.add(lampBase);
    const lampRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.008, 10, 48), lampBrass);
    lampRing.rotation.x = Math.PI / 2;
    lampRing.position.y = 0.05;
    lampGroup.add(lampRing);

    // rod between two points, built along +Y then oriented
    const rodBetween = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
      const dir = b.clone().sub(a);
      const len = dir.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
      m.position.copy(a).addScaledVector(dir, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      m.castShadow = true;
      lampGroup.add(m);
    };
    const joint = (p: THREE.Vector3, r: number) => {
      const j = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), lampBrass);
      j.position.copy(p);
      j.castShadow = true;
      lampGroup.add(j);
    };
    const L0 = new THREE.Vector3(0, 0.08, 0);
    const L1 = new THREE.Vector3(0.1, 0.85, 0); // lower arm (near vertical)
    const L2 = new THREE.Vector3(0.7, 1.02, 0); // upper arm, reaching out over the notebook
    rodBetween(new THREE.Vector3(0, 0.05, 0), L0, 0.03, lampMetal);
    [-0.018, 0.018].forEach((dz) => {
      rodBetween(L0.clone().add(new THREE.Vector3(0, 0, dz)), L1.clone().add(new THREE.Vector3(0, 0, dz)), 0.008, lampMetal);
      rodBetween(L1.clone().add(new THREE.Vector3(0, 0, dz)), L2.clone().add(new THREE.Vector3(0, 0, dz)), 0.008, lampMetal);
    });
    joint(L0, 0.04);
    joint(L1, 0.04);
    joint(L2, 0.035);

    // Cone shade pointing down and slightly towards the desk centre
    const shadeGroup = new THREE.Group();
    shadeGroup.position.copy(L2);
    shadeGroup.rotation.z = 0.6; // positive z tilts the cone's opening down and away from the arm (it was tilted back into it)
    lampGroup.add(shadeGroup);
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.2, 0.24, 40, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide })
    );
    shade.position.y = -0.1;
    shade.castShadow = true;
    shadeGroup.add(shade);
    const shadeRim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.007, 8, 40), lampBrass);
    shadeRim.rotation.x = Math.PI / 2;
    shadeRim.position.y = -0.22;
    shadeGroup.add(shadeRim);
    // glowing inner lining (warm when on)
    const lampLining = new THREE.MeshStandardMaterial({ color: 0xfff0c8, roughness: 0.6, emissive: 0xffb347, emissiveIntensity: 0, side: THREE.BackSide });
    const shadeInner = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.196, 0.236, 40, 1, true), lampLining);
    shadeInner.position.y = -0.1;
    shadeGroup.add(shadeInner);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x7a7a7a });
    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.052, 20, 16), bulbMat);
    lampBulb.position.y = -0.14;
    shadeGroup.add(lampBulb);
    // soft halo around the bulb
    const haloCanvas = document.createElement("canvas");
    haloCanvas.width = haloCanvas.height = 128;
    {
      const g = haloCanvas.getContext("2d")!;
      const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      rg.addColorStop(0, "rgba(255,226,150,0.9)");
      rg.addColorStop(0.4, "rgba(255,190,90,0.35)");
      rg.addColorStop(1, "rgba(255,170,60,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, 128, 128);
    }
    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const lampHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: haloTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
    );
    lampHalo.scale.set(0.9, 0.9, 1);
    lampHalo.position.y = -0.2;
    shadeGroup.add(lampHalo);

    // Aim the existing warm spotlight from the bulb onto the desk
    const bulbWorld = new THREE.Vector3();
    shadeGroup.updateWorldMatrix(true, true);
    lampBulb.getWorldPosition(bulbWorld);
    lampLight.position.copy(bulbWorld);
    lampLight.target.position.set(-1.25, 0.03, 1.4); // the notebook
    lampLight.angle = Math.PI / 6; // narrow, focused beam
    lampLight.penumbra = 0.55;
    let lampGlow = 0;
    interactables.push(lampBase, shade, lampBulb);

    // 10. PIKACHU: a fan-style yellow electric mouse that wanders the desk, sits, naps, waves and
    // says "pika pika" when clicked. Built from simple shapes; walks on two IK-driven legs.
    const catGroup = new THREE.Group();
    catGroup.scale.setScalar(1.6);
    catGroup.userData = { device: "cat" };

    const pikaYellow = new THREE.MeshStandardMaterial({ color: 0xffbf00, roughness: 0.8 }); // deeper than the real hue: scene lighting washes yellow out
    const pikaBrown = new THREE.MeshStandardMaterial({ color: 0x8a5424, roughness: 0.85 });
    const pikaBlack = new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.3 });
    const pikaRed = new THREE.MeshStandardMaterial({ color: 0xe8333c, roughness: 0.55, emissive: 0x000000 });
    const pikaWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mk = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, shadow = true) => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = shadow;
      parent.add(m);
      return m;
    };
    const sph = new THREE.SphereGeometry(1, 28, 20);

    const bodyRoot = new THREE.Group(); // hips; moves up/down and rolls as it walks
    catGroup.add(bodyRoot);
    const HIP_H = 0.15;
    bodyRoot.position.y = HIP_H;

    // Pear-shaped body: wide round belly, narrower shoulders; brown stripes across the lower back
    const torso = new THREE.Group();
    bodyRoot.add(torso);
    const BODY_H = 0.27;
    const bodyPts: THREE.Vector2[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      // slim pear: rounded bottom, nearly straight sides, closes up under the head
      const ends = t < 0.12 ? Math.pow(Math.sin((Math.PI / 2) * (t / 0.12)), 0.5) : t > 0.92 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.92) / 0.08, 2))) : 1;
      const belly = 0.05 + 0.03 * Math.exp(-Math.pow((t - 0.3) / 0.3, 2));
      bodyPts.push(new THREE.Vector2(Math.max(0.0001, ends * belly), t * BODY_H - 0.02));
    }
    const pikaBodyGeo = new THREE.LatheGeometry(bodyPts, 40);
    {
      const pos = pikaBodyGeo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const yel = new THREE.Color(0xffbf00);
      const cream = new THREE.Color(0xffd23a);
      const stripe = new THREE.Color(0x8a5424);
      const tmp = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const z = pos.getZ(i);
        tmp.copy(yel);
        if (z > 0.035) tmp.lerp(cream, THREE.MathUtils.smoothstep(z, 0.035, 0.09)); // lighter belly
        const back = z < -0.04;
        const band1 = y > 0.075 && y < 0.1;
        const band2 = y > 0.125 && y < 0.15;
        if (back && (band1 || band2)) tmp.copy(stripe);
        colors[i * 3] = tmp.r;
        colors[i * 3 + 1] = tmp.g;
        colors[i * 3 + 2] = tmp.b;
      }
      pikaBodyGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
    const pikaBody = mk(pikaBodyGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), torso);

    // Head: wide and round, with tall black-tipped ears, red cheeks and big shiny eyes
    const head = new THREE.Group();
    head.position.set(0, BODY_H + 0.045, 0.008);
    torso.add(head);
    const skull = mk(sph, pikaYellow, head);
    skull.scale.set(0.125, 0.105, 0.105);

    const catEars: THREE.Group[][] = [];
    [-1, 1].forEach((side) => {
      const ear = new THREE.Group();
      ear.position.set(side * 0.07, 0.07, -0.015);
      ear.userData.baseZ = side * -0.5;
      ear.userData.baseX = -0.2;
      ear.rotation.set(-0.2, 0, side * -0.5);
      const earGeo = new THREE.CylinderGeometry(0.014, 0.036, 0.15, 14);
      earGeo.translate(0, 0.075, 0);
      mk(earGeo, pikaYellow, ear);
      const tipGeo = new THREE.ConeGeometry(0.0145, 0.065, 14);
      tipGeo.translate(0, 0.182, 0);
      mk(tipGeo, pikaBlack, ear);
      head.add(ear);
      catEars.push([ear]);
    });

    const eyes: THREE.Group[] = [];
    [-1, 1].forEach((side) => {
      const eye = new THREE.Group();
      eye.position.set(side * 0.058, 0.012, 0.094);
      eye.rotation.y = side * 0.35;
      const ball = mk(sph, pikaBlack, eye, false);
      ball.scale.set(0.022, 0.027, 0.011);
      const shine = mk(sph, pikaWhite, eye, false);
      shine.scale.set(0.0085, 0.0085, 0.004);
      shine.position.set(0.006, 0.01, 0.01);
      const shine2 = mk(sph, pikaWhite, eye, false);
      shine2.scale.set(0.0042, 0.0042, 0.003);
      shine2.position.set(-0.006, -0.008, 0.01);
      head.add(eye);
      eyes.push(eye);
    });
    const nose = mk(sph, pikaBlack, head, false);
    nose.scale.set(0.0075, 0.0055, 0.005);
    nose.position.set(0, -0.012, 0.105);
    const mouth = mk(new THREE.TorusGeometry(0.017, 0.0022, 6, 20, Math.PI), pikaBlack, head, false);
    mouth.rotation.z = Math.PI; // arc opens upward → a smile
    mouth.position.set(0, -0.016, 0.102);
    const cheekMats: THREE.MeshStandardMaterial[] = [];
    [-1, 1].forEach((side) => {
      const cm = pikaRed.clone();
      cheekMats.push(cm);
      const cheek = mk(sph, cm, head, false);
      cheek.scale.set(0.028, 0.028, 0.008);
      cheek.position.set(side * 0.1, -0.026, 0.075);
      cheek.rotation.y = side * 0.95;
    });

    // Arms: short, two segments so they can wave. Pivot at the shoulder.
    type PikaArm = { shoulder: THREE.Group; elbow: THREE.Group };
    const makeArm = (side: number): PikaArm => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.055, BODY_H - 0.07, 0.01); // inside the torso surface so the arm is attached
      const shoulderBlob = mk(sph, pikaYellow, shoulder);
      shoulderBlob.scale.setScalar(0.024); // fills the joint between torso and arm
      const up = mk(new THREE.CylinderGeometry(0.019, 0.015, 0.055, 12), pikaYellow, shoulder);
      up.position.y = -0.0275;
      const elbow = new THREE.Group();
      elbow.position.y = -0.055;
      shoulder.add(elbow);
      const fore = mk(new THREE.CylinderGeometry(0.016, 0.013, 0.05, 12), pikaYellow, elbow);
      fore.position.y = -0.025;
      const hand = mk(sph, pikaYellow, elbow);
      hand.scale.set(0.018, 0.02, 0.017);
      hand.position.y = -0.055;
      torso.add(shoulder);
      return { shoulder, elbow };
    };
    const pikaArms = [makeArm(-1), makeArm(1)];

    // Legs: thigh → shin → foot with the same 2-bone IK used for walking (knees point forward)
    type CatLeg = {
      hip: THREE.Group;
      knee: THREE.Group;
      ankle: THREE.Group;
      front: boolean;
      L1: number;
      L2: number;
      L3: number;
      cur: { h: number; k: number; a: number };
    };
    const makePikaLeg = (x: number): CatLeg => {
      const L1 = 0.07;
      const L2 = 0.062;
      const L3 = 0.026;
      const hip = new THREE.Group();
      hip.position.set(x, 0, 0.004);
      const thigh = mk(new THREE.CylinderGeometry(0.03, 0.021, L1, 14), pikaYellow, hip);
      thigh.position.y = -L1 / 2;
      const thighBlob = mk(sph, pikaYellow, hip);
      thighBlob.scale.set(0.034, 0.036, 0.038);
      thighBlob.position.y = -0.018;
      const knee = new THREE.Group();
      knee.position.y = -L1;
      hip.add(knee);
      const kneeBlend = mk(sph, pikaYellow, knee);
      kneeBlend.scale.setScalar(0.024);
      const shin = mk(new THREE.CylinderGeometry(0.024, 0.019, L2, 12), pikaYellow, knee);
      shin.position.y = -L2 / 2;
      const ankle = new THREE.Group();
      ankle.position.y = -L2;
      knee.add(ankle);
      const ankleBlend = mk(sph, pikaYellow, ankle);
      ankleBlend.scale.setScalar(0.019);
      const foot = mk(sph, pikaYellow, ankle); // long flat foot pointing forward
      foot.scale.set(0.026, 0.016, 0.052);
      foot.position.set(0, -L3 * 0.55, 0.02);
      const toes = mk(sph, pikaBrown, ankle, false); // dark sole
      toes.scale.set(0.024, 0.006, 0.05);
      toes.position.set(0, -L3 * 0.55 - 0.012, 0.02);
      bodyRoot.add(hip);
      return { hip, knee, ankle, front: false, L1, L2, L3, cur: { h: 0, k: 0, a: 0 } };
    };
    const catLegs: CatLeg[] = [makePikaLeg(-0.045), makePikaLeg(0.045)];

    // 2-bone inverse kinematics in the leg's sagittal plane (z forward, y up, hip at the origin)
    const solveLeg = (leg: CatLeg, pawZ: number, pawY: number, footAngle: number): [number, number, number] => {
      const { L1, L2, L3 } = leg;
      const az = pawZ + L3 * Math.sin(footAngle);
      const ay = pawY + L3 * Math.cos(footAngle);
      const reach = Math.hypot(az, ay);
      const d = Math.min(L1 + L2 - 0.002, Math.max(Math.abs(L1 - L2) + 0.01, reach));
      const dirT = Math.atan2(-az, -ay);
      const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
      const kneeZ = (t: number) => -L1 * Math.sin(t);
      const t1 = dirT + a;
      const t2 = dirT - a;
      const th1 = kneeZ(t1) > kneeZ(t2) ? t1 : t2; // knees point forward
      const kz = -L1 * Math.sin(th1);
      const ky = -L1 * Math.cos(th1);
      const tz = -d * Math.sin(dirT);
      const ty = -d * Math.cos(dirT);
      const th2 = Math.atan2(-(tz - kz), -(ty - ky));
      return [th1, th2 - th1, footAngle - th2];
    };

    // Lightning-bolt tail: a flat zig-zag in the side-view plane with a brown base
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.04, -0.07);
    tailGroup.rotation.x = -0.45;
    torso.add(tailGroup);
    {
      const ys = [0.0, 0.085, 0.14, 0.215, 0.285, 0.36];
      const zs = [0.0, 0.07, 0.0, 0.085, 0.0, 0.07]; // backwards offset of each bend
      const hw = [0.026, 0.026, 0.028, 0.03, 0.036, 0.05]; // widening towards the tip
      const shape = new THREE.Shape();
      shape.moveTo(zs[0] - hw[0], ys[0]);
      for (let i = 1; i < ys.length; i++) shape.lineTo(zs[i] - hw[i], ys[i]);
      for (let i = ys.length - 1; i >= 0; i--) shape.lineTo(zs[i] + hw[i], ys[i]);
      shape.closePath();
      const tailGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 });
      tailGeo.translate(0, 0, -0.015);
      tailGeo.rotateY(Math.PI / 2); // shape x → backwards (−z), depth → sideways
      mk(tailGeo, pikaYellow, tailGroup);
      const baseGeo = new THREE.BoxGeometry(0.04, 0.07, 0.06);
      const tailBase = mk(baseGeo, pikaBrown, tailGroup);
      tailBase.position.set(0, 0.03, 0);
    }

    // Soft contact shadow that follows the cat
    const catShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.5),
      contactShadowMat.clone()
    );
    catShadow.material.opacity = 0.5;
    catShadow.rotation.x = -Math.PI / 2;
    catShadow.position.y = 0.0207;
    scene.add(catShadow);

    interactables.push(pikaBody, skull);
    scene.add(catGroup);

    // ── Behaviour: roams the whole desk (front, back, left, right), sits, naps ──
    // Obstacles the cat must walk around (world x/z on the desk surface)
    const CAT_CLEARANCE = 0.38;
    const catCircles: Array<[number, number, number]> = [
      [2.45, 0.45, 0.55], // phone + puck
      [3.25, 0.6, 0.32], // speaker
      [2.4, -1.4, 0.55], // mug (with handle)
      [1.7, -1.45, 0.42], // clock
      [3.7, -1.15, 0.62], // jade plant
      [-3.2, -0.5, 0.45], // succulent
      [-1.65, -0.95, 0.4], // pen & pencil stand
      [-3.35, 1.6, 0.4], // desk lamp base
    ];
    const catRects: Array<[number, number, number, number]> = [
      [-1.1, 1.4, -1.0, 1.0], // laptop (x0, x1, z0, z1)
      [-3.4, -1.6, -0.55, 0.9], // tablet + stand
      [-2.0, -0.5, 0.95, 1.85], // notebook
    ];
    const catBlocked = (x: number, z: number) => {
      if (Math.abs(x) > 3.7 || Math.abs(z) > 2.55) return true; // stay on the desk and inside the camera's view
      for (const [cx, cz, r] of catCircles) if (Math.hypot(x - cx, z - cz) < r + CAT_CLEARANCE) return true;
      for (const [x0, x1, z0, z1] of catRects)
        if (x > x0 - CAT_CLEARANCE && x < x1 + CAT_CLEARANCE && z > z0 - CAT_CLEARANCE && z < z1 + CAT_CLEARANCE) return true;
      return false;
    };
    const CAT_NODES: Array<[number, number]> = (
      [
        // front strip
        [-3.3, 2.15], [-1.2, 2.3], [0.5, 1.75], [1.9, 1.8], [3.1, 1.75], [3.55, 1.5],
        // back strip
        [3.0, -2.3], [1.4, -2.3], [-0.3, -2.3], [-2.0, -2.3], [-3.5, -2.2],
        // left side (round the tablet and succulent)
        [-3.5, 1.4], [-3.5, -1.5],
        // a few spots inside
        [0.4, -1.5], [-3.0, -1.5], [3.4, -2.0],
      ] as Array<[number, number]>
    ).filter(([x, z]) => !catBlocked(x, z));
    // Connect nodes that have a clear straight line between them
    const catEdges: number[][] = CAT_NODES.map(() => []);
    for (let i = 0; i < CAT_NODES.length; i++) {
      for (let j = i + 1; j < CAT_NODES.length; j++) {
        const [ax, az] = CAT_NODES[i];
        const [bx, bz] = CAT_NODES[j];
        const len = Math.hypot(bx - ax, bz - az);
        const steps = Math.ceil(len / 0.06);
        let clear = true;
        for (let s = 1; s < steps && clear; s++) {
          const t = s / steps;
          if (catBlocked(ax + (bx - ax) * t, az + (bz - az) * t)) clear = false;
        }
        if (clear && len < 3.6) {
          catEdges[i].push(j);
          catEdges[j].push(i);
        }
      }
    }
    const catPath = (from: number, to: number): number[] => {
      const dist = CAT_NODES.map(() => Infinity);
      const prev = CAT_NODES.map(() => -1);
      const done = CAT_NODES.map(() => false);
      dist[from] = 0;
      for (let n = 0; n < CAT_NODES.length; n++) {
        let u = -1;
        for (let i = 0; i < CAT_NODES.length; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
        if (u < 0 || dist[u] === Infinity) break;
        done[u] = true;
        for (const v of catEdges[u]) {
          const d = dist[u] + Math.hypot(CAT_NODES[u][0] - CAT_NODES[v][0], CAT_NODES[u][1] - CAT_NODES[v][1]);
          if (d < dist[v]) {
            dist[v] = d;
            prev[v] = u;
          }
        }
      }
      if (dist[to] === Infinity) return [];
      const path: number[] = [];
      for (let at = to; at !== -1 && at !== from; at = prev[at]) path.unshift(at);
      return path;
    };
    const startNode = Math.max(0, CAT_NODES.findIndex(([x, z]) => x === 1.9 && z === 1.8));
    type CatState = "walk" | "idle" | "sit" | "sleep" | "groom" | "stretch";
    const cat = {
      state: "sit" as CatState,
      timer: 0,
      duration: 4,
      node: startNode,
      path: [] as Array<[number, number]>, // waypoints still to visit on the current trip
      x: CAT_NODES[startNode][0],
      z: CAT_NODES[startNode][1],
      tx: CAT_NODES[startNode][0],
      tz: CAT_NODES[startNode][1],
      heading: -0.4,
      turn: 0, // signed heading error while walking (head leads the turn, spine lags)
      pitch: 0,
      lower: HIP_H, // hip height above the desk
      speed: 0, // current speed (world units / s), eased towards targetSpeed
      targetSpeed: 0,
      tripSpeed: 0.5,
      gait: "walk" as "walk" | "trot",
      ik: 1, // 1 = legs driven by IK (walk/idle), 0 = hand-set poses (sit/sleep/groom/stretch)
      stride: 0, // gait cycle position (0..1), advances with distance walked so feet don't slide
      pauseUntil: 0, // mid-walk "stop and look" pauses
      groomLeg: 0,
      lookCam: false,
      nextLookToggle: 3,
      nextBlink: 2,
      blinkUntil: 0,
      nextEarTwitch: 2,
      earTwitchUntil: 0,
      earSide: 0,
      nextTailFlick: 3,
      tailFlickUntil: 0,
      meowUntil: -10,
      lastSleep: -100,
    };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const lerpAngle = (a: number, b: number, t: number) => {
      const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
      return a + d * t;
    };
    const catLineClear = (ax: number, az: number, bx: number, bz: number) => {
      const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.06);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        if (catBlocked(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
      }
      return true;
    };
    const nearestNode = (x: number, z: number) => {
      let best = 0;
      let bd = Infinity;
      CAT_NODES.forEach(([nx, nz], i) => {
        const d = Math.hypot(nx - x, nz - z);
        if (d < bd && catLineClear(x, z, nx, nz)) {
          bd = d;
          best = i;
        }
      });
      return best;
    };
    // Start a trip to a random place: half the time any free point in the open, otherwise a
    // route through the waypoint graph (so it can circle round the laptop, plants, etc.)
    const startTrip = () => {
      let path: Array<[number, number]> = [];
      if (Math.random() < 0.5) {
        for (let tries = 0; tries < 14 && path.length === 0; tries++) {
          const px = rand(-3.6, 3.6);
          const pz = rand(-2.4, 2.4);
          if (!catBlocked(px, pz) && Math.hypot(px - cat.x, pz - cat.z) > 0.9 && catLineClear(cat.x, cat.z, px, pz)) path = [[px, pz]];
        }
      }
      if (path.length === 0) {
        const from = nearestNode(cat.x, cat.z);
        for (let tries = 0; tries < 10 && path.length === 0; tries++) {
          const dest = Math.floor(Math.random() * CAT_NODES.length);
          if (dest === from) continue;
          path = catPath(from, dest).map((i) => CAT_NODES[i] as [number, number]);
        }
      }
      if (path.length === 0) return false;
      cat.path = path;
      [cat.tx, cat.tz] = path[0];
      cat.state = "walk";
      // Mostly a relaxed walk, sometimes a quick trot; both vary in speed trip to trip
      const trot = Math.random() < 0.3;
      cat.gait = trot ? "trot" : "walk";
      cat.tripSpeed = trot ? rand(0.85, 1.2) : rand(0.35, 0.6);
      cat.pauseUntil = 0;
      cat.duration = 999;
      cat.timer = 0;
      return true;
    };
    // After walking or an idle action: pick the next random behaviour
    const chooseNext = (time: number) => {
      const wasWalking = cat.state === "walk";
      cat.timer = 0;
      if (!wasWalking && Math.random() < 0.8 && startTrip()) return;
      const r = Math.random();
      const canSleep = time - cat.lastSleep > 25;
      if (r < 0.28) {
        cat.state = "sit";
        cat.duration = rand(3, 9);
      } else if (r < 0.46) {
        cat.state = "idle";
        cat.duration = rand(2, 5);
      } else if (r < 0.66) {
        cat.state = "groom";
        cat.duration = rand(4, 8);
        cat.groomLeg = Math.random() < 0.5 ? 0 : 1;
      } else if (r < 0.8) {
        cat.state = "stretch";
        cat.duration = rand(2.2, 3.5);
      } else if (canSleep) {
        cat.state = "sleep";
        cat.duration = rand(8, 16);
        cat.lastSleep = time;
      } else {
        cat.state = "sit";
        cat.duration = rand(3, 7);
      }
    };

    // Pikachu's voice: the real recording in /public/music/pikachu.mp3, restarted on every click
    const pikaVoice = new Audio("/music/pikachu.mp3");
    pikaVoice.preload = "auto";
    pikaVoice.volume = 0.8;
    const meow = () => {
      // keep the cheek sparks and head shake going for as long as the clip lasts
      const len = Number.isFinite(pikaVoice.duration) && pikaVoice.duration > 0 ? pikaVoice.duration : 1;
      cat.meowUntil = timer.getElapsed() + len;
      pikaVoice.currentTime = 0;
      pikaVoice.play().catch(() => {
        /* playback can be refused before the page has been interacted with; the next click will work */
      });
    };

    let lastCatTime = 0;
    const catCamPos = new THREE.Vector3();
    // Yellow spark light that flashes around Pikachu's cheeks when clicked
    const pikaLight = new THREE.PointLight(0xffe45a, 0, 1.4, 2);
    pikaLight.position.set(0, 0, 0.2);
    head.add(pikaLight);
    const updateCat = (time: number) => {
      const dt = Math.min(0.1, time - lastCatTime);
      lastCatTime = time;
      cat.timer += dt;
      const st = cat.state;
      const walking = st === "walk";
      const sitting = st === "sit";
      const sleeping = st === "sleep";
      const waving = st === "groom";
      const cheering = st === "stretch";

      // ── Locomotion: eased speed, curved turns, occasional stop-and-look ──
      cat.targetSpeed = 0;
      cat.turn = 0;
      if (walking) {
        const dx = cat.tx - cat.x;
        const dz = cat.tz - cat.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.08) {
          cat.path.shift();
          if (cat.path.length > 0) {
            [cat.tx, cat.tz] = cat.path[0];
          } else if (cat.speed < 0.08) {
            chooseNext(time);
          }
        } else {
          const want = Math.atan2(dx, dz);
          cat.turn = Math.atan2(Math.sin(want - cat.heading), Math.cos(want - cat.heading));
          const turnSlow = 1 - Math.min(0.75, Math.abs(cat.turn) * 0.5);
          const arrive = cat.path.length === 1 ? Math.min(1, dist / 0.7) : 1;
          cat.targetSpeed = time < cat.pauseUntil ? 0 : cat.tripSpeed * turnSlow * Math.max(0.25, arrive);
          if (cat.gait === "walk" && time > cat.pauseUntil && Math.random() < dt * 0.06) {
            cat.pauseUntil = time + rand(1.2, 3);
            cat.lookCam = Math.random() < 0.5;
          }
          cat.heading = lerpAngle(cat.heading, want, Math.min(1, dt * (2.5 + cat.speed * 3)));
        }
      } else if (cat.timer > cat.duration) {
        chooseNext(time);
      }
      cat.speed += (cat.targetSpeed - cat.speed) * Math.min(1, dt * 3);
      if (cat.speed > 0.01 && walking) {
        cat.x += Math.sin(cat.heading) * cat.speed * dt;
        cat.z += Math.cos(cat.heading) * cat.speed * dt;
      }
      const walkBlend = Math.min(1, cat.speed / 0.2);
      cat.stride = (cat.stride + (cat.speed * dt) / 0.29) % 1;
      const sp = Math.PI * 2 * cat.stride;
      const running = cat.gait === "trot" && walkBlend > 0.5;
      const sparking = time < cat.meowUntil;

      catGroup.position.set(cat.x, 0.02, cat.z);
      catGroup.rotation.y = cat.heading;
      catShadow.position.set(cat.x, 0.0207, cat.z);
      catShadow.rotation.z = -cat.heading;

      // ── Body: height, lean, waddle ──
      const hop = cheering ? Math.abs(Math.sin(time * 6)) * 0.07 : sparking ? Math.abs(Math.sin(time * 18)) * 0.012 : 0;
      const hipT = sitting ? 0.042 : sleeping ? 0.034 : cheering ? HIP_H - 0.02 : HIP_H;
      cat.lower += (hipT - cat.lower) * Math.min(1, dt * 6);
      const bob = walkBlend * Math.abs(Math.sin(sp)) * (running ? 0.016 : 0.01);
      bodyRoot.position.y = cat.lower + bob + hop;
      bodyRoot.rotation.z = Math.sin(sp) * (running ? 0.05 : 0.07) * walkBlend; // side-to-side waddle
      const leanT = sleeping ? 0.95 : sitting ? 0.06 : cheering ? -0.18 : walkBlend * (running ? 0.22 : 0.08);
      cat.pitch += (leanT - cat.pitch) * Math.min(1, dt * 5);
      torso.rotation.x = cat.pitch;
      torso.rotation.y = -Math.sin(sp) * 0.08 * walkBlend - cat.turn * 0.15;
      const breathe = Math.sin(time * (sleeping ? 1.6 : 2.5)) * (sleeping ? 0.02 : 0.012);
      torso.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.5);

      // ── Legs: IK walk cycle (feet planted, then lifted and swung forward). Sitting and napping use fixed poses. ──
      const duty = cat.gait === "walk" ? 0.6 : 0.45;
      const halfStride = duty * 0.09;
      const useIK = !sitting && !sleeping;
      cat.ik += ((useIK ? 1 : 0) - cat.ik) * Math.min(1, dt * 6);
      catLegs.forEach((leg, li) => {
        const p = (cat.stride + li * 0.5) % 1;
        let stanceZ: number;
        let lift = 0;
        let foot = 0;
        if (p < duty) {
          const u = p / duty;
          stanceZ = halfStride - 2 * halfStride * u;
          foot = 0.5 * Math.max(0, (u - 0.8) / 0.2) ** 2; // heel lifts at push-off
        } else {
          const u = (p - duty) / (1 - duty);
          const e = u * u * (3 - 2 * u);
          stanceZ = -halfStride + 2 * halfStride * e;
          lift = Math.pow(Math.sin(Math.PI * u), 0.8);
          foot = 0.5 * (1 - Math.min(1, u * 2.2)) - 0.12 * Math.max(0, (u - 0.7) / 0.3);
        }
        const pawZ = stanceZ * walkBlend;
        const hipH = bodyRoot.position.y; // hips above the desk; during a hop the legs stretch until they run out of reach
        const pawY = -(hipH - 0.006) + lift * (running ? 0.05 : 0.04) * walkBlend;
        const [ih, ik, ia] = solveLeg(leg, pawZ, pawY, foot * walkBlend);
        let th = ih;
        let tk = ik;
        let ta = ia;
        if (sitting) { th = -1.45; tk = 0.35; ta = -0.1; }
        else if (sleeping) { th = -1.6; tk = 1.9; ta = -0.2; }
        const k = Math.min(1, dt * (useIK ? 6 + cat.ik * 8 : 8));
        leg.cur.h += (th - leg.cur.h) * k;
        leg.cur.k += (tk - leg.cur.k) * k;
        leg.cur.a += (ta - leg.cur.a) * k;
        leg.hip.rotation.x = leg.cur.h;
        leg.knee.rotation.x = leg.cur.k;
        leg.ankle.rotation.x = leg.cur.a;
      });

      // ── Arms: swing opposite the legs, wave hello, throw up in a cheer, rest when sitting/napping ──
      pikaArms.forEach((arm, ai) => {
        const side = ai === 0 ? -1 : 1;
        let sx = (ai === 0 ? 1 : -1) * Math.cos(sp) * (running ? 0.9 : 0.55) * walkBlend;
        let sz = side * 0.28;
        let ez = 0;
        if (running) sx += 0.5; // arms trail behind when running
        if (waving && ai === cat.groomLeg) {
          sx = -0.15; sz = side * 2.35; ez = side * (0.45 + Math.sin(time * 9) * 0.45);
        } else if (cheering) {
          sx = -0.2; sz = side * 2.6; ez = side * Math.sin(time * 6) * 0.15;
        } else if (sitting) {
          sx = -0.9; sz = side * 0.15;
        } else if (sleeping) {
          sx = -1.2; sz = side * 0.1;
        }
        const k = Math.min(1, dt * 9);
        arm.shoulder.rotation.x += (sx - arm.shoulder.rotation.x) * k;
        arm.shoulder.rotation.z += (sz - arm.shoulder.rotation.z) * k;
        arm.elbow.rotation.z += (ez - arm.elbow.rotation.z) * k;
      });

      // ── Head: leads turns, looks around, sometimes watches the visitor ──
      if (time > cat.nextLookToggle) {
        cat.lookCam = Math.random() < 0.4;
        cat.nextLookToggle = time + rand(2.5, 7);
      }
      camera.getWorldPosition(catCamPos);
      const toCam = Math.atan2(catCamPos.x - cat.x, catCamPos.z - cat.z) - cat.heading;
      const camYaw = Math.atan2(Math.sin(toCam), Math.cos(toCam));
      let yawT = 0;
      let pitchHead = 0;
      if (walking) {
        yawT = Math.max(-0.7, Math.min(0.7, cat.turn * 0.7)) + (time < cat.pauseUntil && cat.lookCam ? Math.max(-0.8, Math.min(0.8, camYaw)) : 0);
        pitchHead = -cat.pitch * 0.8 + Math.sin(sp * 2) * 0.03 * walkBlend;
      } else if (sleeping) {
        pitchHead = 0.2;
      } else if (waving || cheering) {
        yawT = Math.max(-0.9, Math.min(0.9, camYaw));
        pitchHead = -cat.pitch;
      } else {
        yawT = cat.lookCam ? Math.max(-0.9, Math.min(0.9, camYaw)) : Math.sin(time * 0.5) * 0.55;
        pitchHead = (cat.lookCam ? -0.05 : 0.0) - cat.pitch * 0.5;
      }
      head.rotation.y += (yawT - head.rotation.y) * Math.min(1, dt * 5);
      head.rotation.x += (pitchHead - head.rotation.x) * Math.min(1, dt * 6);
      head.rotation.z = sparking ? Math.sin(time * 25) * 0.04 : 0;

      // ── Ears: alert, random twitches, droop when asleep ──
      if (time > cat.nextEarTwitch) {
        cat.earTwitchUntil = time + 0.22;
        cat.earSide = Math.random() < 0.5 ? 0 : 1;
        cat.nextEarTwitch = time + rand(1.5, 6);
      }
      catEars.forEach((pair, i) => {
        const twitching = time < cat.earTwitchUntil && i === cat.earSide;
        const flick = twitching ? Math.sin((time % 0.22) * 30) * 0.22 : 0;
        const droop = sleeping ? 0.7 : 0;
        pair.forEach((ear) => {
          const bz = ear.userData.baseZ as number;
          ear.rotation.z = bz * (1 + droop * 0.8) + flick * (i === 0 ? -1 : 1);
          ear.rotation.x = (ear.userData.baseX as number) + (running ? -0.15 : 0) + droop * 0.5;
        });
      });

      // ── Tail: bolt wags; faster when running or excited, droops when asleep ──
      if (time > cat.nextTailFlick) {
        cat.tailFlickUntil = time + rand(0.6, 1.2);
        cat.nextTailFlick = time + rand(2.5, 8);
      }
      const flick = time < cat.tailFlickUntil ? Math.sin(time * 14) * 0.3 * (cat.tailFlickUntil - time) : 0;
      const wagRate = sparking || cheering ? 11 : walking ? 2.4 : 1.4;
      const tailRestX = sleeping ? -1.15 : sitting ? -0.85 : -0.45 - walkBlend * 0.1;
      tailGroup.rotation.x += (tailRestX - tailGroup.rotation.x) * Math.min(1, dt * 4);
      tailGroup.rotation.y = Math.sin(time * wagRate) * (sparking || cheering ? 0.4 : walking ? 0.16 : 0.1) + flick + (sleeping ? 0.7 : 0);

      // ── Cheeks spark when clicked ──
      const sparkAmt = sparking ? 0.5 + 0.5 * Math.sin(time * 40) : 0;
      cheekMats.forEach((m) => {
        m.emissive.setRGB(sparkAmt, sparkAmt * 0.85, sparkAmt * 0.1);
      });
      pikaLight.intensity += ((sparking ? 1.2 + sparkAmt * 1.5 : 0) - pikaLight.intensity) * 0.4;

      // ── Blink (slower when relaxed); eyes stay shut while napping ──
      if (time > cat.nextBlink) {
        cat.blinkUntil = time + (sitting ? 0.26 : 0.14);
        cat.nextBlink = time + rand(2.5, 6);
      }
      const closed = sleeping || time < cat.blinkUntil;
      eyes.forEach((e) => {
        e.scale.y += ((closed ? 0.08 : 1) - e.scale.y) * 0.5;
      });
    };

    // ─── Mouse Movement & Raycasting ─────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const targetCamPos = defaultCamPos.clone();
    const targetLookAt = defaultCamLookAt.clone();

    // Keep the whole desk in frame on narrow viewports by dollying the camera
    // back along its view axis until the desk's width fits horizontally.
    const baseCamPos = defaultCamPos.clone();
    const DESK_FIT_WIDTH = 8.4; // world units that must stay visible
    const fitCamera = () => {
      const dir = baseCamPos.clone().sub(defaultCamLookAt);
      const dist = dir.length();
      const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const scale = Math.min(4.2, Math.max(1, DESK_FIT_WIDTH / (visibleH * camera.aspect)));
      if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 0.018 / scale; // keep distance haze constant
      defaultCamPos.copy(defaultCamLookAt).addScaledVector(dir, scale);
      targetCamPos.copy(defaultCamPos);
    };
    fitCamera();
    camera.position.copy(defaultCamPos); // snap on first frame instead of easing in from the unfitted pose

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!focusedDeviceRef.current) {
        targetCamPos.x = defaultCamPos.x + mouse.x * 0.4;
        targetCamPos.y = defaultCamPos.y - mouse.y * 0.25;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (focusedDeviceRef.current) return;
      // Use the click's own coordinates: taps on touch screens don't always fire a preceding pointermove
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactables, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.device && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.device) {
          const dev = obj.userData.device as DeskDevice | "speaker" | "cat" | "lamp";
          if (dev === "speaker") tapSpeaker();
          else if (dev === "lamp") onLampToggleRef.current?.();
          else if (dev === "cat") meow();
          else onSelectDeviceRef.current(dev);
        }
      }
    };

    // Leaving the canvas (e.g. onto the dock) or opening a modal must clear any stale hover state
    const handlePointerLeave = () => {
      mouse.set(-999, -999);
      setHoveredDeviceRef.current(null);
      container.style.cursor = "default";
    };
    container.addEventListener("pointerleave", handlePointerLeave);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("click", handleClick);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      fitCamera();
    };
    // ResizeObserver also catches layout shifts after mount (fonts, scrollbars, pane resizes), not just window resizes
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // ─── Animation Loop ─────────────────────────────────────────────────────
    let reqId = 0;
    const timer = new THREE.Timer(); // replaces the deprecated THREE.Clock
    const speakerAnchorPos = new THREE.Vector3();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      timer.update();
      const elapsed = timer.getElapsed();

      updateScreens();

      camera.position.lerp(targetCamPos, 0.05);
      camera.lookAt(targetLookAt);

      // Keep the page's music panel pinned just above the speaker (direct DOM update, no React render)
      const anchorEl = speakerAnchorHolder.current?.current;
      if (anchorEl) {
        speakerTop.getWorldPosition(speakerAnchorPos);
        speakerAnchorPos.y += 0.1;
        speakerAnchorPos.project(camera);
        const sx = (speakerAnchorPos.x * 0.5 + 0.5) * width;
        const sy = (-speakerAnchorPos.y * 0.5 + 0.5) * height;
        const half = anchorHalfWidthRef.current;
        const cx = Math.min(width - half - 8, Math.max(half + 8, sx));
        anchorEl.style.transform = `translate(${cx}px, ${sy}px)`;
        anchorEl.style.setProperty("--dx", `${sx - cx}px`); // lets the panel's pointer stay aligned with the speaker
      }

      if (focusedDeviceRef.current) {
        mouse.set(-999, -999); // forget the pointer while a modal is open
      } else {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(interactables, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && !obj.userData?.device && obj.parent) {
            obj = obj.parent;
          }
          if (obj && obj.userData?.device) {
            const dev = obj.userData.device;
            setHoveredDeviceRef.current(dev);
            container.style.cursor = "pointer";
          }
        } else {
          setHoveredDeviceRef.current(null);
          container.style.cursor = "default";
        }
      }

      const isEve = eveningRef.current;

      // Evening glow: clock, speaker and laptop screen light the desk around them
      clockLight.intensity += ((isEve ? 0.55 : 0) - clockLight.intensity) * 0.06;
      screenBounce.intensity += ((isEve ? 1.7 : 0.85) - screenBounce.intensity) * 0.06;

      // Speaker: gentle breathing glow when idle, ripple + flash after a tap
      const pulseT = (elapsed - speakerPulseStart) / 1.5;
      const breathe = 0.5 + 0.5 * Math.sin(elapsed * 1.6);
      const playing = speakerPlayingRef.current;
      let speakerGlow = playing ? 0.55 + 0.3 * Math.sin(elapsed * 5) : isEve ? 0.35 + 0.15 * breathe : 0.05;
      if (pulseT >= 0 && pulseT < 1) {
        const ease = 1 - pulseT;
        speakerGlow += 1.1 * ease;
        speakerRing.scale.setScalar(1 + pulseT * 0.9);
        (speakerRing.material as THREE.MeshBasicMaterial).opacity = 0.9 * ease;
        deskRing.scale.setScalar(1 + pulseT * 3.2);
        (deskRing.material as THREE.MeshBasicMaterial).opacity = 0.7 * ease * ease;
        speakerGroup.scale.set(1, 1 + 0.05 * Math.sin(pulseT * Math.PI * 3) * ease, 1);
      } else if (pulseT >= 1) {
        (speakerRing.material as THREE.MeshBasicMaterial).opacity = 0;
        (deskRing.material as THREE.MeshBasicMaterial).opacity = 0;
        speakerGroup.scale.set(1, 1, 1);
      }
      if (playing && (pulseT < 0 || pulseT >= 1)) {
        // gentle beat while music plays
        speakerGroup.scale.set(1, 1 + 0.015 * Math.max(0, Math.sin(elapsed * 5)), 1);
      }
      speakerLight.intensity += (speakerGlow - speakerLight.intensity) * 0.2;
      updateSteam(elapsed, isEve);
      updateClock();
      updateCat(elapsed);
      const targetAmbient = isEve ? 0.35 : 0.9;
      const targetSun = isEve ? 0.35 : 2.3;
      const targetLamp = lampOnRef.current ? 12 : 0;
      const targetFogColor = isEve ? 0x221c18 : 0xf4f4f7;

      ambientLight.intensity += (targetAmbient - ambientLight.intensity) * 0.08;
      sunLight.intensity += (targetSun - sunLight.intensity) * 0.08;
      lampLight.intensity += (targetLamp - lampLight.intensity) * 0.08;
      // lamp hardware follows the same switch: bulb, halo and lining glow only at night
      lampGlow += ((lampOnRef.current ? 1 : 0) - lampGlow) * 0.1;
      bulbMat.color.setRGB(0.48 + 0.52 * lampGlow, 0.48 + 0.44 * lampGlow, 0.48 - 0.1 * lampGlow);
      (lampHalo.material as THREE.SpriteMaterial).opacity = lampGlow * 0.75;
      lampLining.emissiveIntensity = lampGlow * 1.6;

      if (scene.fog) {
        scene.fog.color.lerp(new THREE.Color(targetFogColor), 0.08);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("click", handleClick);
      resizeObserver.disconnect();
      pmremGenerator.dispose();
      envTexture.dispose();
      woodTex.dispose();
      leatherTex.dispose();
      keyboardTex.dispose();
      contactShadowTex.dispose();
      notebookTex.dispose();
      notebookLeftTex.dispose();
      mugLogoTex.dispose();
      pikaVoice.pause();
      haloTex.dispose();
      atlasTex.dispose();
      clockFaceTex.dispose();
      meshTex.dispose();
      glowTex.dispose();
      steamTex.dispose();
      laptopTexture.dispose();
      tabletTexture.dispose();
      phoneTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full select-none" />;
}
