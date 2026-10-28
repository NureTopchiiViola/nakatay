import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCar, disposeObject } from './buildCar';
import { loadCarModel } from './loadCarModel';
import type { Configuration } from './configuration';

interface SceneProps {
  configuration: Configuration;
  mode: '3d' | '2d';
  angle: number;
  cameraView: 'exterior' | 'interior';
  resetVersion: number;
  modelSource: 'glb' | 'demo';
}

export default function CarScene({ configuration, mode, angle, cameraView, resetVersion, modelSource }: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const configurationRef = useRef(configuration);
  const importedModel = useRef<Awaited<ReturnType<typeof loadCarModel>> | null>(null);
  const runtime = useRef<{
    scene: THREE.Scene;
    car: THREE.Group;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    perspective: THREE.PerspectiveCamera;
    orthographic: THREE.OrthographicCamera;
    controls: OrbitControls;
    renderer: THREE.WebGLRenderer;
    interiorLight: THREE.PointLight;
    draw: () => void;
  } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // Report initialization failure from the external WebGL renderer.
      // oxlint-disable-next-line react/set-state-in-effect
      setError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-label', 'Модель автомобіля. Перетягніть або використайте стрілки для обертання. Прокрутка чи клавіші плюс і мінус змінюють наближення.');
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.tabIndex = 0;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTarget = pmrem.fromScene(environment, 0.04);
    scene.environment = environmentTarget.texture;
    environment.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xe7ecf0, 0x55504a, 1.2));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(3, 6, 4);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.left = -4;
    light.shadow.camera.right = 4;
    light.shadow.camera.top = 4;
    light.shadow.camera.bottom = -4;
    light.shadow.normalBias = 0.025;
    scene.add(light);
    const interiorLight = new THREE.PointLight(0xfff0db, 1.2, 3, 2);
    interiorLight.position.set(-0.2, 1.25, 0.1);
    interiorLight.visible = false;
    scene.add(interiorLight);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.26 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    const perspective = new THREE.PerspectiveCamera(35, 1, 0.05, 60);
    const orthographic = new THREE.OrthographicCamera(-3.2, 3.2, 3.2, -3.2, 0.05, 60);
    perspective.position.set(0, 2.2, 7.5);
    const controls = new OrbitControls(perspective, renderer.domElement);
    controls.target.set(0, 0.8, 0);
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 11;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    // Render on interaction rather than keeping a permanent animation loop.
    const draw = () => { if (runtime.current) renderer.render(scene, runtime.current.camera); };
    const car = new THREE.Group();
    scene.add(car);
    runtime.current = { scene, car, camera: perspective, perspective, orthographic, controls, renderer, interiorLight, draw };
    controls.addEventListener('change', draw);
    const handleKeyDown = (event: KeyboardEvent) => {
      const state = runtime.current;
      if (!state || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(event.key)) return;
      event.preventDefault();
      const offset = state.camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      if (controls.enableRotate) {
        if (event.key === 'ArrowLeft') spherical.theta -= 0.15;
        if (event.key === 'ArrowRight') spherical.theta += 0.15;
        if (event.key === 'ArrowUp') spherical.phi -= 0.1;
        if (event.key === 'ArrowDown') spherical.phi += 0.1;
        spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.08, controls.maxPolarAngle);
      }
      const zoomFactor = event.key === '-' ? 1.1 : event.key === '+' || event.key === '=' ? 0.9 : 1;
      if (state.camera instanceof THREE.OrthographicCamera) {
        state.camera.zoom = THREE.MathUtils.clamp(state.camera.zoom / zoomFactor, 0.65, 3);
        state.camera.updateProjectionMatrix();
      } else spherical.radius = THREE.MathUtils.clamp(spherical.radius * zoomFactor, controls.minDistance, controls.maxDistance);
      state.camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
      controls.update();
      draw();
    };
    renderer.domElement.addEventListener('keydown', handleKeyDown);
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      perspective.aspect = width / height;
      perspective.updateProjectionMatrix();
      const halfWidth = 2.95;
      orthographic.left = -halfWidth;
      orthographic.right = halfWidth;
      orthographic.top = halfWidth * height / width;
      orthographic.bottom = -orthographic.top;
      orthographic.updateProjectionMatrix();
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const onContextLost = (event: Event) => { event.preventDefault(); setError(true); };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    resize();
    return () => {
      observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('keydown', handleKeyDown);
      controls.removeEventListener('change', draw);
      controls.dispose();
      disposeObject(scene);
      light.shadow.dispose();
      environmentTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      runtime.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    configurationRef.current = configuration;
    const state = runtime.current;
    if (!state) return;
    if (modelSource === 'glb') {
      importedModel.current?.setConfiguration(configuration);
    } else {
      const previousCar = state.car;
      state.car = buildCar(configuration);
      state.scene.remove(previousCar);
      disposeObject(previousCar);
      state.scene.add(state.car);
    }
    state.draw();
  }, [configuration, modelSource]);

  useEffect(() => {
    const state = runtime.current;
    if (!state) return;
    const controller = new AbortController();
    let cancelled = false;
    importedModel.current = null;
    state.renderer.toneMappingExposure = modelSource === 'glb' ? 0.8 : 1;
    const previousCar = state.car;
    state.scene.remove(previousCar);
    disposeObject(previousCar);
    state.car = new THREE.Group();
    state.scene.add(state.car);
    state.draw();
    if (modelSource === 'demo') {
      state.scene.remove(state.car);
      state.car = buildCar(configurationRef.current);
      state.scene.add(state.car);
      state.draw();
      return;
    }
    // Loading status belongs to this asynchronous external asset request.
    // oxlint-disable-next-line react/set-state-in-effect
    setModelStatus('loading');
    loadCarModel(controller.signal).then(model => {
      if (cancelled) { disposeObject(model.root); return; }
      importedModel.current = model;
      model.setConfiguration(configurationRef.current);
      state.scene.remove(state.car);
      state.car = model.root;
      state.scene.add(state.car);
      state.draw();
      setModelStatus('ready');
    }).catch(() => { if (!cancelled) setModelStatus('error'); });
    return () => { cancelled = true; controller.abort(); importedModel.current = null; };
  }, [modelSource, attempt]);

  useEffect(() => {
    const state = runtime.current;
    if (!state) return;
    const isInterior = cameraView === 'interior';
    const isBmwInterior = isInterior && modelSource === 'glb';
    state.interiorLight.visible = isBmwInterior;
    const radians = angle * Math.PI / 180;
    state.camera = mode === '3d' ? state.perspective : state.orthographic;
    state.perspective.fov = isBmwInterior ? 65 : 35;
    state.perspective.updateProjectionMatrix();
    state.controls.object = state.camera;
    state.controls.enableRotate = mode === '3d';
    state.controls.minDistance = isBmwInterior ? 0.15 : isInterior ? 1 : 2.8;
    state.controls.maxDistance = isBmwInterior ? 2 : isInterior ? 4 : 11;
    state.controls.target.set(isBmwInterior ? 0.35 : isInterior ? -0.15 : 0, isBmwInterior ? 0.83 : isInterior ? 1.15 : 0.8, 0);
    if (isBmwInterior) {
      state.camera.position.set(-0.35 + Math.cos(radians) * 0.15, 1.16, Math.sin(radians) * 0.25);
    } else if (isInterior) {
      state.camera.position.set(-0.15 + Math.cos(radians + Math.PI / 6) * 2.5, 3.5, Math.sin(radians + Math.PI / 6) * 2.5);
    } else {
      state.camera.position.set(Math.cos(radians) * 10, mode === '2d' ? 0.82 : 2.5, Math.sin(radians) * 10);
    }
    state.orthographic.zoom = isBmwInterior ? 4 : isInterior ? 1.8 : 1;
    state.orthographic.updateProjectionMatrix();
    state.controls.update();
    state.draw();
  }, [mode, angle, cameraView, resetVersion, attempt, modelSource]);

  return <>
    <div className="configurator-canvas" ref={containerRef} data-model-state={error ? 'error' : modelSource === 'demo' ? 'ready' : modelStatus} />
    {!error && modelSource === 'glb' && modelStatus === 'loading' && <div className="configurator-viewer-loading" role="status">Завантаження моделі автомобіля…</div>}
    {!error && modelSource === 'glb' && modelStatus === 'error' && <div className="configurator-viewer-error" role="alert">
      <strong>Не вдалося завантажити модель</strong>
      <p>Перевірте з’єднання або перейдіть до демомоделі.</p>
      <button type="button" onClick={() => setAttempt(value => value + 1)}>Спробувати ще раз</button>
    </div>}
    {error && <div className="configurator-viewer-error" role="alert">
      <strong>Не вдалося відкрити 3D-сцену</strong>
      <p>Перевірте підтримку WebGL у браузері та апаратне прискорення.</p>
      <button type="button" onClick={() => { setError(false); setAttempt(value => value + 1); }}>Спробувати ще раз</button>
    </div>}
  </>;
}
