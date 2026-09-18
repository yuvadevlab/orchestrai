/**
 * @file packages/core/src/events/event-type.schema.ts
 * @description Master catalog of lifecycle domain events emitted by the platform.
 */

import { z } from "zod";
import { DomainEventType } from "@orchestrai/shared-types";

/**
 * Enumeration of all domain lifecycle events backed by DomainEventType enum.
 */
export const DomainEventTypeSchema = z
  .nativeEnum(DomainEventType)
  .describe("Type identifier for platform domain lifecycle events");
