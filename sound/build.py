"""Deterministic, offline 48 kHz game audio. Run with Python + requirements.txt."""
from pathlib import Path
import json
import argparse
import subprocess
import numpy as np
from scipy.io import wavfile


def write_wav(path, data):
    wavfile.write(path, 48000, np.round(np.clip(data, -1, 1) * 32767).astype(np.int16))
from scipy.signal import butter, sosfilt, resample_poly
import dsp

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / 'public' / 'audio'
SR = 48000
rng = np.random.default_rng(1847)
parser = argparse.ArgumentParser()
parser.add_argument('--music-only', action='store_true')
args = parser.parse_args()
manifest = json.loads((OUT / 'manifest.json').read_text()) if args.music_only else {}


def low(x, hz):
    return sosfilt(butter(2, hz, fs=SR, output='sos'), x, axis=-1)


def time(sec):
    return np.arange(round(sec * SR)) / SR


def noise(sec, cutoff):
    x = low(rng.standard_normal(round(sec * SR)), cutoff)
    return dsp.norm(x)


def voice(hz, sec, softness=1):
    t = time(sec)
    pitch = hz * (1 + .0008 * np.sin(2 * np.pi * .7 * t))
    phase = 2 * np.pi * np.cumsum(pitch) / SR
    x = np.sin(phase) + .21 * np.sin(2 * phase) * np.exp(-t * 5 * softness)
    x += .055 * np.sin(3 * phase) * np.exp(-t * 8 * softness)
    return dsp.fade(x * (1 - np.exp(-t / .012)) * np.exp(-t * 6 / sec), .005, .06)


def notes(pitches, spacing=.16, sec=1.2):
    x = np.zeros(round(sec * SR))
    for i, f in enumerate(pitches):
        y = voice(f, sec - i * spacing)
        dsp.place(x, y * (.8 + .08 * i), i * spacing)
    return x


def mechanical(sec, hz=145):
    t = time(sec)
    x = .48 * np.sin(2 * np.pi * (hz * t + .35 * np.sin(2 * np.pi * 1.3 * t)))
    x += .14 * np.sin(2 * np.pi * hz * 2 * t)
    x += .24 * noise(sec, 630) * (.8 + .2 * np.sin(2 * np.pi * 17 * t))
    return dsp.fade(x, .12, .16)


def impact(sec, modes, contact=.006):
    n = round(sec * SR)
    force = dsp.contact(n, contact, rng, .06)
    force = dsp.filt(force, 'hp', modes[0] * .6)
    return dsp.norm(dsp.resonate(force, modes, [.24 / (1 + .5 * i) for i in range(len(modes))], [1 / (i + 1) for i in range(len(modes))]))


def circular_texture(sec, cutoff):
    # Filter a repeated period to settle state before taking the middle period.
    n = round(sec * SR)
    raw = rng.standard_normal(n)
    x = low(np.tile(raw, 3), cutoff)[n:2*n]
    return dsp.norm(x)


def save(name, x, category, description, loop=False, peak=.42):
    x = dsp.filt(x, 'hp', 45 if category != 'music' else 32)
    x -= x.mean(axis=-1, keepdims=True)
    # Pass 2: soften repeat-heavy voices and reduce bright grit.
    for take in (1, 2):
        y = x.copy()
        if take == 2:
            y = low(y, 2400 if category != 'music' else 4800)
        if loop:
            # Matching short circular crossfade removes finite-filter boundaries.
            k = 480
            blend = .5 - .5 * np.cos(np.linspace(0, np.pi, k))
            # A small smooth correction aligns both endpoints without a volume dip.
            diff = y[..., -1] - y[..., 0]
            y[..., :k] += np.expand_dims(diff * .5, -1) * (1 - blend)
            y[..., -k:] -= np.expand_dims(diff * .5, -1) * blend
            y[..., -1] = y[..., 0]
        else:
            y = dsp.fade(y, .006, .09 if y.shape[-1] > SR // 2 else .035)
            y[..., 0] = 0; y[..., -1] = 0
        tp = np.abs(resample_poly(y, 4, 1, axis=-1)).max()
        y *= peak / max(tp, 1e-12)
        render = ROOT / 'renders' / f'pass-{take}' / f'{name}.wav'
        render.parent.mkdir(parents=True, exist_ok=True)
        write_wav(render, y.T)
        if take == 2:
            destination = OUT / ('music' if category == 'music' else 'sfx')
            destination.mkdir(parents=True, exist_ok=True)
            if category == 'music':
                final = destination / f'{name}.ogg'
                subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(render), '-c:a', 'libvorbis', '-q:a', '5', str(final)], check=True)
            else:
                final = destination / f'{name}.wav'
                write_wav(final, y.T)
            manifest[name] = dict(url='/audio/' + str(final.relative_to(OUT)), category=category,
                description=description, duration=round(y.shape[-1]/SR, 3), loop=loop,
                license='CC0-1.0', original=True)


if not args.music_only:
    for surface in ('regolith', 'cabin'):
        for i in range(1, 5):
            sec = .34 + rng.uniform(-.025, .025)
            t = time(sec)
            body = impact(sec, [108 + i * 3, 243 + i * 4, 487], .009)
            grit = noise(sec, 1300 if surface == 'regolith' else 650)
            env = (1 - np.exp(-t / .018)) * np.exp(-t * 25)
            texture = grit * env * (1 if surface == 'regolith' else .25)
            save(f'footstep-{surface}-{i}', .65 * body + texture, 'footsteps', f'Soft {surface} boot step, variant {i}', peak=.28)

    robot = {
        'hello': [293.665, 440], 'happy': [293.665, 369.994, 440],
        'think': [329.628, 293.665], 'worried': [293.665, 246.942],
        'reboot': [146.832, 220, 293.665], 'charge': [220, 293.665, 440],
    }
    for name, pitches in robot.items():
        save('pebble-' + name, notes(pitches, .17, 1.4), 'robot', 'Warm Pebble ' + name + ' cue', peak=.32)
    save('pebble-drive', circular_texture(3, 480) * .16 + mechanical(3, 132) * .55, 'robot', 'Quiet rubber tracks and electric motor', True, .25)
    save('pebble-turn', mechanical(.55, 160), 'robot', 'Small motor turning adjustment', peak=.25)
    t = time(2)
    save('pebble-clean', noise(2, 1150) * (.65 + .15 * np.sin(2 * np.pi * 9 * t)) + .12 * mechanical(2, 180), 'robot', 'Gentle rotating brush', True, .24)
    save('pebble-grip', .6 * impact(.5, [170, 390, 680]) + .35 * mechanical(.5, 125), 'robot', 'Small gripper servo and soft latch', peak=.26)

    for name, pitches, spacing, duration in [
        ('ui-click', [440], .1, .15), ('ui-open', [293.665, 369.994], .08, .5),
        ('ui-close', [369.994, 293.665], .08, .45), ('ui-confirm', [293.665, 440], .13, .8),
        ('ui-notice', [440, 587.33], .18, 1.1), ('message', [369.994, 440], .18, 1.2),
        ('complete', [293.665, 369.994, 440, 587.33], .25, 2.4),
    ]:
        save(name, notes(pitches, spacing, duration), 'interface', name.replace('-', ' ').capitalize(), peak=.26 if name == 'ui-click' else .36)

    x = .2 * mechanical(1.1, 115)
    dsp.place(x, impact(.35, [155, 310, 520]) * .4, .02)
    dsp.place(x, impact(.32, [130, 280, 440]) * .24, .76)
    save('door', x, 'world', 'Padded latch, sliding servo, soft stop')
    t = time(2.4)
    save('airlock', noise(2.4, 1050) * (.7 + .1 * np.sin(2*np.pi*t/2.4)), 'world', 'Soft steady pressure equalisation', True, .3)
    save('tool', impact(.52, [230, 520, 910], .004), 'world', 'Damped metal tool contact', peak=.32)
    save('switch', impact(.22, [210, 430, 730], .007), 'world', 'Soft mechanical switch', peak=.3)
    t = time(.6)
    save('harvest', noise(.6, 1800) * np.sin(np.pi * t/.6)**2 + .08*voice(440, .6), 'world', 'Soft leaf and stem rustle', peak=.3)
    for name, cutoff, hz, length in [('landing-entry', 530, 82, 4), ('landing-thrust', 220, 65, 6)]:
        t = time(length)
        save(name, dsp.fade(noise(length, cutoff)*.7 + mechanical(length,hz)*.3,.6,1), 'landing', 'Soft low ' + name.replace('-', ' '), peak=.4)
    save('landing-touchdown', impact(1.4, [62, 108, 190], .016) + dsp.fade(noise(1.4, 180), .02, .8)*.2, 'landing', 'Cushioned landing and settling', peak=.42)
    for name, cutoff in [('hab-ambience', 340), ('suit-ambience', 180)]:
        t = time(8)
        save(name, circular_texture(8, cutoff)*(.9+.1*np.sin(2*np.pi*t/8)), 'ambience', 'Very quiet life-support ventilation', True, .22)

# Floating space bed. Every voice blooms over seconds; no struck excitations.
length = 48
music = np.zeros((2, round(length * SR)))
chords = [[50, 62, 69, 76], [43, 62, 71, 81],
          [50, 62, 69, 78], [45, 64, 69, 74]]
for region, chord in enumerate(chords):
    for i, midi in enumerate(chord):
        sec = 26
        t = time(sec)
        f = 440 * 2**((midi-69)/12)
        # Zero-slope onset and release; wide overlaps avoid any chord stabs.
        envelope = np.sin(np.pi*t/sec)**4
        channels = []
        for channel in range(2):
            cloud = np.zeros(len(t))
            for detune, weight in [(-.0011, .24), (0, .52), (.0011, .24)]:
                phase = 2*np.pi*(f*(1+detune)*t)
                phase += .045*np.sin(2*np.pi*.07*t + channel*.7 + i)
                cloud += weight*(np.sin(phase + channel*.12)
                    + .22*np.sin(2*phase + .4)*(.8+.2*np.sin(2*np.pi*.035*t))
                    + .045*np.sin(3*phase + .8))
            channels.append(cloud)
        pad = np.stack(channels)*envelope*.035*(.65 if i==0 else 1)
        indices = (round((region*12-8+i*.5)*SR)+np.arange(len(t)))%music.shape[-1]
        music[:, indices] += pad
# Distant, luminous sustained voices: long rounded swells, no bell transients.
for at, midi, sec in [(2,81,16),(18,86,19),(35,81,18)]:
    t=time(sec); f=440*2**((midi-69)/12)
    envelope=np.sin(np.pi*t/sec)**4
    glow=np.stack([np.sin(2*np.pi*f*t + .08*np.sin(2*np.pi*.09*t+ch))
        + .08*np.sin(2*np.pi*2*f*t) for ch in (0,.8)])
    indices=(round(at*SR)+np.arange(len(t)))%music.shape[-1]
    music[:,indices]+=glow*envelope*.006
# Quiet diffused air, periodically enveloped and decorrelated between channels.
t=time(length)
for ch in range(2):
    air=dsp.filt(circular_texture(length,1600),'hp',650)
    music[ch]+=air*(.65+.35*np.sin(2*np.pi*t/length+ch)**2)*.0008
# Long dark room; preceding repetition supplies tails at the start of the loop.
ir=dsp.space(6,.09,.88,.75,42)
room=dsp.reverb(np.tile(music,3),ir,-10,230,2600)
music=room[:,music.shape[-1]:2*music.shape[-1]]
save('pale-blue-morning', music, 'music',
     'Floating space ambience: slow wide synth clouds, distant glows, no percussion or knocks', True, .38)
# New URL prevents a cached copy of the rejected music from being reused.
manifest['pale-blue-morning']['url'] += '?v=2'

(OUT/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
audition={'title':'Mars Life Line · sound room', 'intro':'Soft, simple audio. Start at a comfortable volume. Compare the original and softened takes; repeated steps rotate through four variants.', 'cues':[]}
for name, item in manifest.items():
    if name.startswith('footstep-') and not name.endswith('-1'): continue
    names=[name[:-1]+str(i) for i in range(1,5)] if name.startswith('footstep-') else [name]
    audition['cues'].append(dict(id=name,name=name.replace('-',' ').title(),brief=item['description'],takes=[dict(label='First pass' if take==1 else 'Softened',note='Layered original synthesis' if take==1 else 'Gentler upper mids and restrained texture',files=[f'renders/pass-{take}/{key}.wav' for key in names]) for take in (1,2)]))
(ROOT/'audition.json').write_text(json.dumps(audition,indent=2)+'\n')
print(f'Built {len(manifest)} original assets in {OUT}')
