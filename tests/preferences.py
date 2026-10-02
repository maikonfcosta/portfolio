"""Valida idiomas, temas e persistência na origem HTTP local."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from pathlib import Path
import json
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'docs' / 'evidence'

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def run():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(color_scheme='dark', reduced_motion='reduce', viewport={'width': 1440, 'height': 1000})
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(url)
            expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
            page.get_by_role('button', name='English', exact=True).click()
            expect(page.locator('html')).to_have_attribute('lang', 'en')
            expect(page.get_by_role('heading', level=1)).to_have_text('Maikon Costa')
            expect(page.locator('.hero-role')).to_contain_text('QA Lead')
            expect(page.locator('.hero-description')).to_have_text('I test software and investigate why it fails.')
            expect(page.locator('.case-story')).to_contain_text('ten most-used tags')
            expect(page.locator('.case-story code').first).to_have_text('/api/tags')
            expect(page.locator('.case-story code').last).to_have_text('?tag=')
            page.locator('summary').click()
            assert page.locator('details').evaluate('(node) => node.open')
            page.get_by_role('button', name='Português', exact=True).click()
            expect(page.locator('summary')).to_have_text('Decisões de engenharia')
            expect(page.locator('.case-story')).to_contain_text('dez tags mais usadas')
            assert page.locator('details').evaluate('(node) => node.open')
            page.get_by_role('button', name='English', exact=True).click()
            expect(page.locator('summary')).to_have_text('Engineering decisions')
            page.locator('summary').focus()
            page.keyboard.press('Enter')
            assert not page.locator('details').evaluate('(node) => node.open')
            expect(page.locator('.contact-actions .text-link').first).to_have_attribute('href', 'mailto:maikonfcosta@gmail.com?subject=QA%20opportunity')
            expect(page.get_by_role('heading', name='Quality strategy', exact=True)).to_be_visible()
            expect(page.locator('.about-copy')).to_contain_text('over eight years in automation')
            expect(page.locator('.timeline')).to_contain_text('seven days to one')
            expect(page.get_by_role('link', name='Send email')).to_be_visible()
            page.get_by_role('button', name='Personal', exact=True).click()
            expect(page.locator('.project-card:visible')).to_have_count(1)
            page.get_by_role('button', name='Português', exact=True).click()
            expect(page.locator('.project-card:visible')).to_have_count(1)
            expect(page.locator('#project-count')).to_have_text('01 projeto')
            page.get_by_role('button', name='English', exact=True).click()
            expect(page.locator('#project-count')).to_have_text('01 project')
            page.get_by_role('button', name='All', exact=True).click()
            page.get_by_role('button', name='Switch to light theme').click()
            expect(page.locator('html')).to_have_attribute('data-theme', 'light')
            page.reload()
            expect(page.locator('html')).to_have_attribute('lang', 'en')
            expect(page.locator('html')).to_have_attribute('data-theme', 'light')
            page.emulate_media(color_scheme='dark')
            expect(page.locator('html')).to_have_attribute('data-theme', 'light')
            for language in ['pt', 'en']:
                page.get_by_role('button', name='Português' if language == 'pt' else 'English', exact=True).click()
                for theme in ['light', 'dark']:
                    if page.locator('html').get_attribute('data-theme') != theme:
                        page.locator('.theme-toggle').click()
                    for width in [360, 390, 768, 1024, 1440]:
                        page.set_viewport_size({'width': width, 'height': 1000})
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (language, theme, width)
                    page.evaluate('document.fonts.ready')
                    page.evaluate('window.scrollTo(0,0)')
                    page.screenshot(path=str(EVIDENCE / f'{language}-{theme}-desktop.png'))
                    page.set_viewport_size({'width': 390, 'height': 844})
                    page.screenshot(path=str(EVIDENCE / f'{language}-{theme}-mobile.png'))
            page.get_by_role('button', name='English', exact=True).click()
            menu = page.get_by_role('button', name='Navigation menu')
            menu.click()
            expect(menu).to_have_attribute('aria-expanded', 'true')
            page.keyboard.press('Escape')
            expect(menu).to_have_attribute('aria-expanded', 'false')
            expect(menu).to_be_focused()
            assert page.evaluate("getComputedStyle(document.documentElement).scrollBehavior") == 'auto'
            assert page.locator('.reveal-pending').count() == 0
            fresh = browser.new_context(color_scheme='light')
            default_page = fresh.new_page()
            default_page.on('pageerror', lambda error: errors.append(str(error)))
            default_page.goto(url)
            expect(default_page.locator('html')).to_have_attribute('data-theme', 'light')
            default_page.emulate_media(color_scheme='dark')
            expect(default_page.locator('html')).to_have_attribute('data-theme', 'dark')
            assert default_page.locator('.reveal-pending').count() > 0
            default_page.locator('.project-card').first.scroll_into_view_if_needed()
            expect(default_page.locator('.project-card').first).not_to_have_class(__import__('re').compile('reveal-pending'))
            default_page.emulate_media(reduced_motion='reduce')
            expect(default_page.locator('.reveal-pending')).to_have_count(0)
            blocked = browser.new_context()
            blocked.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new Error('Unavailable')}})")
            blocked_page = blocked.new_page()
            blocked_page.on('pageerror', lambda error: errors.append(str(error)))
            blocked_page.goto(url)
            blocked_page.get_by_role('button', name='English', exact=True).click()
            expect(blocked_page.locator('html')).to_have_attribute('lang', 'en')
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    result = {'status': 'passed', 'checks': ['PT/EN full content', 'filter state across language', 'four language/theme combinations', '20 responsive combinations', 'persisted settings over HTTP', 'system theme', 'manual theme priority', 'keyboard and Escape in English', 'live reduced-motion change', 'unavailable storage fallback', 'no page errors']}
    (EVIDENCE / 'preferences-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=True))

if __name__ == '__main__':
    run()
