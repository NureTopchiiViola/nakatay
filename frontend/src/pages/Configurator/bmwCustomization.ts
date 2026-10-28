import * as THREE from 'three';

export function createBmwRim(radius: number, depth: number, variant: 'forged' | 'carbon') {
  const group = new THREE.Group();
  group.name = `bmw-rim-${variant}`;
  const finish = new THREE.MeshStandardMaterial({ color: variant === 'forged' ? '#bdc1c5' : '#34383d', metalness: 0.85, roughness: variant === 'forged' ? 0.22 : 0.45 });
  const hubFinish = new THREE.MeshStandardMaterial({ color: '#202428', metalness: 0.6, roughness: 0.35 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 48, 1, true), finish);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = -depth / 2;
  group.add(barrel);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(radius - 0.014, 0.014, 8, 48), finish);
  group.add(lip);
  const count = variant === 'forged' ? 10 : 7;
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(radius * (variant === 'forged' ? 0.09 : 0.23), radius * 0.8, depth * 0.22), finish);
    spoke.position.set(Math.sin(angle) * radius * 0.48, Math.cos(angle) * radius * 0.48, -0.012);
    spoke.rotation.z = -angle + (variant === 'carbon' ? 0.18 : 0);
    group.add(spoke);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, depth * 0.25, 24), hubFinish);
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.005;
  group.add(hub);
  for (let i = 0; i < 5; i++) {
    const angle = i / 5 * Math.PI * 2;
    const bolt = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.023, 8, 6), finish);
    bolt.position.set(Math.sin(angle) * radius * 0.135, Math.cos(angle) * radius * 0.135, depth * 0.16);
    group.add(bolt);
  }
  group.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } });
  return group;
}

export function prepareBmwHeadlights(mesh: THREE.Mesh) {
  const original = mesh.material;
  const geometry = mesh.geometry;
  const positions = geometry.getAttribute('position');
  const indices = geometry.getIndex();
  if (!(original instanceof THREE.MeshStandardMaterial) || !indices) throw new Error('BMW light geometry is unavailable');
  const headlights: number[] = [];
  const otherLights: number[] = [];
  for (let i = 0; i < indices.count; i += 3) {
    const triangle = [indices.getX(i), indices.getX(i + 1), indices.getX(i + 2)];
    const x = triangle.reduce((sum, vertex) => sum + positions.getX(vertex), 0) / 3;
    const y = triangle.reduce((sum, vertex) => sum + positions.getY(vertex), 0) / 3;
    const z = triangle.reduce((sum, vertex) => sum + positions.getZ(vertex), 0) / 3;
    const isHeadlight = z > 1.85 && y > 0.38 && y < 0.73 && Math.abs(x) > 0.25 && Math.abs(x) < 0.73;
    (isHeadlight ? headlights : otherLights).push(...triangle);
  }
  geometry.setIndex([...otherLights, ...headlights]);
  geometry.clearGroups();
  geometry.addGroup(0, otherLights.length, 0);
  geometry.addGroup(otherLights.length, headlights.length, 1);
  const led = original.clone();
  led.name = 'bmw-matrix-led';
  led.emissive.set('#b9ddff');
  led.emissiveMap = original.map;
  led.emissiveIntensity = 0;
  mesh.material = [original, led];
  return { setEnabled(enabled: boolean) { led.emissiveIntensity = enabled ? 2.4 : 0; } };
}

export function removeDetachedBmwMirror(mesh: THREE.Mesh) {
  const geometry = mesh.geometry;
  const positions = geometry.getAttribute('position');
  const index = geometry.getIndex();
  if (!index) return;
  const kept: number[] = [];
  for (let i = 0; i < index.count; i += 3) {
    const triangle = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
    const mirror = triangle.every(vertex => Math.abs(positions.getX(vertex)) < 0.19
      && positions.getY(vertex) > 1 && positions.getY(vertex) < 1.135
      && positions.getZ(vertex) > 0.18 && positions.getZ(vertex) < 0.4);
    if (!mirror) kept.push(...triangle);
  }
  geometry.setIndex(kept);
}

