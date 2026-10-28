import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Configuration } from './configuration.ts';

export function createBmwInstrumentTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 400;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Instrument texture requires Canvas 2D');
  context.fillStyle = '#111416';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const [cx, radius, maximum, label] of [[290, 155, 240, 'km/h'], [735, 155, 8, 'rpm × 1000']] as const) {
    context.strokeStyle = '#636b70';
    context.lineWidth = 4;
    context.beginPath(); context.arc(cx, 185, radius, 0, Math.PI * 2); context.stroke();
    for (let i = 0; i <= 40; i++) {
      const angle = Math.PI * (0.75 + i / 40 * 1.5);
      const major = i % 5 === 0;
      context.strokeStyle = maximum === 8 && i > 32 ? '#b43b2b' : '#e9e4db';
      context.lineWidth = major ? 4 : 2;
      context.beginPath();
      context.moveTo(cx + Math.cos(angle) * (radius - 12), 185 + Math.sin(angle) * (radius - 12));
      context.lineTo(cx + Math.cos(angle) * (radius - (major ? 30 : 20)), 185 + Math.sin(angle) * (radius - (major ? 30 : 20)));
      context.stroke();
      if (major) {
        context.fillStyle = '#e9e4db'; context.font = '22px Arial'; context.textAlign = 'center'; context.textBaseline = 'middle';
        context.fillText(String(Math.round(i / 40 * maximum)), cx + Math.cos(angle) * (radius - 52), 185 + Math.sin(angle) * (radius - 52));
      }
    }
    const needleAngle = Math.PI * 0.79;
    context.strokeStyle = '#e45d32'; context.lineWidth = 5;
    context.beginPath(); context.moveTo(cx, 185); context.lineTo(cx + Math.cos(needleAngle) * 112, 185 + Math.sin(needleAngle) * 112); context.stroke();
    context.fillStyle = '#272d31'; context.beginPath(); context.arc(cx, 185, 12, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#a9b0b1'; context.font = '18px Arial'; context.textAlign = 'center'; context.fillText(label, cx, 260);
  }
  context.fillStyle = '#dd9b62'; context.font = '26px monospace'; context.textAlign = 'center'; context.fillText('128 328 km   +18.5°C', 512, 374);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBmwCabin(instrumentMap: THREE.Texture) {
  const group = new THREE.Group();
  group.name = 'bmw-refined-cabin';
  const soft = new THREE.MeshStandardMaterial({ color: '#292d30', roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: '#111719', roughness: 0.75 });
  const leather = new THREE.MeshStandardMaterial({ name: 'bmw-cabin-leather', color: '#242424', roughness: 0.8 });
  const metal = new THREE.MeshStandardMaterial({ color: '#929a9e', metalness: 0.8, roughness: 0.3 });
  const trim = new THREE.MeshStandardMaterial({ name: 'bmw-cabin-trim', color: '#343a3d', metalness: 0.2, roughness: 0.65 });
  const woodPattern = { value: 0 };
  trim.onBeforeCompile = shader => {
    shader.uniforms.cabinWoodPattern = woodPattern;
    shader.vertexShader = `varying vec3 cabinTrimPosition;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\ncabinTrimPosition = position;');
    shader.fragmentShader = `varying vec3 cabinTrimPosition;\nuniform float cabinWoodPattern;\n${shader.fragmentShader}`.replace('#include <map_fragment>', `
      #include <map_fragment>
      float weave = 0.8 + 0.2 * mod(floor(cabinTrimPosition.x * 180.0) + floor(cabinTrimPosition.y * 180.0), 2.0);
      float grain = 0.88 + 0.12 * sin(cabinTrimPosition.x * 140.0 + sin(cabinTrimPosition.z * 45.0) * 3.0);
      diffuseColor.rgb *= mix(weave, grain, cabinWoodPattern);
    `);
  };
  trim.customProgramCacheKey = () => 'bmw-refined-trim-v1';
  const amber = new THREE.MeshBasicMaterial({ color: '#d38b4f' });

  function box(name: string, size: [number, number, number], position: [number, number, number], material: THREE.Material, radius = 0.02, parent: THREE.Object3D = group) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material);
    mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
    return mesh;
  }
  function knob(position: [number, number, number], radius = 0.018) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.018, 24), soft);
    mesh.rotation.x = Math.PI / 2; mesh.position.set(...position); group.add(mesh);
    box('knob-marker', [0.002, 0.009, 0.002], [position[0], position[1] + radius * 0.4, position[2] - 0.01], metal, 0.001);
  }
  function vent(x: number, y: number, z: number, width: number) {
    box('vent-surround', [width + 0.014, 0.075, 0.025], [x, y, z], trim, 0.009);
    box('vent-recess', [width, 0.06, 0.028], [x, y, z - 0.012], dark, 0.006);
    for (let i = 0; i < 5; i++) box('vent-slat', [width - 0.01, 0.003, 0.018], [x, y - 0.023 + i * 0.011, z - 0.029], soft, 0.001);
  }

  box('cabin-floor', [1.5, 0.04, 2.65], [0, 0.15, -0.3], dark);
  box('dashboard-body', [1.34, 0.26, 0.2], [0, 0.665, 0.65], soft, 0.06);
  box('dashboard-top', [1.3, 0.065, 0.18], [0, 0.805, 0.64], soft, 0.03);
  box('dashboard-trim', [1.3, 0.045, 0.035], [0, 0.735, 0.548], trim, 0.008);
  box('glovebox', [0.45, 0.155, 0.025], [-0.41, 0.615, 0.55], soft, 0.018);
  box('glovebox-latch', [0.075, 0.014, 0.016], [-0.41, 0.662, 0.529], metal, 0.006);
  vent(-0.57, 0.785, 0.51, 0.1); vent(0.57, 0.785, 0.51, 0.1);
  vent(-0.075, 0.785, 0.502, 0.115); vent(0.075, 0.785, 0.502, 0.115);

  box('instrument-hood', [0.46, 0.19, 0.16], [0.35, 0.807, 0.61], soft, 0.06);
  const instruments = new THREE.Mesh(new THREE.PlaneGeometry(0.405, 0.158), new THREE.MeshBasicMaterial({ map: instrumentMap }));
  instruments.name = 'instrument-display'; instruments.rotation.y = Math.PI; instruments.position.set(0.35, 0.795, 0.522); group.add(instruments);
  box('center-stack', [0.29, 0.37, 0.14], [0, 0.49, 0.59], soft, 0.03);
  box('radio-face', [0.245, 0.095, 0.018], [0, 0.61, 0.512], dark, 0.007);
  box('radio-display', [0.14, 0.025, 0.004], [0, 0.625, 0.5], amber, 0.003);
  for (let i = 0; i < 6; i++) box('radio-preset', [0.025, 0.011, 0.008], [-0.083 + i * 0.033, 0.58, 0.497], soft, 0.002);
  knob([-0.103, 0.625, 0.49], 0.015); knob([0.103, 0.625, 0.49], 0.015);
  box('climate-face', [0.245, 0.085, 0.022], [0, 0.49, 0.51], dark, 0.008);
  for (const x of [-0.08, 0, 0.08]) knob([x, 0.492, 0.489], 0.025);
  box('storage-pocket', [0.21, 0.065, 0.035], [0, 0.385, 0.51], dark, 0.01);
  box('console-tunnel', [0.25, 0.16, 0.91], [0, 0.18, -0.1], soft, 0.04);
  box('console-insert', [0.2, 0.015, 0.35], [0, 0.266, 0.13], trim, 0.025);
  box('gear-boot', [0.105, 0.04, 0.13], [0, 0.29, 0.14], dark, 0.025);
  const gear = new THREE.Mesh(new THREE.CapsuleGeometry(0.023, 0.06, 4, 16), dark);
  gear.name = 'gear-selector'; gear.position.set(0, 0.35, 0.14); group.add(gear);
  box('handbrake', [0.035, 0.04, 0.23], [-0.07, 0.29, -0.23], dark, 0.015);
  box('armrest', [0.18, 0.075, 0.29], [0, 0.32, -0.42], leather, 0.03);

  const steering = new THREE.Group(); steering.name = 'refined-steering-wheel'; steering.position.set(0.35, 0.68, 0.31); steering.rotation.x = -0.14; group.add(steering);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.158, 0.019, 12, 64), dark); steering.add(ring);
  box('steering-hub', [0.13, 0.105, 0.055], [0, 0, -0.004], dark, 0.025, steering);
  for (const side of [-1, 1]) box('steering-spoke', [0.1, 0.035, 0.024], [side * 0.1, -0.012, 0.005], soft, 0.009, steering);
  const bottomSpoke = box('steering-bottom-spoke', [0.035, 0.11, 0.024], [0, -0.095, 0.005], soft, 0.008, steering); bottomSpoke.rotation.z = 0.05;
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.019, 24), metal); badge.rotation.y = Math.PI; badge.position.z = -0.034; steering.add(badge);

  for (const side of [-1, 1]) {
    const x = side * 0.35;
    box('footwell', [0.54, 0.04, 0.6], [side * 0.43, 0.18, 0.3], dark, 0.015);
    box('lower-dashboard', [0.48, 0.2, 0.16], [side * 0.44, 0.43, 0.66], soft, 0.035);
    box('seat-cushion', [0.48, 0.13, 0.49], [x, 0.255, -0.11], leather, 0.055);
    const back = box('seat-back', [0.46, 0.5, 0.13], [x, 0.59, -0.43], leather, 0.055); back.rotation.x = -0.12;
    box('seat-headrest', [0.25, 0.16, 0.11], [x, 0.955, -0.48], leather, 0.04);
    for (const offset of [-0.195, 0.195]) {
      box('seat-cushion-bolster', [0.065, 0.1, 0.43], [x + offset, 0.325, -0.11], leather, 0.03);
      const bolster = box('seat-back-bolster', [0.06, 0.41, 0.12], [x + offset, 0.6, -0.39], leather, 0.025); bolster.rotation.x = -0.12;
    }
    for (const offset of [-0.07, 0.07]) box('headrest-post', [0.012, 0.06, 0.012], [x + offset, 0.86, -0.47], metal, 0.003);
    box('door-panel', [0.045, 0.6, 1.18], [side * 0.685, 0.46, -0.15], soft, 0.02);
    box('door-upholstery', [0.018, 0.17, 0.68], [side * 0.653, 0.51, -0.23], leather, 0.015);
    box('door-trim', [0.024, 0.035, 0.95], [side * 0.65, 0.69, -0.15], trim, 0.009);
    box('door-armrest', [0.095, 0.055, 0.46], [side * 0.62, 0.4, -0.18], leather, 0.025);
    box('door-handle', [0.025, 0.023, 0.1], [side * 0.63, 0.63, 0.18], metal, 0.007);
    box('rear-headrest', [0.25, 0.14, 0.1], [x, 0.84, -1.3], leather, 0.03);
  }
  box('rear-bench', [1.28, 0.13, 0.46], [0, 0.25, -1.04], leather, 0.045);
  box('rear-backrest', [1.28, 0.44, 0.14], [0, 0.56, -1.29], leather, 0.05);

  return {
    group,
    setConfiguration(color: string, decor: Configuration['decor']) {
      leather.color.set(color);
      trim.color.set(decor === 'wood' ? '#805033' : '#343a3d');
      trim.roughness = decor === 'wood' ? 0.4 : 0.65;
      woodPattern.value = decor === 'wood' ? 1 : 0;
    },
  };
}
