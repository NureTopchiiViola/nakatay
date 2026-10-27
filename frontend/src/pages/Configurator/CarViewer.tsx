import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Md3dRotation, MdOutlinePhoto, MdFullscreen, MdFullscreenExit, MdRestartAlt } from 'react-icons/md';
import type { Configuration } from './configuration';

const CarScene = lazy(() => import('./CarScene'));

interface CarViewerProps {
  configuration: Configuration;
  cameraView: 'exterior' | 'interior';
  onReset: () => void;
}

export function CarViewer({ configuration, cameraView, onReset }: CarViewerProps) {
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [angle, setAngle] = useState(90);
  const [resetVersion, setResetVersion] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const [modelSource, setModelSource] = useState<'glb' | 'demo'>('glb');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreen = () => setExpanded(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await containerRef.current?.requestFullscreen();
    } catch {
      setFullscreenError('Браузер не дозволив повноекранний режим.');
    }
  }

  return <>
    <div className="configurator-viewer" ref={containerRef}>
    <div className="configurator-viewer-toolbar">
      <div className="configurator-view-modes" role="group" aria-label="Режим перегляду">
        <button type="button" aria-pressed={mode === '3d'} onClick={() => setMode('3d')}><Md3dRotation /> 3D Огляд</button>
        <button type="button" aria-pressed={mode === '2d'} onClick={() => setMode('2d')}><MdOutlinePhoto /> 2D Вигляд</button>
      </div>
      <div className="configurator-viewer-actions">
        <button type="button" className="configurator-fullscreen" onClick={toggleFullscreen} aria-label={expanded ? 'Вийти з повного екрана' : 'На повний екран'}>
          {expanded ? <MdFullscreenExit /> : <MdFullscreen />}
        </button>
        <button type="button" onClick={() => {
          onReset(); setAngle(90); setMode('3d'); setResetVersion(value => value + 1);
        }}><MdRestartAlt /> Скинути</button>
      </div>
    </div>
    <Suspense fallback={<div className="configurator-viewer-loading" role="status">Завантаження 3D-сцени…</div>}>
      <CarScene configuration={configuration} mode={mode} angle={angle} cameraView={cameraView} resetVersion={resetVersion} modelSource={modelSource} />
    </Suspense>
    <span className="configurator-model-note">{modelSource === 'glb' ? 'GLB-модель' : 'Демомодель'} · {cameraView === 'interior' ? 'Інтер’єр' : 'Екстер’єр'}</span>
    <div className="configurator-viewer-bottom">
      <div className="configurator-angles" role="group" aria-label="Ракурс автомобіля">
        <span>Ракурс:</span>
        {[0, 90, 180, 270].map(value => <button type="button" key={value} aria-pressed={angle === value}
          onClick={() => { setAngle(value); setResetVersion(version => version + 1); }}>{value}°</button>)}
      </div>
      <span className="configurator-interaction"><Md3dRotation /> {mode === '3d' ? '360° Взаємодія активна' : 'Фіксований 2D-ракурс'}</span>
    </div>
    <p className="configurator-viewer-hint">{fullscreenError || (mode === '3d' ? 'Перетягніть для обертання · Прокрутіть для наближення' : 'Оберіть ракурс для перегляду')}</p>
    </div>
    <div className="configurator-model-selector" role="group" aria-label="Модель автомобіля">
      <button type="button" aria-pressed={modelSource === 'glb'} onClick={() => setModelSource('glb')}>Ваша модель</button>
      <button type="button" aria-pressed={modelSource === 'demo'} onClick={() => setModelSource('demo')}>Демо з модифікаціями</button>
    </div>
    {modelSource === 'glb' && <p className="configurator-asset-note">У цій моделі змінюється колір кузова. Для перегляду змін дисків, салону та опцій оберіть «Демо з модифікаціями».</p>}
  </>;
}
