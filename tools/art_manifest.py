"""Every illustrated asset the game uses, with its Gemini prompt.

kind:
  portrait  64x64 neutral + happy, packed into a 128x64 sheet (assets/img/portraits/<id>.png)
  panel     intro close-up panels, 120x72
  card      level card art (shown behind the level intro card)
  title     the menu backdrop
  facade    a 4x3-tile building front (64x48), saved as _color and _gray
  prop      a themed object, saved as _l (locked, gray city) and _f (freed)
"""

STYLE = ('16-bit pixel art in the style of Stardew Valley, warm saturated palette, clean dark outlines, '
         'crisp pixels, soft shading with light from the top-left')
BG = 'plain solid flat magenta #FF00FF background filling everything around the subject, no text, no border, no signature'

PORTRAIT = ('{style}. A dialogue portrait: head and shoulders of {desc}. Facing the viewer, {expr}, '
            'centered, shoulders touching the bottom edge, the head filling most of the frame. {bg}')
HAPPY = ('Same character, same outfit, same hair, same framing, same pixel-art style, but now with a big, warm, '
         'genuinely happy smile, bright open eyes and a little blush. Keep the plain magenta #FF00FF background.')

# ---------- named characters (match js/data/characters.js) ----------
CHARACTERS = {
    'chad': 'a tired young day-trader in his twenties with light skin, short brown hair, a backwards navy baseball cap, stubble, blue eyes, a teal tank top and a thin gold chain',
    'marcus': 'a young Black productivity coach with dark brown skin, a high-top swoop haircut, black rectangular glasses and a bright orange tank top',
    'tyler': 'a muscular young Black gym bro with dark skin, short black hair under a backwards red baseball cap, white earbuds and a charcoal tank top',
    'gordon': 'a cheerful ginger young man with freckles, a swooping red hairstyle, a green tank top and a gold chain',
    'brooke': 'a lifestyle influencer woman with fair skin, freckles, long straight blonde hair, pink-tinted sunglasses pushed up on her head, gold hoop earrings and a pink crop top',
    'jade': 'a fashion-haul influencer woman of East Asian descent with a sleek black bob haircut, gold hoop earrings and a light blue crop top',
    'sage': 'a wellness influencer woman with medium-brown skin, a neat dark hair bun and a lavender top, holding a small crystal',
    'luna': 'a glamorous Black influencer woman with dark skin, long pink-dyed hair, pink sunglasses on her head, gold hoops and a yellow crop top',
    'doug': 'a middle-aged news-junkie man with pale skin, messy gray-brown hair, glasses, dark bags under his eyes and an olive green hoodie',
    'priya': 'a South Asian woman with brown skin, long black hair, black headphones around her neck and a purple hoodie',
    'ray': 'a young Black man with dark skin, tired eyes with bags, wearing a navy blue hoodie with the hood up',
    'nell': 'a young woman with tan skin, curly dark hair under a maroon knit beanie, freckles and a teal hoodie',
    'dale': 'a worn-out man in his thirties with light skin, messy dark hair, stubble, eyebags and a soft periwinkle-blue hoodie, looking like he just woke up from a long dream',
    # Reply Row (Hot-Take Posters)
    'rex': 'a young man with olive skin, a spiky black undercut and a black hoodie printed with an angry red face, smirking like he just won an argument',
    'mona': 'a woman in her forties with light skin, a sharp gray-blond bob, red cat-eye glasses and a mustard cardigan over a "WELL ACTUALLY" t-shirt',
    'theo': 'a young man with brown skin, a neat beard, round glasses and a beret, wearing a tweed jacket like a debate club captain',
    'pat': 'a loud uncle in his sixties with ruddy light skin, a bald head with a gray horseshoe of hair, a gray mustache and a red flannel shirt',
    # Podcast Pier (Podcast Gurus)
    'bryce': 'a crypto podcast host with tan skin, slicked-back hair, a black turtleneck, studio headphones around his neck and a big black microphone in front of him',
    'sky': 'a wellness podcaster woman with dark brown skin, long box braids, a cream knit cardigan and gold studio headphones',
    'gus': 'a conspiracy podcaster with pale skin, a scraggly brown beard, a trucker cap and a camo vest, leaning toward a big microphone',
    'val': 'a long-form interview podcaster woman with light skin, a sleek dark ponytail, a blazer and big headphones, holding a coffee mug',
}

# ---------- the hero (all combinations from the creation screen) ----------
GENDERS = {
    'boy': 'a 12-year-old boy with short brown hair, wearing',
    'girl': 'a 12-year-old girl with a dark brown ponytail and long eyelashes, wearing',
    'nb': 'a 12-year-old kid with fluffy curly dark hair (gender-neutral), wearing',
}
SKINS = ['very fair skin', 'warm light-tan skin', 'medium brown skin', 'deep dark brown skin']
CAPS = [('red', 'yellow'), ('blue', 'orange'), ('green', 'lavender'), ('purple', 'mint green')]


def portrait(id_, desc, model='pro'):
    return {
        'id': f'portrait_{id_}', 'kind': 'portrait', 'model': model, 'out': f'portraits/{id_}.png',
        'steps': [
            {'prompt': PORTRAIT.format(style=STYLE, desc=desc, expr='a calm neutral expression', bg=BG)},
            {'prompt': HAPPY, 'edit': 0},
        ],
    }


ASSETS = []
for cid, desc in CHARACTERS.items():
    ASSETS.append(portrait(cid, desc))
for g, gdesc in GENDERS.items():
    for si, skin in enumerate(SKINS):
        for ci, (cap, hoodie) in enumerate(CAPS):
            desc = f'{gdesc} a {cap} baseball cap facing forward and a {hoodie} hoodie, with {skin}, curious brave eyes'
            ASSETS.append(portrait(f'hero_{g}_{si}_{ci}', desc, model='flash'))

# ---------- intro close-up panels (120x72) ----------
PANEL = ('{style}. A dramatic comic-book close-up panel, cinematic framing, no speech bubbles, no text. {desc}')
PANELS = {
    'cu_phone': 'Two hands of a kid in a hoodie holding a glowing smartphone in a dark bedroom at 3 AM; the screen shows an endless social media feed; cold blue light on the hands; everything else dark and desaturated',
    'cu_eyes_tired': 'Extreme close-up of a kid\'s tired half-closed eyes under a gray hood, dark bags under the eyes, the irises glowing screen-blue with a reflection of a phone feed, gray desaturated skin, dark room',
    'cu_window_a': 'Inside a dark bedroom looking at a rainy night window with a neon city outside; a wooden slingshot with a paper note tied to it is flying toward the glass from outside, motion lines',
    'cu_window_b': 'The same bedroom window exploding inward: glass shattering into glittering shards, a wooden slingshot with a paper note bursting through, frozen slow-motion moment, rainy neon city outside',
    'cu_hit_a': 'Slow-motion impact: a wooden slingshot smacking a glowing smartphone out of a kid\'s gray hands, bright yellow-white impact burst, motion lines',
    'cu_hit_b': 'A cracked dark smartphone tumbling through the air away from a kid\'s open startled hands, spin lines, a wooden slingshot falling nearby, dark bedroom',
    'cu_eyes_wide': 'Extreme close-up of a kid\'s eyes snapping wide open in surprise under a hood, irises still screen-blue, gray desaturated skin, dark room',
    'cu_eyes_color': 'Extreme close-up of a kid\'s eyes wide awake and full of wonder, warm brown irises with sparkling highlights, warm skin, a yellow hood, colors returning, gentle morning light',
    'cu_note': 'A crumpled paper note held in a kid\'s hand, the note reads "LOOK UP." in bold handwritten letters, warm morning light, a wooden slingshot beside it',
}
for pid, desc in PANELS.items():
    ASSETS.append({'id': pid, 'kind': 'panel', 'model': 'pro', 'aspect': '16:9', 'size': [120, 72], 'out': f'intro/{pid}.png', 'colors': 64,
                   'steps': [{'prompt': PANEL.format(style=STYLE, desc=desc)}]})

# ---------- menu backdrop & level cards ----------
ASSETS.append({'id': 'title_city', 'kind': 'title', 'model': 'pro', 'aspect': '16:9', 'size': [480, 270], 'out': 'ui/title_city.png', 'colors': 64,
               'steps': [{'prompt': f'{STYLE}. A wide side-view night city skyline seen from street level, tall buildings full of glowing cyan and magenta windows, huge billboards of smartphones and like-hearts, a deep purple sky with a few stars, the bottom fifth of the image is an empty dark street. No people, no text.'}]})
CARDS = {
    'card_hustle': 'A busy financial district at midday: glass bank towers, a golden bull statue, stock tickers, crypto ATMs, joggers in tank tops staring at phones',
    'card_aesthetic': 'A pastel shopping avenue at golden hour: pink cafes with striped awnings, selfie walls with angel wings, ring lights on tripods, influencers posing',
    'card_reply': 'An old-town square at dusk: cobblestones, a canal with little bridges, soapbox stages with megaphones, a debate hall with columns, people arguing at their phones',
    'card_scroll': 'A rainy city plaza at night: giant BREAKING news screens, flickering streetlights, hunched hooded figures lit by their phones, puddles reflecting red alerts',
    'card_pier': 'A beach boardwalk pier at sunset: podcast studios with ON AIR signs, a ferris wheel, surf shacks, sand and gentle waves, people talking into microphones',
    'card_feed': 'A dark neon plaza around an enormous screen with a single giant watching eye, a hooded black-pilled figure with glowing red eyes rising out of the screen, wilted flower beds',
}
for cid, desc in CARDS.items():
    ASSETS.append({'id': cid, 'kind': 'card', 'model': 'pro', 'aspect': '16:9', 'size': [190, 110], 'out': f'cards/{cid}.png', 'colors': 64,
                   'steps': [{'prompt': f'{STYLE}. A wide establishing shot, slightly top-down. {desc}. No text.'}]})

# ---------- building facades (64x48: 4 tiles wide, 3 tall) ----------
FACADE = ('{style}. The flat front elevation of one small {desc}, three stories tall, seen perfectly straight-on '
          '(orthographic, no perspective, no sky, no ground, no people), the building fills the whole frame edge to edge, '
          'ground floor with a door or shopfront. {bg}')
FACADES = {
    'hustle': ['glass bank tower lobby with a gold revolving door and gold trim', 'gym with treadmills visible in big windows and a neon dumbbell sign',
               'crypto exchange storefront with an orange coin logo and an LED price ticker', 'protein smoothie bar with green neon',
               'corporate office building with blue glass and a security desk in the lobby', 'luxury watch boutique with dark marble'],
    'aesthetic': ['pastel pink cafe with a striped pink-and-white awning and plants', 'boutique clothing store with mannequins in the window and a mint awning',
                  'selfie studio with ring lights and a neon angel-wings sign', 'matcha bar painted mint green with hanging ferns',
                  'flower-wall photo shop covered in pink roses', 'crystal and candle wellness shop in lavender'],
    'reply': ['old brick debate hall with stone columns and a red banner', 'cozy brick pub with a hanging wooden sign and warm windows',
              'old-town printing shop with stacks of newspapers in the window', 'small town hall with a clock tower top',
              'narrow half-timbered bookshop', 'kiosk-style newsagent building covered in posters'],
    'scroll': ['gray concrete TV news studio with big screens on the front', 'dark apartment block with blue-lit windows and air conditioners',
               'pawn shop with a roll-up metal shutter and graffiti', 'all-night laundromat with fluorescent lights',
               'convenience store with neon signs', 'tiny phone repair shop with cracked phones in the window'],
    'pier': ['beach podcast studio with a red ON AIR sign and sound panels', 'wooden surf shack with surfboards leaning on it',
             'boardwalk arcade with bright marquee lights', 'pastel ice cream parlor with a giant cone on top',
             'seafood shack with nets and buoys', 'lifeguard headquarters with a red cross and a flag'],
    'feed': ['giant dark data center with purple neon stripes', 'billboard tower building covered in ad screens',
             'server farm with blinking lights', 'gated influencer mansion with a neon logo',
             'ad agency glass box with magenta neon', 'black headquarters with a glowing eye logo'],
}
for theme, descs in FACADES.items():
    for i, d in enumerate(descs):
        ASSETS.append({'id': f'facade_{theme}_{i}', 'kind': 'facade', 'model': 'flash', 'aspect': '4:3', 'size': [64, 48], 'out': f'facades/{theme}_{i}.png',
                       'steps': [{'prompt': FACADE.format(style=STYLE, desc=d, bg=BG)}]})

# ---------- props: locked (gray city) and freed versions ----------
PROP = '{style}. A single game object seen from a top-down 3/4 view: {desc}. Centered, the whole object visible. {bg}'
FREED = ('Same object, same angle, same size and pixel-art style, but transformed into a happy, wholesome version: {desc}. '
         'Keep the plain magenta #FF00FF background.')
PROPS = {
    'fountain': ([32, 32], 'a round stone plaza fountain with a statue of a giant smartphone in the middle spraying cold blue light',
                 'clear sparkling water, flowers around the rim, a little bird bathing'),
    'foodtruck': ([48, 32], 'a food truck selling protein shakes with a neon PROTEIN menu board',
                  'now selling free lemonade, with balloons and a smiley sign'),
    'vending': ([16, 32], 'a tall vending machine full of energy drinks with a neon GRIND JUICE logo',
                'now full of books and fruit with a hand-written FREE BOOKS sign'),
    'soapbox': ([32, 32], 'a wooden soapbox stage with a megaphone and an angry red HOT TAKE sign',
                'a little open-mic stage with a guitar on a stool and potted flowers'),
    'ferris': ([64, 64], 'a ferris wheel whose gondolas are glowing phone screens, cold and empty',
               'a colorful ferris wheel with warm string lights and happy colored gondolas'),
    'lifeguard': ([32, 32], 'a gloomy lifeguard tower with a NO SIGNAL NO SWIM sign',
                  'a bright lifeguard tower with a striped umbrella and a beach towel'),
    'micstand': ([16, 32], 'a podcast microphone on a stand with a glowing red ON AIR light',
                 'the same microphone stand wrapped in climbing flowers'),
    'statue': ([32, 32], 'a bronze statue of a man staring down at his phone on a stone plinth',
               'the bronze statue now looking up at the sky with a little bird sitting on his head'),
    'flowercart': ([32, 32], 'a wooden flower cart full of plastic fake flowers with price tags',
                   'the cart overflowing with real fresh flowers and a FREE sign'),
    'arcade': ([16, 32], 'an arcade cabinet called SCROLL HERO with a cold glowing screen',
               'the arcade cabinet covered in friendly stickers with a 2 PLAYER sign'),
    'telescope': ([16, 32], 'a coin-operated pier telescope with a VIEW ADS sign',
                  'the telescope pointing at a sunset with a little heart sticker'),
    'deckchairs': ([32, 16], 'two beach deck chairs under an umbrella with phones left on them',
                   'two beach deck chairs with towels and open books under a striped umbrella'),
    'canalboat': ([32, 16], 'a small moored canal boat with a megaphone on it',
                  'a small canal boat full of flower pots'),
    'bikerack': ([32, 16], 'a bike rack with rental scooters plastered in ads',
                 'a bike rack with colorful bikes with flower baskets'),
}
for pid, (size, locked, freed) in PROPS.items():
    ASSETS.append({'id': f'prop_{pid}', 'kind': 'prop', 'model': 'flash', 'size': size, 'out': f'props/{pid}.png',
                   'aspect': '1:1' if size[0] == size[1] else ('3:2' if size[0] > size[1] else '2:3'),
                   'steps': [{'prompt': PROP.format(style=STYLE, desc=locked, bg=BG)}, {'prompt': FREED.format(desc=freed), 'edit': 0}]})
