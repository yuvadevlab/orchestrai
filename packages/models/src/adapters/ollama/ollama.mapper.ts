/**
 * @file packages/models/src/adapters/ollama/ollama.mapper.ts
 * @description Message converter mapping OrchestrAI's AIMessage to Ollama's wire format.
 *
 * ─── Multimodal in Ollama (Learning note for AI Engineers) ─────────
 * Different LLM providers structure multimodal (vision/image) requests differently:
 *
 * 1. OpenAI / Anthropic:
 *    Embed content blocks directly inside `content`:
 *    `content: [{ type: "text", text: "..." }, { type: "image_url", ... }]`
 *
 * 2. Ollama:
 *    Keeps `content` as a plain string, and provides a separate `images` array
 *    on the message object containing Base64-encoded strings:
 *    `{ role: "user", content: "What is this?", images: ["<base64_data>"] }`
 *
 * This pure mapper inspects incoming `AIMessage` objects:
 * - If `content` is a string -> passes it directly.
 * - If `content` is an array of `ContentBlock` -> extracts all `text` blocks into
 *   a combined string, and extracts all `image` blocks (base64) into the `images` array.
 * ───────────────────────────────────────────────────────────────────
 */

import type {
  AIMessage,
  ContentBlock,
  ImageContentBlock,
  TextContentBlock,
} from "@orchestrai/core";

/**
 * Shape of a message expected by Ollama's chat endpoint.
 */
export interface OllamaWireMessage {
  /** Chat role: 'system', 'user', or 'assistant' */
  role: string;
  /** Text content of the message */
  content: string;
  /** Optional array of Base64-encoded image strings for vision models */
  images?: string[];
}

/**
 * Type guard checking whether a content block is a TextContentBlock.
 *
 * @param block - Any discriminated ContentBlock
 * @returns True if the block is a text block
 */
function isTextBlock(block: ContentBlock): block is TextContentBlock {
  return block.type === "text";
}

/**
 * Type guard checking whether a content block is an ImageContentBlock.
 *
 * @param block - Any discriminated ContentBlock
 * @returns True if the block is an image block
 */
function isImageBlock(block: ContentBlock): block is ImageContentBlock {
  return block.type === "image";
}

/**
 * Converts OrchestrAI AIMessage array into Ollama's expected wire format.
 * Correctly extracts both text content and base64 images for multimodal vision models.
 *
 * @param messages - Array of OrchestrAI AIMessage objects
 * @returns Array of OllamaWireMessage objects ready for Ollama's chat API
 */
export function toOllamaMessages(messages: AIMessage[]): OllamaWireMessage[] {
  return messages.map((msg): OllamaWireMessage => {
    // Case 1: Simple string content (no multimodal blocks)
    if (typeof msg.content === "string") {
      return {
        role: msg.role,
        content: msg.content,
      };
    }

    // Case 2: Array of ContentBlock (multimodal / rich content)
    // Extract and concatenate all text blocks
    const textContent = msg.content
      .filter(isTextBlock)
      .map((block) => block.text)
      .join("");

    // Extract all image payloads (Ollama expects raw base64 strings)
    const images = msg.content.filter(isImageBlock).map((block) => {
      // Strip data URI prefix if present (e.g., "data:image/png;base64,")
      const commaIndex = block.data.indexOf(",");
      if (block.data.startsWith("data:") && commaIndex !== -1) {
        return block.data.slice(commaIndex + 1);
      }
      return block.data;
    });

    const wireMessage: OllamaWireMessage = {
      role: msg.role,
      content: textContent,
    };

    // Only attach the images array if there are images present
    if (images.length > 0) {
      wireMessage.images = images;
    }

    return wireMessage;
  });
}
