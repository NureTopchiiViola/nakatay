import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getSelections } from './configuration';
import type { Configuration } from './configuration';
import { createBmwRim, prepareBmwHeadlights, removeDetachedBmwMirror } from './bmwCustomization';
import { createBmwCabin, createBmwInstrumentTexture } from './bmwCabin';
import { createBmwEquipment, createNightVisionTexture } from './bmwEquipment';

export const CAR_MODEL_URL = `${import.meta.env.BASE_URL}models/bmw-e46-328i-sport.glb`;

export async function loadCarModel(signal: AbortSignal) {
  const response = await fetch(CAR_MODEL_URL, { signal });
  if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
  const data = await response.arrayBuffer();
  signal.throwIfAborted();
  const gltf = await new GLTFLoader().parseAsync(data, '');
  const root = new THREE.Group();
  root.add(gltf.scene);
  root.rotation.y = Math.PI / 2;
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 4.6 / Math.max(size.x, size.z);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  bounds.setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  root.position.set(-center.x, -bounds.min.y, -center.z);

  const paintMaterials = new Set<THREE.MeshStandardMaterial>();
  const stockRims: THREE.Mesh[] = [];
  const tyres: THREE.Mesh[] = [];
  let refinedCabin: ReturnType<typeof createBmwCabin> | undefined;
  let interiorMesh: THREE.Mesh | undefined;
  let headlights: ReturnType<typeof prepareBmwHeadlights> | undefined;
  let equipment: ReturnType<typeof createBmwEquipment> | undefined;
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(material => {
      if (material instanceof THREE.MeshStandardMaterial && material.name === 'BMWphong2SG1') {
        paintMaterials.add(material);
      }
      if (/^BMWw[1-4](?:_|polySurface)/.test(object.name)) {
        if (material.name === 'BMWphong14SG1') tyres.push(object);
        if (['BMWphong17SG1', 'BMWphong15SG1', 'BMWphong1SG1'].includes(material.name)) stockRims.push(object);
      }
    });
    if (object.name.includes('TrafficInterior_Max')) {
      interiorMesh = object;
    }
    if (object.name.includes('TrafficGlassOpaque_Mirror_Max')) removeDetachedBmwMirror(object);
    if (object.name.includes('TrafficLight_Max')) headlights = prepareBmwHeadlights(object);
  });
  if (interiorMesh) {
    refinedCabin = createBmwCabin(createBmwInstrumentTexture());
    interiorMesh.parent?.add(refinedCabin.group);
    equipment = createBmwEquipment(createNightVisionTexture());
    interiorMesh.parent?.add(equipment.group);
    interiorMesh.visible = false;
  }

  const car = new THREE.Group();
  car.add(root);
  car.updateMatrixWorld(true);
  const replacements = { forged: new THREE.Group(), carbon: new THREE.Group() };
  for (const tyre of tyres) {
    const bounds = new THREE.Box3().setFromObject(tyre);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const side = Math.sign(center.z);
    for (const variant of ['forged', 'carbon'] as const) {
      const radius = size.y / 2 * 0.73 * (variant === 'forged' ? 20 / 19 : 21 / 19);
      const rim = createBmwRim(radius, size.z * 0.65, variant);
      rim.position.set(center.x, center.y, side > 0 ? bounds.max.z : bounds.min.z);
      rim.rotation.y = side > 0 ? 0 : Math.PI;
      replacements[variant].add(rim);
    }
  }
  car.add(replacements.forged, replacements.carbon);

  return {
    root: car,
    setConfiguration(configuration: Configuration) {
      const selected = getSelections(configuration);
      paintMaterials.forEach(material => material.color.set(selected.paint.color));
      stockRims.forEach(rim => { rim.visible = configuration.wheels === 'alloy'; });
      replacements.forged.visible = configuration.wheels === 'forged';
      replacements.carbon.visible = configuration.wheels === 'carbon';
      refinedCabin?.setConfiguration(selected.interior.color, configuration.decor);
      headlights?.setEnabled(configuration.extras.includes('matrix'));
      equipment?.setConfiguration(configuration);
    },
  };
}
