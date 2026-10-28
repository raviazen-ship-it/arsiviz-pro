import * as THREE from 'three';
import { AccentMaterial, FloorMaterial, RoofMaterial } from '@/types/project';

const textureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateTexture(
  key: string,
  repeatX: number,
  repeatY: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  draw(ctx, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

export function getRoofTexture(material: RoofMaterial): {
  map: THREE.CanvasTexture | null;
  color: string;
  roughness: number;
  metalness: number;
} {
  if (material === 'ceramic-tile') {
    const map = getOrCreateTexture('roof-ceramic', 6, 6, (ctx, s) => {
      ctx.fillStyle = '#924C3C';
      ctx.fillRect(0, 0, s, s);
      const rows = 8;
      const cols = 6;
      const rh = s / rows;
      const cw = s / cols;
      for (let r = 0; r < rows; r++) {
        ctx.fillStyle = r % 2 === 0 ? '#9B5241' : '#8A4536';
        ctx.fillRect(0, r * rh, s, rh - 2);
        ctx.fillStyle = 'rgba(35, 15, 10, 0.28)';
        ctx.fillRect(0, (r + 1) * rh - 3, s, 3);
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = 'rgba(255, 210, 190, 0.1)';
          ctx.fillRect(c * cw + 3, r * rh + 2, cw * 0.45, rh - 5);
          ctx.fillStyle = 'rgba(30, 12, 8, 0.2)';
          ctx.fillRect(c * cw, r * rh, 2, rh);
        }
      }
    });
    return { map, color: '#FFFFFF', roughness: 0.58, metalness: 0.05 };
  }

  if (material === 'bitumen-slate') {
    const map = getOrCreateTexture('roof-slate', 6, 6, (ctx, s) => {
      ctx.fillStyle = '#363B3F';
      ctx.fillRect(0, 0, s, s);
      const rows = 10;
      const rh = s / rows;
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * 24;
        ctx.fillStyle = r % 2 === 0 ? '#3C4246' : '#31363A';
        ctx.fillRect(0, r * rh, s, rh - 1.5);
        ctx.fillStyle = 'rgba(15, 18, 20, 0.4)';
        ctx.fillRect(0, (r + 1) * rh - 2, s, 2);
        for (let x = offset; x < s; x += 48) {
          ctx.fillStyle = 'rgba(20, 22, 24, 0.35)';
          ctx.fillRect(x, r * rh, 1.5, rh);
        }
      }
    });
    return { map, color: '#FFFFFF', roughness: 0.85, metalness: 0.08 };
  }

  // concrete-membrane
  const map = getOrCreateTexture('roof-membrane', 3, 3, (ctx, s) => {
    ctx.fillStyle = '#858B88';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(55, 60, 58, 0.28)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, s - 4, s - 4);
    ctx.beginPath();
    ctx.moveTo(0, s / 2);
    ctx.lineTo(s, s / 2);
    ctx.moveTo(s / 2, 0);
    ctx.lineTo(s / 2, s);
    ctx.stroke();
  });
  return { map, color: '#FFFFFF', roughness: 0.78, metalness: 0.04 };
}

export function getAccentTexture(material: AccentMaterial): {
  map: THREE.CanvasTexture | null;
  color: string;
  roughness: number;
  metalness: number;
} {
  if (material === 'ulin-wood') {
    const map = getOrCreateTexture('accent-ulin', 3, 2, (ctx, s) => {
      ctx.fillStyle = '#7A4E2D';
      ctx.fillRect(0, 0, s, s);
      const slats = 12;
      const sw = s / slats;
      for (let i = 0; i < slats; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#845533' : '#704628';
        ctx.fillRect(i * sw, 0, sw - 3, s);
        ctx.fillStyle = '#2E1B0E';
        ctx.fillRect((i + 1) * sw - 3, 0, 3, s);
      }
    });
    return { map, color: '#FFFFFF', roughness: 0.56, metalness: 0.05 };
  }

  if (material === 'andesite-stone') {
    const map = getOrCreateTexture('accent-andesite', 4, 4, (ctx, s) => {
      ctx.fillStyle = '#4E5351';
      ctx.fillRect(0, 0, s, s);
      const rows = 6;
      const rh = s / rows;
      for (let r = 0; r < rows; r++) {
        const shift = (r % 2) * 32;
        for (let x = -32; x < s; x += 64) {
          ctx.fillStyle = (r + x) % 3 === 0 ? '#575C5A' : '#464B49';
          ctx.fillRect(x + shift + 2, r * rh + 2, 60, rh - 4);
        }
      }
    });
    return { map, color: '#FFFFFF', roughness: 0.88, metalness: 0.05 };
  }

  if (material === 'exposed-brick') {
    const map = getOrCreateTexture('accent-brick', 5, 5, (ctx, s) => {
      ctx.fillStyle = '#C9C2B8'; // mortar
      ctx.fillRect(0, 0, s, s);
      const rows = 10;
      const rh = s / rows;
      const bw = s / 4;
      for (let r = 0; r < rows; r++) {
        const shift = (r % 2) * (bw / 2);
        for (let c = -1; c < 5; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#9F4E3C' : '#914535';
          ctx.fillRect(c * bw + shift + 2, r * rh + 2, bw - 4, rh - 4);
        }
      }
    });
    return { map, color: '#FFFFFF', roughness: 0.84, metalness: 0.03 };
  }

  // matte-steel
  const map = getOrCreateTexture('accent-steel', 2, 2, (ctx, s) => {
    ctx.fillStyle = '#282C2E';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#181B1D';
    ctx.lineWidth = 3;
    for (let x = 0; x < s; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, s);
      ctx.stroke();
    }
  });
  return { map, color: '#FFFFFF', roughness: 0.42, metalness: 0.55 };
}

export function getFloorTexture(material: FloorMaterial): {
  map: THREE.CanvasTexture | null;
  color: string;
  roughness: number;
  metalness: number;
} {
  if (material === 'granite-marble') {
    const map = getOrCreateTexture('floor-marble', 4, 4, (ctx, s) => {
      ctx.fillStyle = '#ECEAE4';
      ctx.fillRect(0, 0, s, s);
      // Subtle stone veining
      ctx.strokeStyle = 'rgba(160, 158, 150, 0.32)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, 30);
      ctx.bezierCurveTo(90, 70, 150, 20, 245, 110);
      ctx.moveTo(20, 160);
      ctx.bezierCurveTo(100, 190, 175, 145, 240, 220);
      ctx.stroke();
      // Tile grout grid
      ctx.strokeStyle = 'rgba(180, 178, 172, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, s / 2 - 2, s / 2 - 2);
      ctx.strokeRect(s / 2 + 1, 1, s / 2 - 2, s / 2 - 2);
      ctx.strokeRect(1, s / 2 + 1, s / 2 - 2, s / 2 - 2);
      ctx.strokeRect(s / 2 + 1, s / 2 + 1, s / 2 - 2, s / 2 - 2);
    });
    return { map, color: '#FFFFFF', roughness: 0.26, metalness: 0.05 };
  }

  if (material === 'oak-parquet') {
    const map = getOrCreateTexture('floor-oak', 5, 5, (ctx, s) => {
      ctx.fillStyle = '#BD9162';
      ctx.fillRect(0, 0, s, s);
      const planks = 8;
      const ph = s / planks;
      for (let r = 0; r < planks; r++) {
        ctx.fillStyle = r % 2 === 0 ? '#C49868' : '#B48759';
        ctx.fillRect(0, r * ph, s, ph - 1.5);
        ctx.fillStyle = 'rgba(90, 58, 28, 0.35)';
        ctx.fillRect(0, (r + 1) * ph - 1.5, s, 1.5);
        const jointX = ((r * 73) % (s - 40)) + 20;
        ctx.fillRect(jointX, r * ph, 1.5, ph);
      }
    });
    return { map, color: '#FFFFFF', roughness: 0.48, metalness: 0.04 };
  }

  // exposed-cement
  const map = getOrCreateTexture('floor-cement', 3, 3, (ctx, s) => {
    ctx.fillStyle = '#A0A5A2';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = 'rgba(130, 136, 132, 0.25)';
    ctx.fillRect(20, 30, 95, 80);
    ctx.fillRect(130, 140, 100, 90);
    ctx.strokeStyle = 'rgba(80, 84, 82, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, s, s);
  });
  return { map, color: '#FFFFFF', roughness: 0.72, metalness: 0.03 };
}
