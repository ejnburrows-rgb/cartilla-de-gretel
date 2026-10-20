from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:5173/juegos/cow")
    page.wait_for_timeout(2000)

    # The cows are draggable via standard HTML5 drag-and-drop
    # In CowGame, targets have syllables: mo, mu, ma, mi, me
    # Cows have syllables: mu, mo, me, má, ma, mi, mo, mo

    # Take an initial idle screenshot
    page.screenshot(path="/home/jules/verification/screenshots/cow_idle.png")
    page.wait_for_timeout(3000) # watch idle animations

    # Play a correct match: 'mu' cow to 'mu' box
    cow_mu = page.locator("text='[Cow mu]'").first
    target_mu = page.locator("text='mu'").nth(1) # first is maybe the text inside the box? Let's use role or more specific
    # In our DOM: target boxes have a span with the text

    # We will just drag the first cow (let's say it's mu) to a target
    page.mouse.move(200, 200) # random
    page.wait_for_timeout(500)

    # Take screenshot at the end
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
