# climate-dial

Sole visual reference: `models and assets images/climate-dial.webp`. Inspected before authoring; kept unchanged.

Wall-mounted greenhouse photoperiod / climate dial (0.10m deep, 0.27m high, 0.28m wide) with chamfered cream/ivory outer housing, orange accent inserts on top and sides, dark slate bezel frame, and four corner hexagonal mounting bolts. Dark slate dial faceplate features white scale markings with an arched gauge track, radial calibration ticks, and raised digital numerals at "12", "16", and "20". A warm amber status LED indicator glows in the bottom-right corner. A central rotatable faceted orange rotary knob with an ivory pointer needle is positioned as a dedicated child node to indicate and adjust the photoperiod setting.

Semantic nodes:
- `root`: Root mounting assembly node.
- `faceplate`: Slate dial faceplate and bezel grouping.
- `gauge_markings`: Scale arc, radial ticks, and 12/16/20 numerals.
- `led_indicator`: Status LED bezel and glowing amber lens.
- `knob`: Rotatable rotary knob with pointer needle.

Generated Mars header materials; metres, +Y up, +X forward.

## Result

Completed 2026-11-13.

- Collection `project`, asset `a_76a77864672843f8868bfe89190a6afa`, revision `r_d6fd963dbe144f22a9606f65fe82798f`, programRef `p_5898f3ca43f1`.
- Exact source `assets/source/phase-6/climate-dial.kiln.js`; optimized GLB `public/models/climate-dial.glb`.
- Measured X × Y × Z: 0.098 × 0.272 × 0.276 m; 440 optimized triangles (980 raw); 34,584 optimized bytes. Declared small-prop budget (1,500) passes.
- Material-faithful GPU review: `assets/reviews/phase-6/climate-dial.png`. Reference PNG unchanged.
- Verified semantic nodes (`knob`, `faceplate`, `led_indicator`, `gauge_markings`).
