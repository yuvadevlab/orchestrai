"""
apps/crawler/src/crawler.py
Breadth-first crawler executing recursive link traversal within domain scope boundaries.
"""

import logging
from collections import deque

from .browser import browser_manager
from .config import settings
from .parser import ParsedPage, parse_html_document

logger = logging.getLogger(__name__)


class WebCrawler:
    """
    Asynchronous web crawler traversing domain hierarchies with depth and page bounds.
    """

    async def crawl(
        self,
        start_url: str,
        max_depth: int | None = None,
        max_pages: int | None = None,
    ) -> list[ParsedPage]:
        """
        Crawls starting from `start_url` up to configured depth and page limits.

        Args:
            start_url: Root starting URL.
            max_depth: Maximum link hop depth (defaults to settings.max_crawl_depth).
            max_pages: Maximum documents to visit (defaults to settings.max_pages_per_crawl).

        Returns:
            List of successfully parsed ParsedPage records.
        """
        depth_limit = max_depth if max_depth is not None else settings.max_crawl_depth
        page_limit = (
            max_pages if max_pages is not None else settings.max_pages_per_crawl
        )

        visited: set[str] = set()
        queue: deque[tuple[str, int]] = deque([(start_url, 0)])
        results: list[ParsedPage] = []

        while queue and len(visited) < page_limit:
            current_url, current_depth = queue.popleft()

            # Skip already visited pages or normalization variants
            normalized_url = current_url.rstrip("/")
            if normalized_url in visited:
                continue

            visited.add(normalized_url)

            try:
                raw_html, _ = await browser_manager.fetch_page_content(current_url)
                parsed = parse_html_document(raw_html, current_url)
                results.append(parsed)

                # Queue child links if still within depth bounds
                if current_depth < depth_limit:
                    for link in parsed.links:
                        if link.rstrip("/") not in visited:
                            queue.append((link, current_depth + 1))
            except Exception as exc:  # noqa: BLE001
                # Log non-fatal crawl fetch errors and continue traversal
                logger.warning("Crawl fetch failed for %s: %s", current_url, exc)
                continue

        return results


crawler = WebCrawler()
