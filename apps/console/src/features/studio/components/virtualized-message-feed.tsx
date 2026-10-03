"use client";

/**
 * @file apps/console/src/features/studio/components/virtualized-message-feed.tsx
 * @description Virtualized chat message list with intent-aware scroll pinning.
 * Automatically unpins when user scrolls up, showing a "New output streaming below ↓" pill.
 * @module apps/console/features/studio/components
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown } from "lucide-react";
import { UI_COPY } from "@/lib/ui-copy";
import type { CoworkMessage } from "../types";
import { StudioMessageItem } from "./studio-message-item";

export interface VirtualizedMessageFeedProps {
  messages: CoworkMessage[];
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  bottomSentinelRef?: React.RefObject<HTMLDivElement | null>;
}

/** Threshold in pixels from bottom considered "pinned" */
const SCROLL_BOTTOM_THRESHOLD_PX = 100;

export function VirtualizedMessageFeed({
  messages,
  chatScrollRef,
  bottomSentinelRef,
}: VirtualizedMessageFeedProps): React.JSX.Element {
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);
  const [hasNewContentBelow, setHasNewContentBelow] = useState(false);
  const prevMessagesCountRef = useRef(messages.length);

  // Setup TanStack Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => chatScrollRef.current,
    estimateSize: () => 140,
    overscan: 5,
  });

  /**
   * Scrolls smoothly to the latest message item at the bottom and re-pins.
   */
  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsPinnedToBottom(true);
      setHasNewContentBelow(false);
    }
  }, [chatScrollRef]);

  /**
   * Evaluates user scroll offset to detect intent-aware scroll unpinning.
   */
  const handleScroll = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD_PX;

    // User scrolled back to bottom: re-pin and dismiss pill
    if (isAtBottom) {
      setIsPinnedToBottom(true);
      setHasNewContentBelow(false);
    } else {
      // User explicitly scrolled up: unpin auto-scroll
      setIsPinnedToBottom(false);
    }
  }, [chatScrollRef]);

  // Attach native scroll listener to track user intent
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [chatScrollRef, handleScroll]);

  // Handle incoming messages / token arrivals
  useEffect(() => {
    const isCountIncreased = messages.length > prevMessagesCountRef.current;
    prevMessagesCountRef.current = messages.length;

    if (isPinnedToBottom) {
      // If pinned, stay pinned to bottom
      scrollToBottom();
    } else if (isCountIncreased) {
      // If unpinned and new messages arrived, prompt user with floating indicator
      setHasNewContentBelow(true);
    }
  }, [messages, isPinnedToBottom, scrollToBottom]);

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col">
      {/* Virtualized Container */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index];
          if (!message) return null;

          return (
            <div
              key={message.id || virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <StudioMessageItem message={message} />
            </div>
          );
        })}
      </div>

      {/* Sentinel for bottom bounds */}
      <div ref={bottomSentinelRef} aria-hidden className="h-2 shrink-0" />

      {/* Floating Intent-Aware Pill when user has scrolled up and new tokens arrived */}
      {hasNewContentBelow && (
        <div className="pointer-events-none sticky bottom-6 z-30 flex justify-center">
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label={UI_COPY.STUDIO.FEED.NEW_OUTPUT_A11Y}
            className="bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span>{UI_COPY.STUDIO.FEED.NEW_OUTPUT_STREAMING}</span>
            <ArrowDown className="size-3.5 animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
}
