#!/usr/bin/env python3
"""Builds the tile maps for the two newer levels (Reply Row and Podcast Pier) and
checks every level's spawn points against its map.

    python3 tools/genmaps.py            # print the new maps as JS arrays
    python3 tools/genmaps.py --check    # validate js/data/levels.js (needs node)

The map legend is documented at the top of js/data/levels.js.
"""
import json
import random
import subprocess
import sys

W, H = 64, 40


def blank(fill):
    return [[fill] * W for _ in range(H)]


def fill(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            g[y][x] = ch


def building(g, x0, y0, x1, y1, front=3, alleys=()):
    """Roof on top, a `front`-row wall below it (the side you see)."""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            g[y][x] = 'W' if y > y1 - front else 'R'
    for a in alleys:
        for y in range(y0, y1 + 1):
            g[y][a] = ALLEY


def scatter(g, x0, y0, x1, y1, rnd, ch, rate, on=None, step=1):
    for y in range(y0, y1 + 1, step):
        for x in range(x0, x1 + 1):
            if (on is None or g[y][x] in on) and rnd.random() < rate:
                g[y][x] = ch


ALLEY = 'c'


def reply_row():
    """Old town at dusk: cobbled streets, a canal with bridges, brick squares."""
    global ALLEY
    ALLEY = 'c'
    rnd = random.Random(303)
    g = blank('c')
    # border
    for x in range(W):
        g[0][x] = 'R'; g[H - 1][x] = 'R'
    for y in range(H):
        g[y][0] = 'R'; g[y][W - 1] = 'R'
    # north row of houses (fronts face the street below), alleys between them
    building(g, 1, 1, 62, 7, alleys=(15, 16, 40, 41))
    # rows 8-9: cobbled street (already 'c')
    # middle-north: a brick square, a debate hall, a little garden
    fill(g, 2, 10, 19, 16, 'k')
    scatter(g, 3, 11, 18, 15, rnd, 'T', 0.04, on='k', step=2)
    building(g, 23, 10, 37, 16)
    fill(g, 40, 10, 61, 16, 'g')
    for x in range(40, 62):
        g[13][x] = 'd'
    scatter(g, 40, 10, 61, 16, rnd, 'f', 0.16, on='g')
    scatter(g, 41, 10, 60, 16, rnd, 'T', 0.05, on='g', step=3)
    for x in (44, 52, 58):
        g[12][x] = 'h'
    # the canal (rows 18-20) with promenades on both banks (rows 17 and 21)
    fill(g, 1, 18, 62, 20, '~')
    for bx in (9, 10, 11, 30, 31, 32, 33, 52, 53, 54):
        for y in (18, 19, 20):
            g[y][bx] = '#'
    # south-middle: houses, a big brick square in the middle
    building(g, 2, 22, 14, 28, alleys=(8,))
    fill(g, 17, 22, 38, 28, 'k')
    for x in (19, 36):
        for y in (23, 27):
            g[y][x] = 'T'
    for x in (22, 25, 31, 34):
        g[25][x] = 'h'
    building(g, 41, 22, 61, 28, alleys=(51,))
    # rows 29-30 cobbled street; south: a garden and the old library
    fill(g, 1, 31, 18, 37, 'g')
    for y in range(31, 38):
        g[y][9] = 'd'
    scatter(g, 1, 31, 18, 37, rnd, 'f', 0.18, on='g')
    scatter(g, 2, 31, 17, 37, rnd, 'T', 0.07, on='g', step=2)
    building(g, 21, 31, 40, 37, alleys=(30,))
    fill(g, 43, 31, 61, 37, 'k')
    scatter(g, 44, 32, 60, 36, rnd, 'h', 0.05, on='k', step=2)
    for x in (46, 50, 56):
        g[34][x] = 'b'
    for x in (5, 14):
        g[12][x] = 'b'
    for x in (24, 35):
        g[17][x] = 'b'
    for x in (20, 46):
        g[21][x] = 'b'
    return [''.join(r) for r in g]


def podcast_pier():
    """Sunset beach: a boardwalk town, an amusement plaza, sand and the sea with piers."""
    global ALLEY
    ALLEY = '_'
    rnd = random.Random(505)
    g = blank('_')
    for x in range(W):
        g[0][x] = 'R'
    for y in range(0, 26):
        g[y][0] = 'R'; g[y][W - 1] = 'R'
    # top: studios and beach shacks
    building(g, 1, 1, 62, 7, alleys=(20, 21, 44))
    # rows 8-10 boardwalk ('_' already)
    # middle: a palm plaza, the studio block, the amusement plaza
    fill(g, 1, 11, 14, 22, 'p')
    scatter(g, 2, 12, 13, 21, rnd, 'T', 0.08, on='p', step=2)
    for y in (14, 19):
        g[y][4] = 'b'; g[y][11] = 'b'
    building(g, 17, 11, 30, 18, alleys=(23,))
    fill(g, 17, 19, 30, 22, 'p')
    for x in (19, 28):
        g[20][x] = 'h'
    fill(g, 33, 11, 62, 22, 'p')
    scatter(g, 34, 12, 61, 21, rnd, 'h', 0.03, on='p', step=3)
    for x in (36, 59):
        for y in (13, 20):
            g[y][x] = 'T'
    # rows 23-25 boardwalk; then the beach
    fill(g, 0, 26, 63, 32, 's')
    for y in range(26, 33):
        g[y][0] = 'T'; g[y][63] = 'T'
    scatter(g, 2, 27, 61, 31, rnd, 'T', 0.025, on='s', step=2)
    # the sea, with two piers
    fill(g, 0, 33, 63, 39, '~')
    for y in range(33, 39):
        for x in (28, 29, 30, 31, 50, 51, 52):
            g[y][x] = '_'
    for x in range(26, 34):
        g[38][x] = '_'
    for x in (25, 39):
        g[24][x] = 'b'
    return [''.join(r) for r in g]


def print_js(name, rows):
    print(f'// {name}')
    print('map: [')
    for r in rows:
        print(f"  '{r}',")
    print('],')


WALK_BLOCKERS = set('RWThbB~')


def check():
    """Every player/NPC spawn must sit on a walkable tile."""
    js = ("Promise.all([import('./js/data/levels.js'), import('./js/art/props.js')]).then(([m, p]) => console.log(JSON.stringify({"
          "types: Object.fromEntries(Object.entries(p.PROP_TYPES).map(([k, v]) => [k, [v.place, v.foot || 0]])),"
          "levels: m.LEVELS.map(l => ({id: l.id, map: l.map, player: l.player, npcs: l.npcs, props: l.props || [], calm: l.calm || [], spawnPoints: l.spawnPoints || []}))})))")
    out = json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)
    types = out['types']
    bad = 0
    for lv in out['levels']:
        rows = lv['map']
        w = max(len(r) for r in rows)
        for i, r in enumerate(rows):
            if len(r) != w:
                print(f"{lv['id']}: row {i} has {len(r)} tiles, expected {w}")
                bad += 1
        spots = [('player', lv['player'])] + [(n.get('who') or n['type'], n['at']) for n in lv['npcs']] + [('spawn', p) for p in lv['spawnPoints']]
        spots += [('tea', p) for p in lv['calm']]
        taken = {tuple(p) for _, p in spots}
        for pr in lv['props']:
            place, foot = types.get(pr['type'], ('?', 0))
            if place == '?':
                print(f"{lv['id']}: unknown prop {pr['type']}")
                bad += 1
            if place != 'ground':
                continue
            x, y = pr['at']
            for i in range(foot):
                spots.append((f"prop {pr['type']}", [x + i, y]))
                if (x + i, y) in taken:
                    print(f"{lv['id']}: prop {pr['type']} at {x},{y} covers a spawn point")
                    bad += 1
        for name, (x, y) in spots:
            ch = rows[y][x] if 0 <= y < len(rows) and 0 <= x < len(rows[y]) else '?'
            if ch in WALK_BLOCKERS or ch == '?':
                print(f"{lv['id']}: {name} at {x},{y} is on '{ch}'")
                bad += 1
    print('maps OK' if not bad else f'{bad} problems')
    return bad


if __name__ == '__main__':
    if '--check' in sys.argv:
        sys.exit(1 if check() else 0)
    print_js('Reply Row', reply_row())
    print_js('Podcast Pier', podcast_pier())
