import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Configuration } from './configuration.ts';

export function createNightVisionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Night Vision preview requires Canvas 2D');
  context.fillStyle = '#0c1115'; context.fillRect(0, 0, 512, 256);
  context.fillStyle = '#303b43'; context.beginPath(); context.moveTo(0, 225); context.lineTo(210, 65); context.lineTo(300, 65); context.lineTo(512, 225); context.fill();
  context.strokeStyle = '#a7b5b8'; context.lineWidth = 3; context.setLineDash([15, 12]);
  context.beginPath(); context.moveTo(180, 225); context.lineTo(244, 65); context.moveTo(335, 225); context.lineTo(268, 65); context.stroke(); context.setLineDash([]);
  context.strokeStyle = '#ffa64d'; context.fillStyle = '#ffd48a'; context.lineWidth = 8;
  context.beginPath(); context.arc(350, 115, 10, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.moveTo(350, 130); context.lineTo(350, 162); context.moveTo(335, 143); context.lineTo(367, 143); context.moveTo(350, 160); context.lineTo(337, 186); context.moveTo(350, 160); context.lineTo(364, 186); context.stroke();
  context.lineWidth = 2; context.strokeRect(320, 95, 64, 106);
  context.font = '22px monospace'; context.fillStyle = '#c8d8dd'; context.fillText('NIGHT VISION', 18, 30);
  context.fillStyle = '#ffa64d'; context.fillText('32 m', 393, 130);
  context.font = '20px monospace'; context.fillStyle = '#b9c0c4'; context.fillText('DEMO - NOT A LIVE CAMERA', 18, 247);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBmwEquipment(nightMap: THREE.Texture) {
  const group = new THREE.Group(); group.name = 'bmw-equipment';
  const dark = new THREE.MeshStandardMaterial({ color: '#181e22', roughness: 0.65 });
  const metal = new THREE.MeshStandardMaterial({ color: '#565f65', metalness: 0.7, roughness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: '#9cafb6', metalness: 1, roughness: 0.08 });
  const lens = new THREE.MeshStandardMaterial({ color: '#153849', metalness: 0.45, roughness: 0.1 });
  function box(parent: THREE.Object3D, name: string, size: [number, number, number], position: [number, number, number], material: THREE.Material = dark) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, 0.006), material);
    mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  function arm(parent: THREE.Object3D, name: string, start: [number, number, number], end: [number, number, number]) {
    const a = new THREE.Vector3(...start); const b = new THREE.Vector3(...end);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, a.distanceTo(b), 12), metal);
    mesh.name = name; mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize()); parent.add(mesh);
  }
  function camera(parent: THREE.Object3D, name: string, position: [number, number, number], rear = false) {
    box(parent, name, [0.085, 0.055, 0.04], position);
    const optic = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.018, 24), lens);
    optic.name = `${name}-lens`; optic.rotation.x = Math.PI / 2;
    optic.position.set(position[0], position[1], position[2] + (rear ? -0.026 : 0.026)); parent.add(optic);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.003, 8, 6), new THREE.MeshBasicMaterial({ color: '#dc493e' }));
    led.position.set(position[0] + 0.027, position[1] + 0.014, position[2] + (rear ? 0.022 : -0.022)); parent.add(led);
  }

  const mount = box(group, 'mirror-windshield-mount', [0.04, 0.04, 0.016], [0, 1.14, 0.335]); mount.rotation.x = -0.55;
  arm(group, 'mirror-arm', [0, 1.13, 0.335], [0, 1.075, 0.28]);
  box(group, 'rear-view-mirror', [0.27, 0.08, 0.04], [0, 1.04, 0.28]);
  box(group, 'mirror-surface', [0.245, 0.059, 0.003], [0, 1.04, 0.258], glass);

  const night = new THREE.Group(); night.name = 'night-vision-equipment'; group.add(night);
  box(night, 'night-camera-base', [0.06, 0.045, 0.016], [-0.17, 0.48, 2.155]);
  camera(night, 'night-vision-camera', [-0.17, 0.48, 2.165]);
  box(night, 'night-screen-base', [0.08, 0.015, 0.055], [0, 0.845, 0.59]);
  arm(night, 'night-screen-arm', [0, 0.85, 0.59], [0, 0.88, 0.59]);
  box(night, 'night-screen', [0.23, 0.135, 0.025], [0, 0.93, 0.59]);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.214, 0.119), new THREE.MeshBasicMaterial({ map: nightMap }));
  screen.name = 'night-preview'; screen.rotation.y = Math.PI; screen.position.set(0, 0.93, 0.576); night.add(screen);

  const recorder = new THREE.Group(); recorder.name = 'recorder-equipment'; group.add(recorder);
  const frontMount = box(recorder, 'front-recorder-mount', [0.035, 0.035, 0.014], [-0.19, 1.12, 0.385]); frontMount.rotation.x = -0.55;
  arm(recorder, 'front-recorder-arm', [-0.19, 1.11, 0.38], [-0.19, 1.065, 0.34]);
  camera(recorder, 'front-recorder', [-0.19, 1.04, 0.34]);
  box(recorder, 'rear-recorder-mount', [0.035, 0.035, 0.02], [0, 1.10, -1.03]);
  arm(recorder, 'rear-recorder-arm', [0, 1.09, -1.03], [0, 1.04, -1.07]);
  camera(recorder, 'rear-recorder', [0, 1.015, -1.07], true);
  night.visible = false; recorder.visible = false;
  return {
    group,
    setConfiguration(configuration: Configuration) {
      night.visible = configuration.extras.includes('night');
      recorder.visible = configuration.extras.includes('recorder');
    },
  };
}
