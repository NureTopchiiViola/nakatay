import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { createBmwRim, prepareBmwHeadlights, removeDetachedBmwMirror } from '../src/pages/Configurator/bmwCustomization.ts';
import { createBmwCabin } from '../src/pages/Configurator/bmwCabin.ts';
import { createBmwEquipment } from '../src/pages/Configurator/bmwEquipment.ts';
import { DEFAULT_CONFIGURATION } from '../src/pages/Configurator/configuration.ts';

test('replacement rim variants fit the tyre radius and use different spoke geometry', () => {
  const forged = createBmwRim(0.28, 0.16, 'forged');
  const carbon = createBmwRim(0.28, 0.16, 'carbon');
  for (const rim of [forged, carbon]) {
    const bounds = new THREE.Box3().setFromObject(rim);
    const center = bounds.getCenter(new THREE.Vector3());
    assert.ok(Math.abs(center.x) < 1e-6 && Math.abs(center.y) < 1e-6);
    assert.ok(Math.abs(bounds.max.x - 0.28) < 1e-6);
    assert.ok(Math.abs(bounds.min.x + 0.28) < 1e-6);
    assert.ok(bounds.min.z >= -0.17 && bounds.max.z <= 0.04);
    rim.traverse(object => { if (object.isMesh) assert.equal(object.castShadow, true); });
  }
  assert.notEqual(forged.children.length, carbon.children.length);
});

test('refined cabin fits inside the BMW body and includes dashboard controls and four seats', () => {
  const cabin = createBmwCabin(new THREE.Texture());
  const bounds = new THREE.Box3().setFromObject(cabin.group);
  assert.ok(bounds.min.x > -0.8 && bounds.max.x < 0.8);
  assert.ok(bounds.min.y > 0 && bounds.max.y < 1.21);
  assert.ok(bounds.min.z > -1.8 && bounds.max.z < 1.1);
  for (const name of ['dashboard-body', 'instrument-display', 'center-stack', 'gear-selector', 'refined-steering-wheel', 'glovebox']) {
    assert.ok(cabin.group.getObjectByName(name), name);
  }
  assert.equal(cabin.group.children.filter(object => object.name === 'seat-back').length, 2);
  assert.equal(cabin.group.children.filter(object => object.name === 'rear-headrest').length, 2);
  assert.equal(cabin.group.children.filter(object => object.name === 'headrest-post').length, 4);
});

test('upholstery and trim changes preserve instrument texture and control colours', () => {
  const instruments = new THREE.Texture();
  const cabin = createBmwCabin(instruments);
  const seat = cabin.group.getObjectByName('seat-cushion');
  const trim = cabin.group.getObjectByName('dashboard-trim');
  const controls = cabin.group.getObjectByName('radio-face');
  const originalControls = controls.material.color.getHexString();
  for (const color of ['#e8e3d7', '#a5632f', '#242424']) {
    cabin.setConfiguration(color, 'wood');
    assert.equal(seat.material.color.getHexString(), color.slice(1));
    assert.equal(trim.material.color.getHexString(), '805033');
    assert.equal(controls.material.color.getHexString(), originalControls);
    assert.equal(cabin.group.getObjectByName('instrument-display').material.map, instruments);
  }
  cabin.setConfiguration('#242424', 'carbon');
  assert.equal(trim.material.color.getHexString(), '343a3d');
});

test('cabin has no ceiling slab and dashboard stays behind the windshield clearance plane', () => {
  const cabin = createBmwCabin(new THREE.Texture());
  assert.equal(cabin.group.getObjectByName('headliner'), undefined);
  cabin.group.updateMatrixWorld(true);
  const point = new THREE.Vector3();
  for (const name of ['dashboard-body', 'dashboard-top']) {
    const part = cabin.group.getObjectByName(name);
    const positions = part.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(part.matrixWorld);
      assert.ok(Math.abs(point.x) < 0.72, `${name} must fit between the windshield pillars`);
      assert.ok(point.z + 1.44 * point.y < 1.96, `${name} must remain inside the windshield`);
    }
  }
});

test('LED option isolates the actual BMW front lamps and leaves the rear light material unchanged', () => {
  const bytes = readFileSync(new URL('../public/models/bmw-e46-328i-sport.glb', import.meta.url));
  const jsonLength = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const start = 28 + jsonLength;
  const primitive = gltf.meshes.find(mesh => mesh.name.includes('TrafficLight_Max')).primitives[0];
  const positions = gltf.accessors[primitive.attributes.POSITION];
  const positionView = gltf.bufferViews[positions.bufferView];
  const values = new Float32Array(positions.count * 3);
  for (let i = 0; i < positions.count; i++) {
    for (let axis = 0; axis < 3; axis++) values[i * 3 + axis] = bytes.readFloatLE(start + (positionView.byteOffset ?? 0) + (positions.byteOffset ?? 0) + i * (positionView.byteStride ?? 12) + axis * 4);
  }
  const indices = gltf.accessors[primitive.indices];
  const indexView = gltf.bufferViews[indices.bufferView];
  const index = Array.from({ length: indices.count }, (_, i) => bytes.readUInt32LE(start + (indexView.byteOffset ?? 0) + (indices.byteOffset ?? 0) + i * 4));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(values, 3));
  geometry.setIndex(index);
  const original = new THREE.MeshStandardMaterial({ map: new THREE.Texture() });
  const mesh = new THREE.Mesh(geometry, original);
  const lights = prepareBmwHeadlights(mesh);
  assert.equal(geometry.index.count, index.length);
  assert.equal(geometry.groups.reduce((sum, group) => sum + group.count, 0), index.length);
  const front = geometry.groups[1];
  assert.ok(front.count > 0 && front.count < index.length);
  for (let i = front.start; i < front.start + front.count; i++) {
    assert.ok(values[geometry.index.getX(i) * 3 + 2] > 1.4, 'Rear lamp vertices must not use the LED material');
  }
  assert.equal(mesh.material[0], original);
  assert.equal(mesh.material[1].emissiveIntensity, 0);
  lights.setEnabled(true);
  assert.equal(mesh.material[1].emissiveIntensity, 2.4);
  assert.equal(original.emissive.getHexString(), '000000');
  lights.setEnabled(false);
  assert.equal(mesh.material[1].emissiveIntensity, 0);
});

test('equipment options toggle independently while the mirror stays attached', () => {
  const equipment = createBmwEquipment(new THREE.Texture());
  const night = equipment.group.getObjectByName('night-vision-equipment');
  const recorder = equipment.group.getObjectByName('recorder-equipment');
  const mirror = equipment.group.getObjectByName('rear-view-mirror');
  assert.equal(night.visible, false);
  assert.equal(recorder.visible, false);
  equipment.setConfiguration({ ...DEFAULT_CONFIGURATION, extras: ['night'] });
  assert.equal(night.visible, true);
  assert.equal(recorder.visible, false);
  equipment.setConfiguration({ ...DEFAULT_CONFIGURATION, extras: ['recorder'] });
  assert.equal(night.visible, false);
  assert.equal(recorder.visible, true);
  equipment.setConfiguration(DEFAULT_CONFIGURATION);
  assert.equal(recorder.visible, false);
  assert.equal(mirror.visible, true);
  assert.ok(equipment.group.getObjectByName('night-preview'));
  assert.ok(equipment.group.getObjectByName('front-recorder'));
  assert.ok(equipment.group.getObjectByName('rear-recorder'));
  equipment.group.updateMatrixWorld(true);
  const arm = new THREE.Box3().setFromObject(equipment.group.getObjectByName('mirror-arm'));
  assert.ok(arm.intersectsBox(new THREE.Box3().setFromObject(mirror)));
  assert.ok(arm.intersectsBox(new THREE.Box3().setFromObject(equipment.group.getObjectByName('mirror-windshield-mount'))));
});

test('removing the detached original mirror preserves windshield and rear window triangles', () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.1, 1.04, 0.25, 0.1, 1.04, 0.25, 0, 1.1, 0.3,
    -0.6, 0.8, 0.9, 0.6, 0.8, 0.9, 0, 1.17, 0.28,
    -0.5, 0.8, -1.5, 0.5, 0.8, -1.5, 0, 1.1, -1,
  ], 3));
  geometry.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  removeDetachedBmwMirror(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()));
  assert.deepEqual([...geometry.index.array], [3, 4, 5, 6, 7, 8]);
});
