"""Auditoria automatizada de acessibilidade com axe-core 4.10.3 (WCAG 2.1 AA)."""
from pathlib import Path
from urllib.request import urlopen
from io import BytesIO
import tarfile
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
AXE_URL = 'https://registry.npmjs.org/axe-core/-/axe-core-4.10.3.tgz'

def run():
    with urlopen(AXE_URL, timeout=30) as response:
        archive_bytes = response.read()
    with tarfile.open(fileobj=BytesIO(archive_bytes), mode='r:gz') as archive:
        axe = archive.extractfile('package/axe.min.js').read().decode('utf-8')

    reports = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in [390, 1440]:
            page = browser.new_page(color_scheme='dark', reduced_motion='reduce', viewport={'width': width, 'height': 900})
            page.goto((ROOT / 'index.html').as_uri())
            page.add_script_tag(content=axe)
            result = page.evaluate("axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21aa','best-practice']}})")
            report = {
                'width': width,
                'violations': result['violations'],
                'passes': len(result['passes']),
                'incomplete': len(result['incomplete'])
            }
            reports.append(report)
            page.close()
        browser.close()

    evidence_dir = ROOT / 'docs' / 'evidence'
    evidence_dir.mkdir(parents=True, exist_ok=True)
    output = {'axe_version': '4.10.3', 'source': AXE_URL, 'reports': reports}
    (evidence_dir / 'accessibility.json').write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding='utf-8')

    violations = [(r['width'], [v['id'] for v in r['violations']]) for r in reports if r['violations']]
    assert not violations, f"Axe violations detected: {violations}"
    print(f"axe-core 4.10.3: mobile e desktop auditados. 0 violações WCAG A/AA/2.1 e Best Practices.")

if __name__ == '__main__':
    run()
