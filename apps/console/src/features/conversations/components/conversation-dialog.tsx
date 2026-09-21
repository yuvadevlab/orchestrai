"use client";

/**
 * @file conversation-dialog.tsx
 * @description Dedicated modal dialog component for starting conversation sessions.
 * @module apps/console/features/conversations/components
 */

import React from "react";
import { FormDialog } from "@/components/ui";
import { CONVERSATION_FIELDS } from "./conversation-form-fields";

export interface ConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

/**
 * Modal dialog for creating a new conversation thread session.
 */
export function ConversationDialog({
  isOpen,
  onClose,
  onSuccess,
}: ConversationDialogProps): React.JSX.Element | null {
  const handleCreateSession = async (_formData: Record<string, string>): Promise<void> => {
    await new Promise((r) => setTimeout(r, 600));
    await onSuccess();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      title="Start New Conversation Session"
      description="Initialize a multi-turn chat thread with an agent."
      fields={CONVERSATION_FIELDS}
      submitText="Create Session"
      onClose={onClose}
      onSubmit={handleCreateSession}
    />
  );
}
