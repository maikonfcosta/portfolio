"""Auditoria automatizada complementar. axe-core 4.10.3 vem da fonte oficial."""
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
        page = browser.new_page(color_scheme='dark', reduced_motion='reduce', viewport={'width': 1440, 'height': 1000})
        page.goto((ROOT / 'index.html').as_uri())
        page.add_script_tag(content=axe)
        for language in ['pt', 'en']:
            page.get_by_role('button', name='Português' if language == 'pt' else 'English', exact=True).click()
            for theme in ['dark', 'light']:
                if page.locator('html').get_attribute('data-theme') != theme:
                    page.locator('.theme-toggle').click()
                for width in [390, 1440]:
                    page.set_viewport_size({'width': width, 'height': 1000})
                    result = page.evaluate("axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21aa']}})")
                    report = {'language': language, 'theme': theme, 'width': width, 'violations': result['violations'], 'incomplete': [{'id': item['id'], 'nodes': len(item['nodes'])} for item in result['incomplete']], 'passed_rules': len(result['passes'])}
                    reports.append(report)
        browser.close()
    output = {'axe_version': '4.10.3', 'source': AXE_URL, 'reports': reports}
    (ROOT / 'docs/evidence/accessibility.json').write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding='utf-8')
    violations = [(r['language'], r['theme'], r['width'], [v['id'] for v in r['violations']]) for r in reports if r['violations']]
    assert not violations, violations
    print('axe-core: 8 combinations; no automated WCAG A/AA violations. Manual review still required.')

if __name__ == '__main__':
    run()
