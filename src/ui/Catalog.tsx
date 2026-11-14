import { KeyboardControls, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import type { EcctrlHandle } from 'ecctrl'
import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'
import { gameAssets, type GameAsset } from '../game/assets/manifest'
import { AssetGallery } from '../game/assets/AssetGallery'
import { FirstPersonCamera } from '../game/camera/FirstPersonCamera'
import { MARS_GRAVITY } from '../game/Game'
import { keyboardMap } from '../game/player/controls'
import { Player } from '../game/player/Player'
import { Lighting } from '../game/world/Lighting'
import { Sky } from '../game/world/Sky'
import { Terrain } from '../game/world/Terrain'
import { lighting, palette } from '../style/tokens'
import './Catalog.css'

const colors = Object.fromEntries(
  Object.entries(palette).map(([id, value]) => ['--' + id, value]),
) as CSSProperties

type CategoryId = 'all' | 'base' | 'vehicles' | 'power' | 'interior' | 'environment' | 'expedition'

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'base', label: 'Base & Habitat' },
  { id: 'vehicles', label: 'Vehicles & Bots' },
  { id: 'power', label: 'Power & Tech' },
  { id: 'interior', label: 'Station Interior' },
  { id: 'environment', label: 'Environment' },
  { id: 'expedition', label: 'Expedition & Bio' },
]

const CATEGORY_MAP: Record<string, CategoryId> = {
  // Base & Architecture
  'command-base': 'base',
  'hab-module': 'base',
  'greenhouse-dome': 'base',
  'greenhouse-int': 'base',
  'hab-airlock': 'base',
  'storm-shelter-module': 'base',
  'int-door-inner': 'base',
  'int-floor-ceiling': 'base',
  'int-wall-panel': 'base',
  'window-hab': 'base',
  'airlock-interior': 'base',

  // Vehicles & Robotics
  'mars-rover': 'vehicles',
  pebble: 'vehicles',
  'pebble-dock': 'vehicles',
  'pebble-nook': 'vehicles',
  'landing-ship': 'vehicles',
  'landing-ship-cabin': 'vehicles',
  'landing-pad': 'vehicles',
  'landing-scorch': 'vehicles',

  // Power & Systems
  'solar-array-row': 'power',
  'battery-bank': 'power',
  'comms-dish': 'power',
  'cable-junction': 'power',
  'cable-run-straight': 'power',
  'cable-run-bend': 'power',
  'cable-run-t': 'power',
  'climate-dial': 'power',

  // Station Interior & Furniture
  'console-station': 'interior',
  'data-pad': 'interior',
  'lab-bench': 'interior',
  bunk: 'interior',
  'galley-chair': 'interior',
  'crate-supply': 'interior',
  'o2-canister': 'interior',
  'helmet-shelf': 'interior',
  'astronaut-suit-rack': 'interior',

  // Environment & Rocks
  'rock-boulders': 'environment',
  'rock-cluster': 'environment',
  'rock-pebbles': 'environment',
  'mesa-cliff-overhang': 'environment',
  'mesa-distant': 'environment',
  'ridge-horizon': 'environment',
  'sky-mars-orbit': 'environment',

  // Expedition & Biology
  'young-astronaut': 'expedition',
  'flag-plaque': 'expedition',
  'greenhouse-tray': 'expedition',
  'growth-pillow': 'expedition',
  'regolith-scoop': 'expedition',
  'seed-packet-mizuna': 'expedition',
  'seed-packet-wheat': 'expedition',
}

function formatName(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function ModelStage({
  asset,
  wireframe,
  onBoundsComputed,
}: {
  asset: GameAsset
  wireframe: boolean
  onBoundsComputed: (center: THREE.Vector3, size: THREE.Vector3) => void
}) {
  const { scene, animations } = useGLTF(asset.file)

  const { clone, center, size } = useMemo(() => {
    const c = scene.clone(true)
    const box = new THREE.Box3().setFromObject(c)
    const bCenter = box.getCenter(new THREE.Vector3())
    const bSize = box.getSize(new THREE.Vector3())
    c.position.set(-bCenter.x, -box.min.y, -bCenter.z)
    return { clone: c, center: bCenter, size: bSize }
  }, [scene])

  useEffect(() => {
    onBoundsComputed(center, size)
  }, [center, size, onBoundsComputed])

  useEffect(() => {
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
        if (Array.isArray(o.material)) {
          o.material.forEach((m) => {
            m.wireframe = wireframe
          })
        } else if (o.material) {
          o.material.wireframe = wireframe
        }
      }
    })
  }, [clone, wireframe])

  const mixer = useMemo(() => new THREE.AnimationMixer(clone), [clone])
  useFrame((_, delta) => {
    mixer.update(delta)
  })

  useEffect(() => {
    if (!animations.length) return
    const clip = animations.find((c) => c.name === 'Friendly_Wave') || animations[0]
    if (clip) {
      const action = mixer.clipAction(clip)
      action.reset().play()
      return () => {
        mixer.stopAllAction()
        mixer.uncacheRoot(clone)
      }
    }
  }, [animations, clone, mixer])

  return (
    <group>
      <primitive object={clone} />
      {/* Subtle pedestal grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[Math.max(size.x, size.z) * 1.2 + 1, 48]} />
        <meshStandardMaterial
          color={palette['space-deep']}
          roughness={0.8}
          metalness={0.1}
          opacity={0.6}
          transparent
        />
      </mesh>
    </group>
  )
}

function TestGroundsWorld({ onExit }: { onExit: () => void }) {
  const player = useRef<EcctrlHandle>(null)

  return (
    <div className="catalog-test-grounds">
      <div className="catalog-test-grounds-overlay">
        <span>Mars Test Grounds · First-person exploration</span>
        <button className="catalog-back-btn" onClick={onExit}>
          Exit Test Grounds
        </button>
      </div>

      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ fov: 75, near: 0.05, far: 2000, position: [0, 2, 8] }}
          gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: lighting.exposure }}
        >
          <Sky />
          <Lighting />
          <Suspense fallback={null}>
            <Physics gravity={[0, MARS_GRAVITY, 0]}>
              <Terrain />
              <AssetGallery />
              <Player handle={player} />
            </Physics>
          </Suspense>
          <FirstPersonCamera target={player} />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}

export function Catalog({ onBack }: { onBack: () => void }) {
  const [selectedId, setSelectedId] = useState<string>(gameAssets[0]?.id || '')
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [search, setSearch] = useState('')
  const [wireframe, setWireframe] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [viewMode, setViewMode] = useState<'turntable' | 'test-grounds'>('turntable')
  const [modelBounds, setModelBounds] = useState({
    center: new THREE.Vector3(0, 0, 0),
    size: new THREE.Vector3(2, 2, 2),
  })

  const selectedAsset = useMemo(
    () => gameAssets.find((a) => a.id === selectedId) || gameAssets[0],
    [selectedId],
  )

  const filteredAssets = useMemo(() => {
    return gameAssets.filter((asset) => {
      const cat = CATEGORY_MAP[asset.id] || 'base'
      const matchesCat = activeCategory === 'all' || cat === activeCategory
      const query = search.trim().toLowerCase()
      const matchesSearch = !query || asset.name.toLowerCase().includes(query) || asset.id.toLowerCase().includes(query)
      return matchesCat && matchesSearch
    })
  }, [activeCategory, search])

  const maxDim = Math.max(modelBounds.size.x, modelBounds.size.y, modelBounds.size.z) || 2
  const cameraDistance = Math.max(2.5, maxDim * 1.8)

  return (
    <div className="catalog-container" style={colors}>
      <header className="catalog-header">
        <div className="catalog-header-left">
          <button className="catalog-back-btn" onClick={onBack} aria-label="Return to Main Menu">
            ← Main Menu
          </button>
          <div>
            <h1 className="catalog-header-title">
              Mars Asset Catalog
              <span className="catalog-header-sub">50 Procedural Kiln Assets</span>
            </h1>
          </div>
        </div>

        <div className="catalog-view-modes">
          <button
            className={`catalog-view-btn ${viewMode === 'turntable' ? 'active' : ''}`}
            onClick={() => setViewMode('turntable')}
          >
            3D Turntable
          </button>
          <button
            className={`catalog-view-btn ${viewMode === 'test-grounds' ? 'active' : ''}`}
            onClick={() => setViewMode('test-grounds')}
          >
            Walk Test Grounds
          </button>
        </div>
      </header>
      <div className="catalog-body">
        {viewMode === 'test-grounds' ? (
          <TestGroundsWorld onExit={() => setViewMode('turntable')} />
        ) : (
          <>
            {/* Sidebar */}
            <aside className="catalog-sidebar">
          <div className="catalog-search-bar">
            <input
              placeholder="Search assets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <nav className="catalog-categories" aria-label="Asset categories">
            {CATEGORIES.map((cat) => {
              const count =
                cat.id === 'all'
                  ? gameAssets.length
                  : gameAssets.filter((a) => (CATEGORY_MAP[a.id] || 'base') === cat.id).length
              return (
                <button
                  key={cat.id}
                  className={`catalog-category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </nav>

          <div className="catalog-asset-list">
            {filteredAssets.map((asset) => {
              const isSelected = asset.id === selectedAsset.id
              return (
                <button
                  key={asset.id}
                  className={`catalog-asset-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedId(asset.id)}
                >
                  <span className="catalog-asset-card-title">{formatName(asset.id)}</span>
                  <div className="catalog-asset-card-meta">
                    <span>{asset.stats.triangles.toLocaleString()} △</span>
                    <span>{(asset.stats.bytes / 1024).toFixed(0)} KB</span>
                    <span>{CATEGORY_MAP[asset.id] || 'base'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* 3D Viewport */}
        <main className="catalog-viewport-container">
          <div className="catalog-viewport-controls">
            <button
              className={`catalog-control-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}
            </button>
            <button
              className={`catalog-control-btn ${wireframe ? 'active' : ''}`}
              onClick={() => setWireframe(!wireframe)}
            >
              {wireframe ? 'Wireframe ON' : 'Wireframe OFF'}
            </button>
          </div>

          <div className="catalog-canvas-wrap">
            <Canvas
              shadows
              dpr={[1, 2]}
              camera={{
                fov: 50,
                near: 0.05,
                far: 1000,
                position: [cameraDistance * 0.9, cameraDistance * 0.6, cameraDistance * 0.9],
              }}
              gl={{
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: lighting.exposure,
              }}
            >
              <ambientLight intensity={0.7} color={palette['structure-white']} />
              <directionalLight
                position={[10, 20, 15]}
                intensity={1.8}
                color={palette['accent-orange']}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight
                position={[-10, 5, -10]}
                intensity={0.5}
                color={palette['accent-cyan']}
              />

              <Suspense fallback={null}>
                <ModelStage
                  key={selectedAsset.id}
                  asset={selectedAsset}
                  wireframe={wireframe}
                  onBoundsComputed={(c, s) => setModelBounds({ center: c, size: s })}
                />
              </Suspense>

              <OrbitControls
                makeDefault
                autoRotate={autoRotate}
                autoRotateSpeed={1.5}
                target={[0, modelBounds.size.y * 0.45, 0]}
                minDistance={0.5}
                maxDistance={cameraDistance * 4}
              />
            </Canvas>
          </div>

          {/* Details Overlay */}
          <section className="catalog-details-panel">
            <div className="catalog-details-header">
              <h2 className="catalog-details-title">{formatName(selectedAsset.id)}</h2>
              <span className="catalog-details-id">{selectedAsset.id}</span>
            </div>

            <div className="catalog-details-grid">
              <div className="catalog-details-stat">
                <span className="catalog-details-stat-label">Triangles</span>
                <span className="catalog-details-stat-val">
                  {selectedAsset.stats.triangles.toLocaleString()} △
                </span>
              </div>
              <div className="catalog-details-stat">
                <span className="catalog-details-stat-label">Compressed Size</span>
                <span className="catalog-details-stat-val">
                  {(selectedAsset.stats.bytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="catalog-details-stat">
                <span className="catalog-details-stat-label">Raw Size</span>
                <span className="catalog-details-stat-val">
                  {(selectedAsset.stats.rawBytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="catalog-details-stat">
                <span className="catalog-details-stat-label">Collider</span>
                <span className="catalog-details-stat-val">
                  {selectedAsset.placement.collider || 'hull'}
                </span>
              </div>
            </div>

            <div className="catalog-materials-list">
              {selectedAsset.stats.materials.map((mat, i) => (
                <span key={i} className="catalog-material-tag">
                  {mat}
                </span>
              ))}
            </div>
          </section>
        </main>
        </>
      )}
      </div>
    </div>
  )
}
