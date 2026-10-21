from playwright.sync_api import sync_playwright
import time
import os

def run():
    output_dir = "docs/proofs/completar-palabras-no-mascot-2026-10-20"
    os.makedirs(output_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the game
        print("Navigating to the game...")
        page.goto("http://localhost:5173/cartilla/juego/completar-palabras")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Take screenshot of the entrance screen
        print("Taking entrance screen screenshot...")
        page.screenshot(path=f"{output_dir}/01-entrance.png", full_page=True)

        # Click the 'm' button
        print("Clicking 'm' button...")
        button = page.get_by_role("button", name="M m")
        button.click()

        # Wait a bit for the activity screen to render
        time.sleep(2)

        # Take screenshot of the activity screen
        print("Taking activity screen screenshot...")
        page.screenshot(path=f"{output_dir}/02-activity.png", full_page=True)

        browser.close()
        print("Done!")

if __name__ == "__main__":
    run()
