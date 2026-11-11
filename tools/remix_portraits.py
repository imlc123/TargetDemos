#!/usr/bin/env python3
"""Makes portraits for the extra (unnamed) people by remixing the Gemini portraits
of the named characters: new shirt, hair, hat and skin colors, some mirrored.
No API calls, no key needed.

    python3 tools/remix_portraits.py
    python3 tools/remix_portraits.py --clean-bases   # also strip stray frame lines from the named portraits

Writes assets/img/portraits/extra_<kind>_<n>.png, assets/img/portraits/extras.json
(the matching walking-sprite look for each one) and refreshes assets/img/manifest.json.
A contact sheet for checking goes to tools/raw/remix_preview.png.

How it works: each portrait is already reduced to ~48 colors, so every color gets one
label (skin, hair, hat, top or keep) from where it sits in the picture and how close it
is to that area's main color. Recoloring keeps each pixel's offset from the main color
(in OKLab), so shading and highlights survive.
"""
import json
import math
import random
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'img'
PORTRAITS = OUT / 'portraits'
S = 64  # one frame is S x S; a sheet holds the neutral and happy frames side by side
VARIANTS_PER_BASE = 2

# Per-character fixes when the preview shows a stray recolor:
#   'keep': colors (hex as they appear in the sheet) that must never change
#   'skip': areas to leave alone ('top', 'hair' or 'hat')
OVERRIDES = {
    'tyler': {'skip': ['top']},  # dark gray tank top is too close to his skin shading
    'val': {'skip': ['top']},    # her hands pick up the blazer color
}


# ---------- color math ----------
def srgb_to_lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin_to_srgb(c):
    c = max(0.0, min(1.0, c))
    c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
    return int(round(c * 255))


def oklab(rgb):
    r, g, b = (srgb_to_lin(v) for v in rgb)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (math.copysign(abs(v) ** (1 / 3), v) for v in (l, m, s))
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def from_oklab(lab):
    L, a, b = lab
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186168 * m + 1.7076147010 * s
    return (lin_to_srgb(r), lin_to_srgb(g), lin_to_srgb(bb))


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_hex(c):
    return '#%02x%02x%02x' % c


def lch(lab):
    L, a, b = lab
    return L, math.hypot(a, b), math.atan2(b, a)


def from_lch(L, C, h):
    return from_oklab((L, C * math.cos(h), C * math.sin(h)))


def dist(p, q, wl=0.6):
    return math.sqrt(((p[0] - q[0]) * wl) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2)


# ---------- reading the game data ----------
def game_data():
    js = ("import('./js/data/characters.js').then(m => console.log(JSON.stringify({"
          "chars: Object.fromEntries(Object.entries(m.CHARACTERS).map(([k, c]) => [k, { kind: c.kind, look: c.look }])),"
          "styles: m.EXTRA_STYLES, skins: m.SKINS, hairs: m.HAIRS })))")
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True, cwd=ROOT).stdout
    return json.loads(out)


# ---------- labeling ----------
def color_stats(frame):
    """{rgb: [count, mean x, mean y]} over the opaque pixels of one frame."""
    px = frame.load()
    acc = defaultdict(lambda: [0, 0.0, 0.0])
    for y in range(S):
        for x in range(S):
            r, g, b, a = px[x, y]
            if a:
                s = acc[(r, g, b)]
                s[0] += 1
                s[1] += x
                s[2] += y
    return {c: [n, sx / n, sy / n] for c, (n, sx, sy) in acc.items()}


def dominant(stats, box, exclude=()):
    """Most common color whose average spot falls inside box (x0, y0, x1, y1)."""
    x0, y0, x1, y1 = box
    best = None
    for c, (n, mx, my) in stats.items():
        if x0 <= mx <= x1 and y0 <= my <= y1 and c not in exclude:
            if best is None or n > stats[best][0]:
                best = c
    return best


def label_colors(stats, look, keep):
    """Map each color to 'skin', 'hair', 'hat', 'top' or 'keep'."""
    labs = {c: oklab(c) for c in stats}
    skin = dominant(stats, (22, 28, 42, 46))
    # the shirt is the most common color low in the picture that isn't skin or skin shading
    skin_like = [c for c in stats if dist(labs[c], labs[skin]) < 0.15]
    top = dominant(stats, (14, 51, 50, 63), exclude=[skin, *skin_like]) or dominant(stats, (0, 50, 63, 63), exclude=[skin])
    refs = {'skin': skin, 'top': top}
    if look.get('hat'):
        refs['hat'] = dominant(stats, (10, 0, 54, 18), exclude=[skin])
    hair = dominant(stats, (8, 4, 56, 30), exclude=[skin, refs.get('hat')])
    if hair is not None and dist(labs[hair], labs[skin]) > 0.08:
        refs['hair'] = hair
    refs = {k: v for k, v in refs.items() if v is not None}
    ref_lab = {k: labs[v] for k, v in refs.items()}

    labels = {}
    for c, (n, mx, my) in stats.items():
        lab = labs[c]
        L, C, _ = lch(lab)
        if rgb_hex(c) in keep or L < 0.2 or (C < 0.025 and L > 0.85):
            labels[c] = 'keep'  # outlines, pupils, eye whites, highlights
            continue
        best, bd = 'keep', 0.11
        d_skin = dist(lab, ref_lab['skin']) if 'skin' in ref_lab else 9
        for k, r in ref_lab.items():
            d = dist(lab, r)
            # where a color sits says a lot: shirts are low, hair and hats are high
            if k == 'top' and my < 44:
                d += 0.08
            if k in ('hair', 'hat') and my > 44:
                d += 0.08
            if k == 'skin' and my > 56:
                d += 0.03
            if k == 'skin' and my > 50 and 20 < mx < 44:
                d += 0.05  # the middle of the chest is usually clothing
            if k == 'hair' and d > 0.7 * d_skin:
                continue  # skin shading (arms, neck) that only looks a bit like hair
            if d < bd:
                best, bd = k, d
        labels[c] = best
    return labels, ref_lab


def allowed(k, x, y):
    """Where each area may be recolored. The face itself is never touched."""
    x %= S
    in_face = 19 <= x <= 45 and 22 <= y <= 50 or 22 <= x <= 42 and 16 <= y <= 50
    if k == 'top':
        return y >= 46 and not (24 <= x <= 40 and y < 52)
    if k in ('hair', 'hat'):
        chest = 18 <= x <= 46 and y >= 44
        return not in_face and not chest and y < 56
    return False


def clean_edges(img):
    """Remove near-white frame lines touching a frame's border (a few sheets came with one)."""
    px = img.load()
    for ox in range(0, img.width, S):
        stack = [(ox + x, y) for x in range(S) for y in (0, S - 1)] + [(ox + x, y) for y in range(S) for x in (0, S - 1)]
        seen = set()
        while stack:
            x, y = stack.pop()
            if (x, y) in seen or not (ox <= x < ox + S and 0 <= y < S):
                continue
            seen.add((x, y))
            r, g, b, a = px[x, y]
            if not a:
                continue
            L, C, _ = lch(oklab((r, g, b)))
            if L > 0.86 and C < 0.04:
                px[x, y] = (0, 0, 0, 0)
                stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    # leftover 1px gray frame lines: gray pixels with empty space on both sides
    w, h = img.size
    clear = lambda x, y: not (0 <= x < w and 0 <= y < h) or px[x, y][3] == 0
    for _ in range(2):
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a and lch(oklab((r, g, b)))[1] < 0.04 and ((clear(x - 1, y) and clear(x + 1, y)) or (clear(x, y - 1) and clear(x, y + 1))):
                    px[x, y] = (0, 0, 0, 0)
    return img


def recolor(sheet, labels, ref_lab, targets):
    """Shift every labeled color from its area's main color toward the target color."""
    shift = {}
    for k, t in targets.items():
        if k not in ref_lab:
            continue
        rL, rC, rh = lch(ref_lab[k])
        tL, tC, th = lch(oklab(hex_rgb(t)))
        shift[k] = (tL - rL, (tC / rC) if rC > 0.02 else 1.0, th - rh, tC)
    out = sheet.copy()
    px = out.load()
    cache = {}
    for y in range(sheet.height):
        for x in range(sheet.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            c = (r, g, b)
            k = labels.get(c, 'keep')
            if k not in shift or not allowed(k, x, y):
                continue
            if c not in cache:
                dL, cs, dh, tC = shift[k]
                L, C, h = lch(oklab(c))
                C2 = min(0.32, tC * 1.4, C * cs) if tC > 0.02 else C * 0.25
                cache[c] = from_lch(max(0.0, min(1.0, L + dL * 0.9)), C2, h + dh)
            px[x, y] = (*cache[c], a)
    return clean_edges(out)


# ---------- making the variants ----------
def main():
    data = game_data()
    chars, styles, skins, hairs = data['chars'], data['styles'], data['skins'], data['hairs']
    rnd = random.Random(4242)
    variants = defaultdict(list)
    previews = []
    for cid, c in chars.items():
        kind = c['kind']
        if kind not in styles or cid == 'dale':
            continue
        path = PORTRAITS / f'{cid}.png'
        if not path.exists():
            print('skip (no portrait):', cid)
            continue
        sheet = clean_edges(Image.open(path).convert('RGBA'))
        if '--clean-bases' in sys.argv:
            sheet.save(path)  # also tidy the named character's own portrait
        look = c['look']
        stats = color_stats(sheet.crop((0, 0, S, S)))
        # colors only in the happy frame get labels too
        for cc, v in color_stats(sheet.crop((S, 0, 2 * S, S))).items():
            stats.setdefault(cc, v)
        fix = OVERRIDES.get(cid, {})
        labels, ref_lab = label_colors(stats, look, set(fix.get('keep', [])))
        # big jumps in brightness make patterned clothes look patchy
        tL = oklab(hex_rgb(look['top']))[0]
        tops = [t for t in styles[kind]['tops'] if t.lower() != look['top'].lower() and abs(oklab(hex_rgb(t))[0] - tL) < 0.35]
        tops = tops or [t for t in styles[kind]['tops'] if t.lower() != look['top'].lower()]
        # new hair stays close in brightness to the old, so strand shading still reads
        hL = oklab(hex_rgb(look['hair']))[0]
        hair_opts = sorted((h for h in hairs if h.lower() != look['hair'].lower()), key=lambda h: abs(oklab(hex_rgb(h))[0] - hL))[:3]
        skin = look['skin']  # skin stays: recoloring it speckled the faces
        rnd.shuffle(tops)
        for v in range(VARIANTS_PER_BASE):
            top = tops[v % len(tops)]
            hair = hair_opts[(v + rnd.randrange(3)) % len(hair_opts)]
            hat = rnd.choice(['#27408b', '#8b2740', '#2a3a6a', '#3a6a4a', '#c8603a', '#5a3a7a'])
            # a hood is part of the hoodie, so it takes the shirt color
            targets = {'top': top, 'hair': hair, 'hat': top if look.get('hat') == 'hood' else hat}
            for k in fix.get('skip', []):
                targets.pop(k, None)
            if 'top' not in targets:
                top = look['top']
            if lch(oklab(hex_rgb(look['hair'])))[1] < 0.04 and 'hair' in targets:
                # gray hair turns pink when tinted: leave it
                del targets['hair']
            if 'hair' not in targets:
                hair = look['hair']
            out = recolor(sheet, labels, ref_lab, targets)
            if v % 2:
                # mirror each frame in place
                n = ImageOps.mirror(out.crop((0, 0, S, S)))
                h = ImageOps.mirror(out.crop((S, 0, 2 * S, S)))
                out = Image.new('RGBA', (2 * S, S))
                out.paste(n, (0, 0))
                out.paste(h, (S, 0))
            new_look = {**look, 'top': top, 'hair': hair, 'skin': skin}
            if look.get('hat'):
                new_look['hatColor'] = targets.get('hat', look.get('hatColor'))
            variants[kind].append({'base': cid, 'look': new_look, 'img': out})
            previews.append((sheet, out))

    manifest = {}
    for kind, items in variants.items():
        manifest[kind] = []
        for i, it in enumerate(items):
            name = f'extra_{kind}_{i}'
            it['img'].save(PORTRAITS / f'{name}.png')
            manifest[kind].append({'file': f'portraits/{name}', 'base': it['base'], 'look': it['look']})
    (PORTRAITS / 'extras.json').write_text(json.dumps(manifest, indent=1))
    print('remixed:', {k: len(v) for k, v in variants.items()})

    files = sorted(str(p.relative_to(OUT)) for p in OUT.rglob('*.png'))
    (OUT / 'manifest.json').write_text(json.dumps({'files': files}, indent=1))
    print(f'manifest: {len(files)} images')

    # contact sheet: original | remix, two per row
    raw = ROOT / 'tools' / 'raw'
    raw.mkdir(parents=True, exist_ok=True)
    cols = 4
    rows = math.ceil(len(previews) / cols)
    sheet = Image.new('RGBA', (cols * (4 * S + 12), rows * (S + 6)), (40, 34, 60, 255))
    for i, (a, b) in enumerate(previews):
        x = (i % cols) * (4 * S + 12)
        y = (i // cols) * (S + 6)
        sheet.paste(a, (x, y), a)
        sheet.paste(b, (x + 2 * S + 4, y), b)
    sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(raw / 'remix_preview.png')
    print('preview:', raw / 'remix_preview.png')


if __name__ == '__main__':
    main()
