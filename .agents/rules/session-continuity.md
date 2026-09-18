# Session Continuity Protocol

Every AI agent working on OrchestrAI must adhere to this continuity protocol to ensure frictionless handoffs across sessions, different agent instances, and context window resets.

## Start-of-Session Checklist

1. **Read Status**:
   - Inspect [`PROGRESS.md`](PROGRESS.md) to identify the current Phase and Feature.
   - Inspect the latest entries in [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md).
2. **Inspect Current Code**:
   - Verify the files corresponding to the active feature.
   - Run typecheck or test if needed to verify workspace health.
3. **Focus on the Next Coherent Unit**:
   - Do NOT restart already completed phases (`[x]`).
   - Pick up precisely at the incomplete feature (`[~]`).
   - Implement only that next coherent unit of work.

## End-of-Session Checklist

1. **Verification**:
   - Ensure created/modified code compiles without TypeScript errors.
   - Run relevant tests to confirm correctness.
2. **Update Progress Tracking**:
   - Update [`PROGRESS.md`](PROGRESS.md) with updated phase/feature states (`[x]`, `[~]`, `[ ]`).
   - Update `ORCHESTRAI-IMPLEMENTATION.md` section status if a phase or major section was completed.
3. **Log Completed Work**:
   - Add an entry in [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md) containing:
     - Date & Phase
     - Summary of changes made
     - Key architectural decisions made
     - Known limitations / stubs
     - **Exact next step for the subsequent session**
4. **Summary for the User**:
   - Provide a concise summary of what was completed and what the next session will tackle.
