"""
apps/crawler/src/crawler.py
Breadth-first crawler executing recursive link traversal within domain scope boundaries.
"""

from collections import deque
from typing import Optional
from .browser import browser_manager
from .parser import parse_html_document, ParsedPage
from .config import settings


class WebCrawler:
    """
    Asynchronous web crawler traversing domain hierarchies with depth and page bounds.
    """

    async def crawl(
        self,
        start_url: str,
        max_depth: Optional[int] = None,
        max_pages: Optional[int] = None,
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
        page_limit = max_pages if max_pages is not None else settings.max_pages_per_crawl

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
            except Exception:
                # Log non-fatal crawl fetch errors and continue traversal
                continue

        return results


crawler = WebCrawler()
