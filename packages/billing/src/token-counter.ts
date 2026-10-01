/**
 * @file packages/billing/src/token-counter.ts
 * @description Fast token estimation and counting engine for LLM prompts and completions.
 * @module @orchestrai/billing
 */

/**
 * Token counting utility providing heuristic and whitespace tokenization.
 */
export class TokenCounter {
  /** Average number of characters per token in standard LLM tokenizers (tiktoken / BPE) */
  private readonly charsPerToken: number;

  constructor(charsPerToken = 4.0) {
    this.charsPerToken = Math.max(1.0, charsPerToken);
  }

  /**
   * Counts or estimates tokens within a plain text string.
   *
   * @param text - Input text content
   * @returns Approximated token count
   */
  public countTextTokens(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }
    return Math.ceil(text.length / this.charsPerToken);
  }

  /**
   * Counts tokens across structured chat messages including overhead formatting.
   *
   * @param messages - Array of message objects containing content
   * @returns Total aggregate token count
   */
  public countMessageTokens(messages: readonly { content?: string; role?: string }[]): number {
    let count = 0;
    // Base formatting overhead per message (e.g. <|im_start|>role\ncontent<|im_end|>)
    const perMessageOverhead = 4;

    for (const msg of messages) {
      count += perMessageOverhead;
      if (msg.role) {
        count += this.countTextTokens(msg.role);
      }
      if (msg.content) {
        count += this.countTextTokens(msg.content);
      }
    }

    return count;
  }
}
