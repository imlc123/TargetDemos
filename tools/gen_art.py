#!/usr/bin/env python3
"""Generate the game's illustrated art with the Gemini image API.

Usage:
    GEMINI_API_KEY=... python3 tools/gen_art.py            # everything missing
    GEMINI_API_KEY=... python3 tools/gen_art.py portrait   # only ids/groups containing "portrait"
    python3 tools/gen_art.py --post                        # re-run post-processing on saved raw images

Raw model output goes to tools/raw/ (not committed). Processed pixel art goes to
assets/img/, and assets/img/manifest.json tells the game what to load.
The API key is only read from the environment; never write it into a file.
"""
import base64
import concurrent.futures as cf
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from art_manifest import ASSETS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'tools' / 'raw'
OUT = ROOT / 'assets' / 'img'
API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
MODELS = {'pro': 'gemini-3-pro-image', 'flash': 'gemini-3.1-flash-image'}


# ---------------- Gemini ----------------
def call_gemini(model, prompt, aspect='1:1', image_path=None, tries=5):
    key = os.environ.get('GEMINI_API_KEY')
    if not key:
        raise SystemExit('GEMINI_API_KEY is not set')
    parts = [{'text': prompt}]
    if image_path:
        data = base64.b64encode(Path(image_path).read_bytes()).decode()
        parts.insert(0, {'inlineData': {'mimeType': 'image/png', 'data': data}})
    body = {'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect}}}
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump(body, f)
        req = f.name
    try:
        for attempt in range(tries):
            # curl picks up the session's proxy and CA settings; the key travels only in a header
            r = subprocess.run(
                ['curl', '-sS', '--max-time', '240', API.format(model=MODELS[model]),
                 '-H', f'x-goog-api-key: {key}', '-H', 'Content-Type: application/json', '-d', f'@{req}'],
                capture_output=True, text=True)
            try:
                d = json.loads(r.stdout)
            except json.JSONDecodeError:
                d = {'error': {'code': 0, 'message': (r.stderr or r.stdout)[:200]}}
            if 'error' in d:
                code = d['error'].get('code', 0)
                msg = d['error'].get('message', '')[:160]
                if code in (0, 429, 500, 502, 503, 504) and attempt < tries - 1:
                    time.sleep(4 * 2 ** attempt)
                    continue
                raise RuntimeError(f'{code} {msg}')
            for c in d.get('candidates', []):
                for p in c.get('content', {}).get('parts', []):
                    if 'inlineData' in p:
                        return base64.b64decode(p['inlineData']['data'])
            if attempt < tries - 1:
                time.sleep(3)
                continue
            raise RuntimeError('no image in response: ' + json.dumps(d)[:200])
    finally:
        os.unlink(req)


# ---------------- post-processing ----------------
def is_magenta(r, g, b):
    return r > 170 and b > 150 and g < 110 and abs(r - b) < 90


def key_magenta(im):
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_magenta(r, g, b):
                px[x, y] = (0, 0, 0, 0)
            elif r > 150 and b > 120 and g < 140 and r - g > 60 and b - g > 40:
                # magenta fringe: pull the pink out
                px[x, y] = (min(r, g + 40), g, min(b, g + 40), a)
    return im


def trim(im):
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def pixelize(im, size, colors=40, alpha_cut=110):
    """Box-filter down to the target pixel size, then reduce colors."""
    w, h = size
    small = im.resize((w, h), Image.Resampling.BOX)
    rgb = small.convert('RGB')
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = Image.new('RGBA', (w, h))
    out.paste(q)
    if small.mode == 'RGBA':
        a = small.getchannel('A').point(lambda v: 255 if v >= alpha_cut else 0)
        out.putalpha(a)
    return out


def fit_crop(im, aspect):
    """Center-crop to an aspect ratio (w/h)."""
    w, h = im.size
    if w / h > aspect:
        nw = int(h * aspect)
        return im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    nh = int(w / aspect)
    return im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))


def outline(im, color=(28, 20, 40, 255)):
    """1px dark outline around opaque pixels (Stardew-style sprites)."""
    w, h = im.size
    src = im.load()
    out = im.copy()
    dst = out.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and src[xx, yy][3]:
                    r, g, b, _ = src[xx, yy]
                    dst[x, y] = (int(r * 0.35 + color[0] * 0.65), int(g * 0.35 + color[1] * 0.65), int(b * 0.35 + color[2] * 0.65), 255)
                    break
    return out


def gray_keep_neon(im):
    """The gray-city version: desaturate, but saturated bright colors (neon) survive."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if not a:
                continue
            mx, mn = max(r, g, b), min(r, g, b)
            if mx > 170 and (mx - mn) / mx > 0.55:
                continue
            l = 0.3 * r + 0.59 * g + 0.11 * b
            v = l * 0.72 + 18
            px[x, y] = (int(v * 0.92), int(v * 0.96), min(255, int(v * 1.1)), a)
    return im


def process(asset, raw_paths):
    """Turn raw model images into the game's pixel art."""
    kind = asset['kind']
    out = OUT / asset['out']
    out.parent.mkdir(parents=True, exist_ok=True)
    if kind == 'portrait':
        frames = []
        for p in raw_paths:
            im = trim(key_magenta(Image.open(p)))
            # square it up, keeping the shoulders at the bottom edge
            s = max(im.size)
            sq = Image.new('RGBA', (s, s))
            sq.paste(im, ((s - im.size[0]) // 2, s - im.size[1]))
            frames.append(pixelize(sq, (64, 64), colors=48))
        sheet = Image.new('RGBA', (128, 64))
        for i, f in enumerate(frames):
            sheet.paste(f, (i * 64, 0))
        sheet.save(out)
    elif kind in ('panel', 'card', 'title'):
        w, h = asset['size']
        im = fit_crop(Image.open(raw_paths[0]).convert('RGBA'), w / h)
        pixelize(im, (w, h), colors=asset.get('colors', 56)).save(out)
        if asset.get('gray'):
            gray_keep_neon(Image.open(out)).save(str(out).replace('.png', '_gray.png'))
    elif kind in ('facade', 'prop'):
        w, h = asset['size']
        imgs = []
        for p in raw_paths:
            im = trim(key_magenta(Image.open(p)))
            if kind == 'facade':
                im = im.resize((w * 8, h * 8), Image.Resampling.LANCZOS)  # stretch to the exact footprint
            else:
                # keep proportions, sit on the bottom edge
                sc = min(w * 8 / im.size[0], h * 8 / im.size[1])
                im2 = im.resize((max(1, int(im.size[0] * sc)), max(1, int(im.size[1] * sc))), Image.Resampling.LANCZOS)
                im = Image.new('RGBA', (w * 8, h * 8))
                im.paste(im2, ((w * 8 - im2.size[0]) // 2, h * 8 - im2.size[1]))
            imgs.append(outline(pixelize(im, (w, h), colors=32)))
        base = str(out).replace('.png', '')
        if kind == 'facade':
            imgs[0].save(base + '_color.png')
            gray_keep_neon(imgs[0]).save(base + '_gray.png')
        else:
            gray_keep_neon(imgs[0]).save(base + '_l.png')
            (imgs[1] if len(imgs) > 1 else imgs[0]).save(base + '_f.png')


# ---------------- driver ----------------
def generate(asset):
    aid = asset['id']
    raws = []
    for i, step in enumerate(asset['steps']):
        raw = RAW / f'{aid}_{i}.png'
        if not raw.exists():
            src = raws[step['edit']] if 'edit' in step else None
            data = call_gemini(step.get('model', asset['model']), step['prompt'], step.get('aspect', asset.get('aspect', '1:1')), src)
            raw.write_bytes(data)
            # store as real PNG (the API returns JPEG bytes)
            Image.open(raw).convert('RGB').save(raw, 'PNG')
        raws.append(raw)
    process(asset, raws)
    return aid


def done(asset):
    base = OUT / asset['out']
    if asset['kind'] == 'facade':
        return Path(str(base).replace('.png', '_color.png')).exists()
    if asset['kind'] == 'prop':
        return Path(str(base).replace('.png', '_f.png')).exists()
    return base.exists()


def write_manifest():
    files = sorted(str(p.relative_to(OUT)) for p in OUT.rglob('*.png'))
    (OUT / 'manifest.json').write_text(json.dumps({'files': files}, indent=1))
    print(f'manifest: {len(files)} images')


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    post_only = '--post' in sys.argv
    todo = [a for a in ASSETS if not args or any(s in a['id'] or s == a['kind'] for s in args)]
    if post_only:
        for a in todo:
            raws = [RAW / f"{a['id']}_{i}.png" for i in range(len(a['steps']))]
            if all(r.exists() for r in raws):
                process(a, raws)
        write_manifest()
        return
    todo = [a for a in todo if not done(a)]
    print(f'{len(todo)} assets to generate')
    failed = []
    with cf.ThreadPoolExecutor(max_workers=int(os.environ.get('ART_WORKERS', '4'))) as ex:
        futs = {ex.submit(generate, a): a['id'] for a in todo}
        for i, fut in enumerate(cf.as_completed(futs), 1):
            aid = futs[fut]
            try:
                fut.result()
                print(f'[{i}/{len(todo)}] ok   {aid}', flush=True)
            except Exception as e:  # keep going; the game falls back to code-drawn art
                failed.append(aid)
                print(f'[{i}/{len(todo)}] FAIL {aid}: {e}', flush=True)
    write_manifest()
    if failed:
        print('failed:', ', '.join(failed))


if __name__ == '__main__':
    main()
