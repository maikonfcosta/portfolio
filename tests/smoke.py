"""Fluxos públicos do portfólio; executar com python tests/smoke.py."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / "index.html").as_uri()
EVIDENCE = ROOT / "docs" / "evidence"

def run():
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(URL)
        expect(page.get_by_role("heading", level=1)).to_have_text("Maikon Costa")
        expect(page.locator('.hero-role')).to_contain_text('QA Lead')
        assert page.locator('.work-preview img').evaluate('(img) => img.complete && img.naturalWidth > 0')
        expect(page.get_by_role("button", name="Menu de navegação")).to_be_hidden()
        expect(page.locator(".project-card:visible")).to_have_count(4)
        page.get_by_role("button", name="Pessoais", exact=True).click()
        expect(page.locator(".project-card:visible")).to_have_count(1)
        expect(page.get_by_role("heading", name="TrackFit PRO")).to_be_visible()
        page.get_by_role("button", name="QA & automação", exact=True).click()
        expect(page.locator(".project-card:visible")).to_have_count(3)
        page.get_by_role("button", name="Todos", exact=True).click()
        for anchor in page.locator('a[href^="#"]').all():
            target = anchor.get_attribute("href")
            assert page.locator(target).count() == 1, target
        expect(page.get_by_role("link", name="Enviar e-mail")).to_have_attribute("href", "mailto:maikonfcosta@gmail.com")
        page.locator("body").click(position={"x": 2, "y": 2})
        page.evaluate("document.fonts.ready")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(EVIDENCE / "desktop.png"), full_page=True)
        page.screenshot(path=str(EVIDENCE / "desktop-preview.png"))
        for width in [360, 390, 768, 1024, 1440]:
            page.set_viewport_size({"width": width, "height": 900})
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"overflow at {width}"
        page.set_viewport_size({"width": 390, "height": 844})
        menu = page.get_by_role("button", name="Menu de navegação")
        menu.click()
        expect(menu).to_have_attribute("aria-expanded", "true")
        page.keyboard.press("Escape")
        expect(menu).to_have_attribute("aria-expanded", "false")
        expect(menu).to_be_focused()
        menu.click()
        page.get_by_role("navigation").get_by_role("link", name="Projetos", exact=True).click()
        expect(menu).to_have_attribute("aria-expanded", "false")
        page.goto(URL)
        page.screenshot(path=str(EVIDENCE / "mobile.png"), full_page=True)
        page.keyboard.press("Tab")
        expect(page.get_by_role("link", name="Pular para o conteúdo")).to_be_focused()
        assert page.evaluate("getComputedStyle(document.documentElement).scrollBehavior") == "auto"
        assert not errors, errors
        no_js = browser.new_page(java_script_enabled=False, viewport={"width": 390, "height": 844})
        no_js.goto(URL)
        expect(no_js.locator(".project-card:visible")).to_have_count(4)
        expect(no_js.get_by_role("navigation").get_by_role("link", name="Projetos", exact=True)).to_be_visible()
        no_js.close()
        browser.close()
    result = {"status": "passed", "checks": ["project filters", "anchor targets", "contact", "responsive 360–1440", "mobile menu and Escape", "keyboard skip link", "reduced motion", "no JavaScript fallback", "no page errors"]}
    (EVIDENCE / "validation.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    run()
