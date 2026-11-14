# Mars Life Line audio

36 original procedural assets: 8 boot-step variants, 10 Pebble cues, 7 interface
cues, 5 world effects, 3 landing cues, 2 ambience loops and a space-music loop.
See `public/audio/manifest.json` for the exact inventory.

- WAV effects: mono, 48 kHz / 16-bit.
- Music: stereo Vorbis, 48 seconds, circular tails.
- All originals are dedicated under CC0-1.0; no third-party samples or music.
- `dsp.py` is copied from ruminoob/sound-skill and lightly adjusted to make the
  unused pedalboard compressor dependency optional. It is tooling, not a sample.

## Rebuild

Requires Python 3, NumPy, SciPy and FFmpeg on PATH:

```sh
python3 -m pip install -r sound/requirements.txt
python3 sound/build.py
python3 sound/review.py
npm run build
```

The generator is deterministic. Both first and softened passes are retained in
`sound/renders/` (ignored); final assets are in `public/audio/`. Review writes
spectrograms and peak, RMS, edge and spectral-centroid measurements to
`sound/review/`. The browser audition page compares the two passes at matched
RMS levels, with peak headroom. These measurements flag defects; they do not
replace listening or claim integrated LUFS matching.

Run `npm run dev` and visit `/audio/index.html` for the audition room. Audio in the game
starts after a key press or click. The Sound control remembers mute, master
volume and music volume. Hidden tabs are silenced. Pausing the campaign stops
continuous sounds. Pebble motor/brush loops attenuate with distance and stop
when the corresponding motion stops. Footsteps follow distance traveled rather
than key-down state, so walking into a wall does not make stepping sounds.

The original music was rejected for sounding like knocks. The revised music uses
only slow synth clouds, airy texture and sustained glows; no struck notes.
Listen at a comfortable level and adjust to taste. Music is an original composition, “Pale Blue Morning”.
