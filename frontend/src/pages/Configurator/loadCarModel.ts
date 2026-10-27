import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getSelections } from './configuration';
import type { Configuration } from './configuration';

export const CAR_MODEL_URL = `${import.meta.env.BASE_URL}models/horizon-pbr.glb`;

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

  const paintColor = { value: new THREE.Color() };
  const paintBlend = { value: 0 };
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(material => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      // The generated asset is one mesh with a baked texture atlas. Recolor only
      // strongly red texels; tinting the whole material would also paint the tyres.
      material.onBeforeCompile = shader => {
        shader.uniforms.configurationPaintColor = paintColor;
        shader.uniforms.configurationPaintBlend = paintBlend;
        shader.fragmentShader = `uniform vec3 configurationPaintColor;\nuniform float configurationPaintBlend;\n${shader.fragmentShader}`;
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #include <map_fragment>
          float redDominance = diffuseColor.r - max(diffuseColor.g, diffuseColor.b);
          float paintMask = smoothstep(0.045, 0.16, redDominance);
          vec3 recoloredPaint = configurationPaintColor * (diffuseColor.r / 0.75);
          diffuseColor.rgb = mix(diffuseColor.rgb, recoloredPaint, paintMask * configurationPaintBlend);
        `);
      };
      material.customProgramCacheKey = () => 'horizon-atlas-paint-v1';
    });
  });

  return {
    root,
    setConfiguration(configuration: Configuration) {
      paintColor.value.set(getSelections(configuration).paint.color);
      // Retain the original red texture for the default colour.
      paintBlend.value = configuration.paint === 'crimson' ? 0 : 1;
    },
  };
}
