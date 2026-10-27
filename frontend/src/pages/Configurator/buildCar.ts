import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { getSelections } from './configuration';
import type { Configuration } from './configuration';

// An original procedural roadster. Replace this builder with a GLTFLoader when
// the team's production vehicle asset is available; the viewer API stays the same.
export function buildCar(configuration: Configuration): THREE.Group {
  const selected = getSelections(configuration);
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: selected.paint.color, metalness: 0.65, roughness: 0.26, clearcoat: 1 });
  const dark = new THREE.MeshStandardMaterial({ color: '#17191b', roughness: 0.7 });
  const metal = new THREE.MeshStandardMaterial({ color: configuration.wheels === 'forged' ? '#bac0c3' : '#555a60', metalness: 0.85, roughness: 0.28 });
  const leather = new THREE.MeshStandardMaterial({ color: selected.interior.color, roughness: 0.85 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#9fbdc3', transparent: true, opacity: 0.38, metalness: 0.1, roughness: 0.08, side: THREE.DoubleSide, depthWrite: false });
  const trim = new THREE.MeshStandardMaterial({ color: configuration.decor === 'wood' ? '#795137' : '#35383b', roughness: 0.48 });
  const lamp = new THREE.MeshStandardMaterial({ color: '#e3f0f0', emissive: '#c9e4ef', emissiveIntensity: configuration.extras.includes('matrix') ? 1.5 : 0.5 });
  const red = new THREE.MeshStandardMaterial({ color: '#c51b28', emissive: '#9e0913', emissiveIntensity: 0.8 });

  function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], material: THREE.Material, radius = 0.03) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, radius), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function bar(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 12), material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    mesh.castShadow = true;
    car.add(mesh);
  }

  const profile = new THREE.Shape();
  profile.moveTo(-2.19, 0.43);
  profile.lineTo(-2.25, 0.77);
  profile.quadraticCurveTo(-2.15, 1.01, -1.8, 1.03);
  profile.lineTo(-1.08, 1.04);
  profile.lineTo(-0.9, 0.97);
  profile.lineTo(0.58, 0.97);
  profile.quadraticCurveTo(1.5, 1.05, 2.17, 0.77);
  profile.lineTo(2.28, 0.46);
  profile.lineTo(1.94, 0.37);
  profile.lineTo(1.94, 0.46);
  profile.absarc(1.4, 0.46, 0.54, 0, Math.PI, false);
  profile.lineTo(0.86, 0.37);
  profile.lineTo(-0.88, 0.37);
  profile.lineTo(-0.88, 0.46);
  profile.absarc(-1.42, 0.46, 0.54, 0, Math.PI, false);
  profile.lineTo(-1.96, 0.4);
  profile.closePath();
  const bodyGeometry = new THREE.ExtrudeGeometry(profile, { depth: 1.65, bevelEnabled: true, bevelSize: 0.055, bevelThickness: 0.055, bevelSegments: 3, steps: 1, curveSegments: 24 });
  bodyGeometry.translate(0, 0, -0.825);
  const body = new THREE.Mesh(bodyGeometry, paint);
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  box(car, [1.48, 0.07, 1.32], [-0.16, 0.995, 0], dark);
  box(car, [1.8, 0.07, 1.72], [-0.02, 0.36, 0], dark);
  // Bonnet, rear deck and beltline give the body distinct front/rear silhouettes.
  const bonnet = box(car, [1.3, 0.07, 1.44], [1.3, 0.99, 0], paint, 0.04);
  bonnet.rotation.z = -0.09;
  box(car, [0.82, 0.08, 1.45], [-1.68, 1.04, 0], paint, 0.04);
  for (const side of [-1, 1]) {
    box(car, [1.55, 0.06, 0.09], [-0.12, 1.04, side * 0.79], paint);
    box(car, [0.2, 0.025, 0.035], [-0.48, 0.88, side * 0.895], metal, 0.01);
    const seam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.84, 0.98, side * 0.89), new THREE.Vector3(-0.79, 0.48, side * 0.89),
      new THREE.Vector3(0.57, 0.48, side * 0.89), new THREE.Vector3(0.63, 0.96, side * 0.89),
    ]), new THREE.LineBasicMaterial({ color: '#25272a', transparent: true, opacity: 0.7 }));
    car.add(seam);
    bar(new THREE.Vector3(0.6, 1.01, side * 0.7), new THREE.Vector3(0.22, 1.63, side * 0.65), 0.035, dark);
    box(car, [0.25, 0.12, 0.17], [0.52, 1.16, side * 0.97], paint);
    box(car, [0.035, 0.08, 0.12], [0.39, 1.16, side * 0.97], metal, 0.01);
  }
  bar(new THREE.Vector3(0.22, 1.63, -0.65), new THREE.Vector3(0.22, 1.63, 0.65), 0.035, dark);
  const windshield = new THREE.BufferGeometry();
  windshield.setAttribute('position', new THREE.Float32BufferAttribute([
    0.6, 1.02, -0.7, 0.6, 1.02, 0.7, 0.22, 1.63, 0.65,
    0.6, 1.02, -0.7, 0.22, 1.63, 0.65, 0.22, 1.63, -0.65,
  ], 3));
  windshield.computeVertexNormals();
  car.add(new THREE.Mesh(windshield, glass));
  box(car, [0.18, 0.06, 0.1], [0.28, 1.49, 0], dark);
  box(car, [0.22, 0.12, 1.32], [0.38, 1.09, 0], trim);
  box(car, [1.2, 0.14, 0.16], [-0.12, 1.05, 0], trim);

  for (const side of [-1, 1]) {
    box(car, [0.54, 0.12, 0.51], [-0.37, 1.1, side * 0.38], leather, 0.06);
    const back = box(car, [0.12, 0.48, 0.5], [-0.65, 1.35, side * 0.38], leather, 0.06);
    back.rotation.z = 0.12;
    box(car, [0.13, 0.18, 0.25], [-0.69, 1.65, side * 0.38], leather, 0.05);
    const hoopX = -1.12;
    const hoopBaseY = 1.26;
    const hoopZ = side * 0.38;
    box(car, [0.16, 0.08, 0.44], [hoopX, 1.06, hoopZ], dark);
    for (const legOffset of [-0.16, 0.16]) {
      bar(new THREE.Vector3(hoopX, 1.07, hoopZ + legOffset), new THREE.Vector3(hoopX, hoopBaseY, hoopZ + legOffset), 0.03, metal);
    }
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 24, Math.PI), metal);
    hoop.position.set(hoopX, hoopBaseY, hoopZ);
    hoop.rotation.y = Math.PI / 2;
    car.add(hoop);
  }
  const steering = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.022, 8, 28), dark);
  steering.position.set(0.14, 1.27, 0.37);
  steering.rotation.y = Math.PI / 2;
  steering.rotation.x = 0.25;
  car.add(steering);

  for (const x of [-1.42, 1.4]) for (const side of [-1, 1]) {
    const wheel = new THREE.Group();
    wheel.position.set(x, 0.46, side * 0.87);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.112, 16, 48), dark);
    tire.castShadow = true;
    wheel.add(tire);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.16, 40), dark);
    face.rotation.x = Math.PI / 2;
    wheel.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.021, 8, 48), metal);
    rim.position.z = side * 0.1;
    wheel.add(rim);
    const spokeCount = configuration.wheels === 'forged' ? 10 : configuration.wheels === 'carbon' ? 7 : 5;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spoke = box(wheel, [0.055, 0.26, 0.025], [Math.sin(angle) * 0.13, Math.cos(angle) * 0.13, side * 0.105], metal, 0.01);
      spoke.rotation.z = -angle;
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 20), metal);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = side * 0.13;
    wheel.add(hub);
    const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.025, 32), trim);
    brake.rotation.x = Math.PI / 2;
    brake.position.z = side * 0.075;
    wheel.add(brake);
    box(wheel, [0.065, 0.21, 0.045], [0.17, 0, side * 0.09], red, 0.02);
    car.add(wheel);
  }

  box(car, [0.035, 0.17, 0.82], [2.27, 0.55, 0], dark);
  box(car, [0.04, 0.06, 1.55], [2.27, 0.4, 0], dark);
  for (const side of [-1, 1]) {
    const light = box(car, [0.16, 0.07, 0.35], [2.13, 0.8, side * 0.6], lamp, 0.025);
    light.rotation.z = -0.18;
    box(car, [0.07, 0.1, 0.43], [-2.25, 0.86, side * 0.57], red);
    box(car, [0.04, 0.15, 0.23], [2.22, 0.57, side * 0.65], dark);
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 16, 1, true), metal);
    exhaust.rotation.z = Math.PI / 2;
    exhaust.position.set(-2.24, 0.4, side * 0.57);
    car.add(exhaust);
  }
  box(car, [0.03, 0.12, 0.45], [2.3, 0.58, 0], metal, 0.01);
  box(car, [0.03, 0.1, 0.4], [-2.3, 0.61, 0], metal, 0.01);

  if (configuration.extras.includes('spoiler')) {
    for (const side of [-1, 1]) box(car, [0.1, 0.19, 0.06], [-1.9, 1.16, side * 0.58], dark);
    box(car, [0.32, 0.055, 1.94], [-1.93, 1.28, 0], dark);
  }
  if (configuration.extras.includes('roof')) {
    box(car, [1.18, 0.05, 1.34], [-0.34, 1.7, 0], glass);
    for (const side of [-1, 1]) bar(new THREE.Vector3(-1, 1.04, side * 0.67), new THREE.Vector3(-0.91, 1.69, side * 0.63), 0.04, paint);
    bar(new THREE.Vector3(-0.92, 1.7, -0.65), new THREE.Vector3(-0.92, 1.7, 0.65), 0.04, paint);
  }
  if (configuration.extras.includes('night')) box(car, [0.07, 0.05, 0.08], [2.31, 0.68, 0], dark, 0.01);
  if (configuration.extras.includes('recorder')) box(car, [0.08, 0.08, 0.07], [0.3, 1.43, 0], dark, 0.01);
  return car;
}

export function disposeObject(object: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  object.traverse(child => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
      child.geometry.dispose();
      (Array.isArray(child.material) ? child.material : [child.material]).forEach(material => materials.add(material));
    }
  });
  materials.forEach(material => {
    Object.values(material).forEach(value => {
      if (value instanceof THREE.Texture) textures.add(value);
    });
    material.dispose();
  });
  const bitmaps = new Set<ImageBitmap>();
  textures.forEach(texture => {
    const data = texture.source.data;
    if (typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) bitmaps.add(data);
    texture.dispose();
  });
  bitmaps.forEach(bitmap => bitmap.close());
}
