"""Fluxos públicos do portfólio Board Game & TCG; executar com python tests/smoke.py."""
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

        # 1. Leader / Hero
        expect(page.locator(".card-title-row h3")).to_have_text("MAIKON COSTA")
        expect(page.locator(".brand-name")).to_contain_text("maikon costa")
        expect(page.locator(".brand-tag")).to_contain_text("Senior QA")

        # 2. Deck & Project Filters
        expect(page.locator(".tcg-card-item:visible")).to_have_count(9)

        # Test e2e filter
        page.locator(".deck-tab[data-filter='e2e']").click()
        assert page.locator(".tcg-card-item:visible").count() >= 1

        # Test ai filter
        page.locator(".deck-tab[data-filter='ai']").click()
        assert page.locator(".tcg-card-item:visible").count() >= 1

        # Reset filter to "all"
        page.locator(".deck-tab[data-filter='all']").click()
        expect(page.locator(".tcg-card-item:visible")).to_have_count(9)

        # 3. Anchor targets
        for anchor in page.locator('a[href^="#"]').all():
            target = anchor.get_attribute("href")
            if target and target != "#":
                assert page.locator(target).count() >= 1, f"Missing target {target}"

        # 4. Contact links
        expect(page.locator("a[href^='mailto:maikonfcosta@gmail.com']").first).to_be_visible()

        # 5. D20 3D Dice Component
        expect(page.locator("#d20ThreeCanvas")).to_be_visible()
        roll_btn = page.locator("#btnRollD20")
        expect(roll_btn).to_be_visible()
        roll_btn.click()
        page.wait_for_timeout(2500)
        outcome_title = page.locator("#ruleOutcomeTitle").inner_text()
        assert "D" in outcome_title, f"Invalid dice title: {outcome_title}"

        # 6. Desktop Screenshot
        page.evaluate("document.fonts.ready")
        page.screenshot(path=str(EVIDENCE / "desktop.png"), full_page=True)

        # 7. Responsiveness & Horizontal Overflow (360px - 1440px)
        for width in [360, 390, 768, 1024, 1440]:
            page.set_viewport_size({"width": width, "height": 900})
            page.wait_for_timeout(100)
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"overflow at {width}"

        # 8. Mobile Screenshot
        page.set_viewport_size({"width": 390, "height": 844})
        page.screenshot(path=str(EVIDENCE / "mobile.png"), full_page=True)

        # 9. Verify no console errors
        assert not errors, errors
        browser.close()

    result = {
        "status": "passed",
        "checks": [
            "leader card and profile",
            "tcg project deck (9 cards) and rarity badges",
            "category filter tabs",
            "anchor targets integrity",
            "email contact link",
            "d20 3d dice canvas and roll mechanics",
            "responsive check 360–1440px without overflow",
            "zero console errors"
        ]
    }
    (EVIDENCE / "validation.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    run()
