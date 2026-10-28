'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ArchitecturalHouse } from '@/components/house/ArchitecturalHouse';
import { formatMeters } from '@/lib/format';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';

function SnapshotBridge() {
  const { gl, scene, camera } = useThree();
  const setSnapshotProvider = useUIStore((s) => s.setSnapshotProvider);

  useEffect(() => {
    setSnapshotProvider(() => {
      try {
        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/jpeg', 0.72);
      } catch {
        return undefined;
      }
    });
    return () => setSnapshotProvider(null);
  }, [gl, scene, camera, setSnapshotProvider]);

  return null;
}

function SunLightingRig() {
  const sunTime = useProjectStore((s) => s.project.scene.sunTime);
  const theme = useUIStore((s) => s.theme);
  const performanceMode = useUIStore((s) => s.performanceMode);

  const lighting = useMemo(() => {
    const clamped = Math.max(6, Math.min(21, sunTime));
    const isDay = clamped <= 18.1;

    if (isDay) {
      const progress = (clamped - 6) / 12.1; // 0 at 06:00, 1 at 18:06
      const elevation = Math.max(0.08, Math.sin(progress * Math.PI) * 1.28);
      const azimuth = (progress - 0.5) * Math.PI * 1.15;
      const radius = 26;
      const x = Math.sin(azimuth) * Math.cos(elevation) * radius;
      const y = Math.sin(elevation) * radius;
      const z = Math.cos(azimuth) * Math.cos(elevation) * radius * 0.65;

      // Golden hour warmth near morning (06-08) and late afternoon (16-18)
      const middayFactor = Math.sin(progress * Math.PI);
      const sunColor =
        middayFactor < 0.35 ? '#FFB677' : middayFactor < 0.65 ? '#FFE5C2' : '#FFFDF8';
      const sunIntensity = 0.75 + middayFactor * 1.45;
      const ambientIntensity = (theme === 'dark' ? 0.38 : 0.52) + middayFactor * 0.25;

      // Studio canvas background blends gently with dusk while honoring Light/Dark UI mode
      const baseBg =
        theme === 'dark'
          ? middayFactor < 0.28
            ? '#13161B'
            : '#121715'
          : middayFactor < 0.25
          ? '#E6DFD5'
          : '#F2F2ED';

      return {
        position: [x, y, z] as [number, number, number],
        sunColor,
        sunIntensity,
        ambientIntensity,
        hemiSky: middayFactor < 0.3 ? '#FFD4A8' : '#EBF3FA',
        hemiGround: theme === 'dark' ? '#1E2421' : '#C9C6BC',
        bgHex: baseBg,
      };
    }

    // Evening / Night (18:10 - 21:00)
    const nightDepth = Math.min(1, (clamped - 18.1) / 2.9);
    const bgHex =
      theme === 'dark'
        ? '#0B0F12'
        : nightDepth > 0.5
        ? '#1D242B'
        : '#353E47';

    return {
      position: [-12, 16, -10] as [number, number, number],
      sunColor: '#8CA8CC',
      sunIntensity: 0.28,
      ambientIntensity: 0.24,
      hemiSky: '#3A4B63',
      hemiGround: '#191D1B',
      bgHex,
    };
  }, [sunTime, theme]);

  const shadowMapSize = performanceMode === 'low' ? 512 : performanceMode === 'high' ? 2048 : 1024;

  return (
    <>
      <color attach="background" args={[lighting.bgHex]} />
      <ambientLight intensity={lighting.ambientIntensity} />
      <hemisphereLight
        args={[lighting.hemiSky, lighting.hemiGround, 0.55]}
        position={[0, 25, 0]}
      />
      <directionalLight
        position={lighting.position}
        color={lighting.sunColor}
        intensity={lighting.sunIntensity}
        castShadow={performanceMode !== 'low'}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={1}
        shadow-camera-far={65}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0004}
      />
    </>
  );
}

function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera, size } = useThree();

  const preset = useProjectStore((s) => s.project.scene.cameraPreset);
  const autoRotate = useProjectStore((s) => s.project.scene.autoRotate);
  const dimensions = useProjectStore((s) => s.project.dimensions);
  const houseType = useProjectStore((s) => s.project.houseType);

  const cameraTriggerNonce = useUIStore((s) => s.cameraTriggerNonce);
  const customCameraTarget = useUIStore((s) => s.customCameraTarget);

  const desiredPosRef = useRef(new THREE.Vector3(14, 9, 15));
  const desiredTargetRef = useRef(new THREE.Vector3(0, 1.8, 0));
  const isAnimatingRef = useRef(true);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const { landWidth: lw, landLength: ll, buildingWidth: bw, buildingLength: bl, floors } =
      dimensions;
    const floorH = houseType === 'industrial-loft' ? 3.4 : 3.1;
    const totalH = floors * floorH;
    const frontSetback = Math.max(1.2, (ll - bl) * 0.65);
    const rearSetback = ll - bl - frontSetback;
    const buildingCenterZ = (rearSetback - frontSetback) / 2;
    const portraitScale =
      size.width > 0 && size.width < size.height
        ? Math.min(1.55, Math.max(1.15, (size.height / size.width) * 0.68))
        : 1;

    if (customCameraTarget) {
      desiredPosRef.current.set(
        customCameraTarget.position[0] * portraitScale,
        customCameraTarget.position[1] * portraitScale,
        customCameraTarget.position[2] * portraitScale
      );
      desiredTargetRef.current.set(...customCameraTarget.target);
    } else if (preset === 'front') {
      desiredPosRef.current.set(
        0,
        Math.max(2.6, totalH * 0.55),
        Math.max(13, ll * 0.92) * portraitScale
      );
      desiredTargetRef.current.set(0, totalH * 0.42, buildingCenterZ);
    } else if (preset === 'top') {
      const span = Math.max(lw, ll);
      desiredPosRef.current.set(0, Math.max(17, span * 1.28) * portraitScale, 0.08);
      desiredTargetRef.current.set(0, 0, 0);
    } else if (preset === 'interior') {
      desiredPosRef.current.set(
        -bw * 0.14,
        1.62,
        buildingCenterZ + Math.max(1.2, bl * 0.34)
      );
      desiredTargetRef.current.set(
        bw * 0.12,
        1.35,
        buildingCenterZ - Math.max(1.2, bl * 0.28)
      );
    } else {
      // perspective default
      desiredPosRef.current.set(
        Math.max(12, lw * 1.05) * portraitScale,
        Math.max(8, totalH * 1.45) * portraitScale,
        Math.max(13.5, ll * 0.92) * portraitScale
      );
      desiredTargetRef.current.set(0, totalH * 0.35, 0);
    }

    if (prefersReducedMotion) {
      camera.position.copy(desiredPosRef.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(desiredTargetRef.current);
        controlsRef.current.update();
      }
      isAnimatingRef.current = false;
    } else {
      isAnimatingRef.current = true;
    }
  }, [
    preset,
    cameraTriggerNonce,
    customCameraTarget,
    dimensions,
    houseType,
    camera,
    prefersReducedMotion,
    size.width,
    size.height,
  ]);

  useFrame((_, delta) => {
    if (!isAnimatingRef.current) return;
    const step = Math.min(1, delta * 5.5);
    camera.position.lerp(desiredPosRef.current, step);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTargetRef.current, step);
      controlsRef.current.update();
    }
    const dist = camera.position.distanceTo(desiredPosRef.current);
    if (dist < 0.06) {
      isAnimatingRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      minDistance={2.2}
      maxDistance={46}
      maxPolarAngle={Math.PI / 2 - 0.025}
      autoRotate={autoRotate}
      autoRotateSpeed={1.1}
      onStart={() => {
        isAnimatingRef.current = false;
      }}
    />
  );
}

function SiteGridAndDimensions() {
  const showGrid = useProjectStore((s) => s.project.scene.showGrid);
  const showDimensions = useProjectStore((s) => s.project.scene.showDimensions);
  const dimensions = useProjectStore((s) => s.project.dimensions);
  const houseType = useProjectStore((s) => s.project.houseType);
  const language = useUIStore((s) => s.language);
  const theme = useUIStore((s) => s.theme);

  const { landWidth: lw, landLength: ll, buildingWidth: bw, buildingLength: bl, floors } =
    dimensions;
  const floorH = houseType === 'industrial-loft' ? 3.4 : 3.1;
  const approxRoofAdd =
    houseType === 'modern-minimalist' ? 0.65 : houseType === 'tropical-villa' ? 2.2 : 1.65;
  const totalHeight = Math.round((floors * floorH + approxRoofAdd) * 10) / 10;

  const frontSetback = Math.max(1.2, (ll - bl) * 0.65);
  const rearSetback = ll - bl - frontSetback;
  const buildingCenterZ = (rearSetback - frontSetback) / 2;

  return (
    <>
      {showGrid && (
        <Grid
          position={[0, -0.11, 0]}
          args={[60, 60]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={theme === 'dark' ? '#2A332E' : '#D3D7CE'}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={theme === 'dark' ? '#435149' : '#ABB3A8'}
          fadeDistance={42}
          fadeStrength={1.2}
        />
      )}

      {showDimensions && (
        <group>
          {/* Plot Width Callout Line (-Z Rear Edge) */}
          <mesh position={[0, 0.05, -ll / 2 - 0.65]}>
            <boxGeometry args={[lw, 0.025, 0.025]} />
            <meshBasicMaterial color="#C25438" />
          </mesh>
          <Html position={[0, 0.35, -ll / 2 - 0.65]} center zIndexRange={[5, 0]}>
            <div className="pointer-events-none whitespace-nowrap rounded border border-studio-borderStrong bg-studio-elevated/95 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-studio-text shadow-sm">
              {language === 'id' ? 'Lebar Lahan' : 'Plot Width'}: {formatMeters(lw, language)}
            </div>
          </Html>

          {/* Plot Length Callout Line (-X Left Edge) */}
          <mesh position={[-lw / 2 - 0.65, 0.05, 0]}>
            <boxGeometry args={[0.025, 0.025, ll]} />
            <meshBasicMaterial color="#C25438" />
          </mesh>
          <Html position={[-lw / 2 - 0.85, 0.35, 0]} center zIndexRange={[5, 0]}>
            <div className="pointer-events-none whitespace-nowrap rounded border border-studio-borderStrong bg-studio-elevated/95 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-studio-text shadow-sm">
              {language === 'id' ? 'Panjang Lahan' : 'Plot Length'}: {formatMeters(ll, language)}
            </div>
          </Html>

          {/* Building Footprint Callout (+X Right Edge) */}
          <mesh position={[lw / 2 + 0.55, 0.08, buildingCenterZ]}>
            <boxGeometry args={[0.025, 0.025, bl]} />
            <meshBasicMaterial color="#2A6B52" />
          </mesh>
          <Html position={[lw / 2 + 0.85, 0.45, buildingCenterZ]} center zIndexRange={[5, 0]}>
            <div className="pointer-events-none whitespace-nowrap rounded border border-studio-border bg-studio-elevated/95 px-2 py-0.5 text-[11px] font-medium tabular-nums text-studio-text shadow-sm">
              {language === 'id' ? 'Bangunan' : 'Footprint'}: {formatMeters(bw, language)} ×{' '}
              {formatMeters(bl, language)} ({floors}L · ±{formatMeters(totalHeight, language)})
            </div>
          </Html>
        </group>
      )}
    </>
  );
}

export default function ViewportCanvas() {
  const performanceMode = useUIStore((s) => s.performanceMode);
  const setSelectedElement = useUIStore((s) => s.setSelectedElement);

  const dpr: [number, number] =
    performanceMode === 'low' ? [1, 1] : performanceMode === 'high' ? [1, 2] : [1, 1.65];

  return (
    <Canvas
      shadows={performanceMode !== 'low'}
      dpr={dpr}
      camera={{ position: [14, 9.5, 15], fov: 42, near: 0.2, far: 160 }}
      gl={{
        antialias: performanceMode !== 'low',
        preserveDrawingBuffer: true,
        powerPreference: performanceMode === 'low' ? 'low-power' : 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.98,
      }}
      onPointerMissed={(e) => {
        if (e.type === 'click') {
          setSelectedElement(null);
        }
      }}
    >
      <SnapshotBridge />
      <SunLightingRig />
      <CameraRig />
      <SiteGridAndDimensions />
      <ArchitecturalHouse />
    </Canvas>
  );
}
