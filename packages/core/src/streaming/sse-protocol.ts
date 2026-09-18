/**
 * @file packages/core/src/streaming/sse-protocol.ts
 * @description Server-Sent Events (SSE) serialization and framing utilities.
 */

/**
 * Encapsulated SSE message structure.
 */
export interface SSEMessage {
  readonly event: string;
  readonly data: unknown;
  readonly id?: string;
  readonly retry?: number;
}

/**
 * Formats a message into a standard text/event-stream wire payload.
 *
 * @param message - The structured SSE message definition.
 * @returns Formatted SSE string chunk with trailing double newline.
 */
export function formatSSEMessage(message: SSEMessage): string {
  const lines: string[] = [];

  // Add event identifier line if provided
  if (message.event) {
    lines.push(`event: ${message.event}`);
  }

  // Add message tracking ID if provided
  if (message.id) {
    lines.push(`id: ${message.id}`);
  }

  // Add reconnection retry recommendation if provided
  if (message.retry !== undefined) {
    lines.push(`retry: ${message.retry}`);
  }

  // Serialize payload to JSON if not already a string
  const serializedData =
    typeof message.data === "string" ? message.data : JSON.stringify(message.data);

  // SSE protocol mandates a 'data: ' prefix for every line of payload
  const dataLines = serializedData.split("\n");
  for (const line of dataLines) {
    lines.push(`data: ${line}`);
  }

  // SSE frames terminate with a blank line (\n\n)
  return `${lines.join("\n")}\n\n`;
}

/**
 * Parses a raw single SSE frame into an SSEMessage object.
 *
 * @param raw - The raw text received from an SSE stream.
 * @returns Parsed SSEMessage or null if raw text does not contain valid event data.
 */
export function parseSSEMessage(raw: string): SSEMessage | null {
  const trimmed = raw.trim();

  // Guard against empty frames or heartbeat ping lines
  if (!trimmed || trimmed.startsWith(":")) {
    return null;
  }

  const lines = trimmed.split("\n");
  let event = "message";
  let id: string | undefined;
  let retry: number | undefined;
  const dataChunks: string[] = [];

  for (const line of lines) {
    // Extract event type
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      continue;
    }

    // Extract message ID
    if (line.startsWith("id:")) {
      id = line.slice(3).trim();
      continue;
    }

    // Extract retry timeout
    if (line.startsWith("retry:")) {
      const parsedRetry = parseInt(line.slice(6).trim(), 10);
      if (!isNaN(parsedRetry)) {
        retry = parsedRetry;
      }
      continue;
    }

    // Extract data payload line
    if (line.startsWith("data:")) {
      dataChunks.push(line.slice(5).trim());
    }
  }

  // If no data was accumulated, frame is not a valid payload message
  if (dataChunks.length === 0) {
    return null;
  }

  const joinedData = dataChunks.join("\n");
  let parsedData: unknown = joinedData;

  // Attempt JSON parsing; fallback to raw string if not JSON
  try {
    parsedData = JSON.parse(joinedData);
  } catch {
    // Retain plain string content when parsing as JSON fails
    parsedData = joinedData;
  }

  return {
    event,
    data: parsedData,
    id,
    retry,
  };
}
