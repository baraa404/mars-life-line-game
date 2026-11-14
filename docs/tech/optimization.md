# Asset optimization: glTF Transform 4.5

Used by `scripts/asset-pipeline.mjs` (`optimize()`), via `@gltf-transform/core`,
`/extensions`, `/functions` and the `meshoptimizer` encoder. The CLI is also installed.

## Transform chain

| Step | Why |
| --- | --- |
| `dedup()` | Merge identical accessors, materials, meshes |
| `instance({ min: 2 })` | Repeated meshes → `EXT_mesh_gpu_instancing` |
| `weld()` | Merge bitwise-identical vertices only (v4 behaviour), so faceted normals survive |
| `prune()` | Drop unused nodes, accessors, materials |
| `meshopt({ level: 'medium' })` | Quantize + `EXT_meshopt_compression` |

Deliberately **not** used: `flatten()`, `join()`, `simplify()`. They rename/merge nodes or
change silhouettes. If draw calls become a problem, prefer Kiln's own runtime export
(`kiln export ... --profile runtime --target three --draws minimal`) and measure first.

## Commands

```sh
npm run asset:optimize -- in.glb out.glb     # one file, prints sizes/triangles/materials
npm run asset:inspect -- public/models/x.glb # gltf-transform inspect: meshes, materials, sizes
```

Loading: drei `useGLTF` decodes Meshopt automatically. Anything else needs
`GLTFLoader.setMeshoptDecoder(MeshoptDecoder)`.

Measured on the pipeline smoke test: 10.5 KB raw Kiln GLB → 6.5 KB, 124 triangles, material
names preserved.

The environment kit is optimized separately into `public/models/mars-rock-kit.glb`
(23,960 B raw → 14,564 B). Runtime instancing handles its 3,836 placements in ten
batches, so it does not add thousands of React objects or physics bodies. Larger
stones and formations share one static collision mesh. These counts are structural
measurements, not a frame-rate or mobile-performance guarantee.
