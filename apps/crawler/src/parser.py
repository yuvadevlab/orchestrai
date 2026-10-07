"""
apps/crawler/src/parser.py
HTML cleaning, metadata extraction, and Markdown transformation engine.
"""

import re
from typing import Any
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from markdownify import markdownify as md


class ParsedPage:
    """Structured representation of a parsed web document."""

    def __init__(
        self,
        url: str,
        title: str,
        markdown: str,
        links: list[str],
        metadata: dict[str, Any],
    ):
        self.url = url
        self.title = title
        self.markdown = markdown
        self.links = links
        self.metadata = metadata


def extract_metadata(soup: BeautifulSoup, base_url: str) -> dict[str, Any]:
    """Extracts standard OpenGraph, schema, and meta tag attributes."""
    metadata: dict[str, Any] = {"url": base_url}

    desc_tag = soup.find("meta", attrs={"name": "description"}) or soup.find(
        "meta", attrs={"property": "og:description"}
    )
    if desc_tag and desc_tag.get("content"):
        metadata["description"] = desc_tag["content"].strip()

    author_tag = soup.find("meta", attrs={"name": "author"})
    if author_tag and author_tag.get("content"):
        metadata["author"] = author_tag["content"].strip()

    return metadata


def parse_html_document(html_content: str, base_url: str) -> ParsedPage:
    """
    Strips noise, extracts metadata, converts clean body to Markdown, and gathers child links.

    Args:
        html_content: Raw HTML text from browser or HTTP fetch.
        base_url: Document URL used for resolving relative links.

    Returns:
        Structured ParsedPage instance.
    """
    soup = BeautifulSoup(html_content, "html.parser")

    # 1. Extract title
    title = soup.title.string.strip() if soup.title and soup.title.string else base_url

    # 2. Extract outbound links
    links: list[str] = []
    base_domain = urlparse(base_url).netloc

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        # Filter out javascript and anchor fragment links
        if href.startswith(("javascript:", "#", "mailto:")):
            continue

        resolved = urljoin(base_url, href)
        # Limit crawling scope to the same root domain
        if urlparse(resolved).netloc == base_domain:
            links.append(resolved)

    # 3. Clean document tree by stripping boilerplate elements
    for element in soup(
        ["script", "style", "nav", "footer", "aside", "noscript", "svg"]
    ):
        element.decompose()

    # 4. Extract metadata prior to Markdown conversion
    meta = extract_metadata(soup, base_url)

    # 5. Convert main body to clean Markdown
    body = soup.body or soup
    markdown_text = md(str(body), heading_style="ATX", strip=["img"])
    # Normalize excessive empty lines
    cleaned_markdown = re.sub(r"\n{3,}", "\n\n", markdown_text).strip()

    return ParsedPage(
        url=base_url,
        title=title,
        markdown=cleaned_markdown,
        links=list(set(links)),
        metadata=meta,
    )
