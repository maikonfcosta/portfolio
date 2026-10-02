"""Gera estudos de cor usando a página real, sem alterar o portfólio principal."""
from pathlib import Path
from html import escape
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
SOURCE = (ROOT.parent / 'index.html').read_text(encoding='utf-8')
PALETTES = [
    ('jade', 'Grafite + jade', 'Técnico, discreto e próximo da sua identidade atual.', {
        'dark': ['#111715', '#1b2520', '#16201b', '#eff5f0', '#adbbb1', '#91d5ae', '#394d40', '#10291d'],
        'light': ['#f6f8f3', '#eaf0e6', '#f0f4ec', '#182b22', '#52665a', '#246444', '#c5d2c4', '#ffffff'],
    }),
    ('petroleo', 'Azul-petróleo + ciano', 'Sóbrio e preciso, com uma presença mais corporativa.', {
        'dark': ['#0e1920', '#182831', '#132129', '#eef5f7', '#a8bdc7', '#83d1e2', '#344f5d', '#102c35'],
        'light': ['#f3f7f9', '#e6eef3', '#edf3f6', '#152c39', '#4f6573', '#176379', '#c2d2db', '#ffffff'],
    }),
    ('ambar', 'Carvão + âmbar', 'Autoral e acolhedor, com um toque de terminal vintage.', {
        'dark': ['#1a1713', '#28231c', '#211c16', '#f7f1e7', '#c0b4a3', '#e7bd79', '#534535', '#30220e'],
        'light': ['#faf6ed', '#f0e8d9', '#f5efe3', '#30271c', '#71604a', '#885618', '#d7c8af', '#ffffff'],
    }),
    ('violeta', 'Ardósia + violeta', 'Criativo e tecnológico, com lavanda discreta e fundos neutros.', {
        'dark': ['#17161d', '#24222d', '#1d1b25', '#f3f0f8', '#bbb4ca', '#b9a3ec', '#494154', '#251a3a'],
        'light': ['#f7f5fa', '#eeebf4', '#f2eff7', '#2c233c', '#665c76', '#6945a5', '#d4cbdf', '#ffffff'],
    }),
    ('coral', 'Basalto + coral', 'Expressivo e humano, com coral suave no escuro e terracota no claro.', {
        'dark': ['#1b1717', '#2a2221', '#221c1b', '#f8efec', '#c5b2ad', '#efa294', '#55413e', '#351c17'],
        'light': ['#fcf6f2', '#f3e7df', '#f8eee8', '#342520', '#785d52', '#a14632', '#dfc9bf', '#ffffff'],
    }),
    ('cobalto', 'Grafite + cobalto', 'Limpo e contemporâneo, com azul marcante e superfícies neutras.', {
        'dark': ['#14171d', '#202631', '#1a1f28', '#eef2fa', '#b1bbcc', '#9cbcff', '#3d485c', '#162749'],
        'light': ['#f6f8fc', '#e9eef8', '#f0f3fa', '#202c44', '#566681', '#315db3', '#c8d3e8', '#ffffff'],
    }),
]
TOKENS = ['bg', 'surface', 'surface-alt', 'text', 'muted', 'accent', 'line', 'ink']

def contrast(fg, bg):
    def luminance(color):
        channels = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
        linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in channels]
        return sum(c * w for c, w in zip(linear, [.2126, .7152, .0722]))
    lo, hi = sorted([luminance(fg), luminance(bg)])
    return (hi + .05) / (lo + .05)

def generate():
    panels, checks = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        for slug, title, description, themes in PALETTES:
            for theme, values in themes.items():
                name = f'{slug}-{theme}'
                label = 'Escuro' if theme == 'dark' else 'Claro'
                colors = dict(zip(TOKENS, values))
                rules = ';'.join(f'--{key}:{value}' for key, value in colors.items())
                css = f':root{{color-scheme:{theme};{rules}}}\n'
                # As ilustrações usam superfícies e textos do tema para manter contraste.
                css += '.project-art{background-color:var(--surface);background-image:none}.suite-flow>span,.classifier-lines>span,.triage-visual>span,.fit-visual b,.fit-bars{border-color:var(--line)}.fit-visual b,.triage-visual>b,.code-key{color:var(--accent)}.fit-bars i,.signal-square,.classifier-lines>span:nth-child(2) .signal-square,.classifier-lines>span:nth-child(3) .signal-square{background:var(--accent)}.fit-bars i:nth-child(7){background:var(--accent)}\n'
                (ROOT / f'{name}.css').write_text(css, encoding='utf-8')
                html = SOURCE.replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/')
                html = html.replace('</head>', f'<link rel="stylesheet" href="{name}.css"></head>')
                html = html.replace('<meta name="theme-color" content="#101412">', f'<meta name="theme-color" content="{colors["bg"]}">')
                html = html.replace('<title>Maikon Costa · QA, automação & consultoria</title>', f'<title>{title} / {label} — estudo de cor</title>')
                (ROOT / f'{name}.html').write_text(html, encoding='utf-8')
                page.goto((ROOT / f'{name}.html').as_uri(), wait_until='load')
                page.evaluate('Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))])')
                page.screenshot(path=str(ROOT / f'{name}.png'), animations='disabled')
                for width in [390, 1440]:
                    page.set_viewport_size({'width': width, 'height': 1000})
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), name
                for foreground, background in [('text', 'bg'), ('muted', 'surface'), ('accent', 'bg'), ('ink', 'accent')]:
                    ratio = contrast(colors[foreground], colors[background])
                    assert ratio >= 4.5, (name, foreground, background, ratio)
                    checks.append({'palette': name, 'pair': f'{foreground}/{background}', 'contrast': round(ratio, 2)})
                swatches = ''.join(f'<span class="swatch" style="background:{colors[key]}" title="{key}: {colors[key]}"></span>' for key in ['bg', 'surface', 'accent'])
                panels.append(f'<article class="preview-card"><header><div><h2>{escape(title)}</h2><p>{escape(description)}</p></div><span class="mode">{label}</span></header><a class="image-link" href="{name}.html" aria-label="Abrir {escape(title)} em tema {label.lower()}"><img src="{name}.png" width="1440" height="1000" alt="Prévia do portfólio com {escape(title)} em tema {label.lower()}" loading="lazy"></a><footer><div class="swatches">{swatches}<span>{colors["accent"].upper()}</span></div><a href="{name}.html">Explorar página completa ↗</a></footer></article>')
        browser.close()
    overview = '''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Maikon Costa — estudos de cor</title><link rel="stylesheet" href="comparison.css"></head><body><main><div class="intro"><p class="eyebrow">MAIKON COSTA / DIREÇÃO VISUAL</p><h1>Uma identidade.<br>Três caminhos de cor.</h1><p>Compare a mesma composição em seis versões. Clique em uma prévia para explorar a página inteira.</p><div class="notes"><span>01 · Grafite + jade</span><span>02 · Azul-petróleo + ciano</span><span>03 · Carvão + âmbar</span></div></div><div class="preview-grid">''' + ''.join(panels) + '''</div><p class="closing">Estudos de paleta: o idioma e os controles de tema serão implementados após a escolha visual.</p><a class="original-link" href="../index.html">Abrir portfólio atual ↗</a></main></body></html>'''
    overview = overview.replace('Três caminhos de cor.', 'Seis caminhos de cor.').replace('em seis versões.', 'em doze versões.')
    notes_start = overview.index('<div class="notes">')
    notes_end = overview.index('</div>', notes_start) + len('</div>')
    notes = '<div class="notes">' + ''.join(f'<span>{i:02d} · {escape(title)}</span>' for i, (_, title, _, _) in enumerate(PALETTES, 1)) + '</div>'
    overview = overview[:notes_start] + notes + overview[notes_end:]
    (ROOT / 'index.html').write_text(overview, encoding='utf-8')
    (ROOT / 'validation.json').write_text(json.dumps({'status': 'passed', 'versions': len(panels), 'viewports': [390, 1440], 'contrast': checks}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(panels)} previews generated. Responsive and {len(checks)} contrast checks passed.')

if __name__ == '__main__':
    generate()
