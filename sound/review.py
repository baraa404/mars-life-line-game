"""Measure every render and build a level-matched browser audition room."""
from pathlib import Path
import json
import subprocess
import html
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / 'public' / 'audio'
review = ROOT / 'review'
review.mkdir(exist_ok=True)
manifest = json.loads((OUT / 'manifest.json').read_text())
music_only = '--music-only' in sys.argv
metrics = json.loads((review / 'metrics.json').read_text()) if music_only else {}
for name, item in manifest.items():
    if music_only and item['category'] != 'music': continue
    takes = []
    for take in (1, 2):
        path = ROOT / 'renders' / f'pass-{take}' / f'{name}.wav'
        sr, raw = wavfile.read(path)
        x = raw.astype(np.float64) / 32768
        if x.ndim == 1: x = x[:, None]
        peak = np.abs(resample_poly(x, 4, 1, axis=0)).max()
        rms = np.sqrt(np.mean(x*x))
        mono = x.mean(axis=1)
        # Fixed windows avoid a music file's length dominating spectral analysis.
        n = min(8192, len(mono))
        frames = np.lib.stride_tricks.sliding_window_view(mono, n)[::max(n//2,1)]
        spectrum = np.abs(np.fft.rfft(frames * np.hanning(n), axis=-1)).mean(axis=0)
        freqs = np.fft.rfftfreq(n, 1/sr)
        centroid = np.sum(freqs*spectrum) / max(spectrum.sum(), 1e-12)
        edge = np.max(np.abs(x[-96:]))
        metrics[f'{name}/pass-{take}'] = dict(duration=len(x)/sr, true_peak_db=round(20*np.log10(max(peak,1e-12)),2),
            rms_db=round(20*np.log10(max(rms,1e-12)),2), centroid_hz=round(centroid),
            end_2ms_relative_db=round(20*np.log10(max(edge,1e-12)/max(peak,1e-12)),2),
            loop_boundary_delta=float(np.max(np.abs(x[0]-x[-1]))),
            clipped_samples=int(np.count_nonzero(np.abs(x)>=.999)), sample_rate=sr)
        assert sr == 48000 and np.all(np.isfinite(x)) and peak < .89, name
        if not item['loop']: assert edge/max(peak,1e-12) < .01, f'{name}: tail edge'
        takes.append((x,peak,rms,path))
    # Match RMS between two takes of the same cue; keep a 6dB peak margin.
    target=min(.065, *(rms*.5/max(peak,1e-12) for _,peak,rms,_ in takes))
    for take, (x,peak,rms,path) in enumerate(takes,1):
        destination=OUT/'preview'/f'{name}-{take}.ogg'
        destination.parent.mkdir(exist_ok=True)
        matched=ROOT/'renders'/f'matched-{name}-{take}.wav'
        wavfile.write(matched,48000,np.round(x*target/max(rms,1e-12)*32767).astype(np.int16))
        subprocess.run(['ffmpeg','-y','-v','error','-i',str(matched),'-c:a','libvorbis','-q:a','4',str(destination)],check=True)
    # Spectrograms for the second pass, inspect against source design.
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(takes[1][3]),'-lavfi',
        'showspectrumpic=s=720x220:legend=1:scale=log:fscale=log:color=viridis','-frames:v','1',str(review/f'{name}.png')],check=True)

(review/'metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
cards=[]
for name,item in sorted(manifest.items(), key=lambda entry: entry[1]['category'] != 'music'):
    if name.startswith('footstep-') and not name.endswith('-1'): continue
    cards.append(f'<article><h2>{html.escape(name.replace("-"," ").title())}</h2><p>{html.escape(item["description"])}</p>' +
        ''.join(f'<label>{"First pass" if take==1 else "Softened"}<audio controls preload="none" src="preview/{name}-{take}.ogg"></audio></label>' for take in (1,2)) +
        f'<a href="{item["url"]}" download>Download game file</a></article>')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mars Life Line · sound room</title>
<style>body{margin:0;background:#10202a;color:#eef4f3;font:16px/1.5 system-ui}main{max-width:1080px;margin:auto;padding:40px 24px}h1{font-size:36px;margin-bottom:8px}h2{font-size:18px}p{color:#b6cbd0}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}article{background:#1c303d;padding:20px;border-radius:16px}label{display:block;margin:14px 0}audio{display:block;width:100%;margin-top:5px}a{color:#9ee0d4}</style>
<main><h1>A little sound, a lot of space.</h1><p>36 original sounds for Mars Life Line. Gentle footsteps, a friendly robot, soft machinery and light space music. Start at a comfortable volume.</p><p>Compare the first and softened passes at matched RMS levels. The game uses the softened files at quieter relative levels. All originals: CC0.</p><section>''' + ''.join(cards) + '</section></main><script>document.addEventListener("play",e=>{if(e.target.tagName==="AUDIO")document.querySelectorAll("audio").forEach(a=>{if(a!==e.target)a.pause()})},true)</script></html>'
(OUT/'index.html').write_text(page)
print(f'Checked {len(metrics)} renders; no clipping or hard one-shot endings. Wrote /audio/index.html audition room.')
