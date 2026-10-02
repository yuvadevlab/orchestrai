"""
apps/crawler/src/browser.py
Headless browser automation manager using Playwright with graceful HTTP fallback.
"""

from typing import Optional
import httpx
from .config import settings

# Attempt playwright import; fallback to httpx if browser binaries are not installed
try:
    from playwright.async_api import async_playwright, Browser, Playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


class BrowserManager:
    """
    Manages browser lifecycle, tab isolation, and JavaScript DOM execution.
    """

    def __init__(self):
        self._playwright: Optional[Playwright] = None
        self._browser: Optional[Browser] = None

    async def initialize(self) -> None:
        """Starts Playwright async process if library is installed."""
        if PLAYWRIGHT_AVAILABLE and not self._browser:
            try:
                self._playwright = await async_playwright().start()
                self._browser = await self._playwright.chromium.launch(
                    headless=settings.headless,
                    args=["--no-sandbox", "--disable-dev-shm-usage"],
                )
            except Exception:
                # Browser binaries may need 'playwright install'
                self._browser = None

    async def close(self) -> None:
        """Terminates browser and playwright subprocesses cleanly."""
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None

    async def fetch_page_content(self, url: str) -> tuple[str, Optional[bytes]]:
        """
        Loads a page URL and retrieves the evaluated DOM HTML and optional screenshot.
        
        Args:
            url: Target web page URL.
            
        Returns:
            Tuple of (html_string, screenshot_bytes_or_none).
        """
        # 1. Use Playwright for full client-side JavaScript execution if available
        if self._browser:
            context = await self._browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 800},
            )
            page = await context.new_page()
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=settings.timeout_ms)
                content = await page.content()
                screenshot = await page.screenshot(type="png")
                return content, screenshot
            finally:
                await context.close()

        # 2. Resilient HTTP fallback if Playwright browser is not initialized
        async with httpx.AsyncClient(
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            },
            follow_redirects=True,
            timeout=float(settings.timeout_ms) / 1000.0,
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.text, None


browser_manager = BrowserManager()
