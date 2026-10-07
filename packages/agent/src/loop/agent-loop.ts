/**
 * @file packages/agent/src/loop/agent-loop.ts
 * @description Core step controller and execution engine for autonomous agents.
 */

import { AgentMode, MessageRole, ToolPermissionLevel, StepOutcome } from "@orchestrai/shared-types";
import { AIMessageSchema, type AIMessage, type AgentDefinition } from "@orchestrai/core";
import type { ILlmAdapter } from "@orchestrai/models";
import type { ToolRegistry } from "@orchestrai/tools";
import type { AgentStateMachine } from "@/state";
import { compilePrompt } from "@/compiler";
import {
  resolveModeStrategy,
  ModeConstraintEnforcer,
  parsePlanFromResponse,
  HeuristicModeRouter,
  type IModeRouter,
} from "@/modes";
import { Logger, loggerWithConfig } from "@yuva-devlab/logger";
import type { AgentStepResult } from "./step-result.types";
import { extractToolCalls } from "./tool-message-converter";
import { executeStepToolCalls } from "./step-tool-executor";
import { runAgentUntilHalt, type AgentRunResult } from "./agent-runner";

/**
 * Configuration options required to instantiate an AgentLoop controller.
 */
export interface AgentLoopConfig {
  readonly definition: AgentDefinition;
  readonly state: AgentStateMachine;
  readonly adapter: ILlmAdapter;
  readonly tools: ToolRegistry;
  readonly clearance?: ToolPermissionLevel;
  readonly workspaceRoot?: string;
  readonly modeRouter?: IModeRouter;
  readonly modeEnforcer?: ModeConstraintEnforcer;
}

/**
 * Autonomous agent loop controller managing iterative reasoning, tool dispatch, and HITL pauses.
 */
export class AgentLoop {
  private readonly config: AgentLoopConfig;
  private readonly clearance: ToolPermissionLevel;
  private readonly modeEnforcer: ModeConstraintEnforcer;
  private readonly router: IModeRouter;
  private readonly logger: Logger;

  constructor(config: AgentLoopConfig) {
    this.config = config;
    this.clearance = config.clearance ?? ToolPermissionLevel.READ_ONLY;
    this.modeEnforcer = config.modeEnforcer ?? new ModeConstraintEnforcer();
    this.router = config.modeRouter ?? new HeuristicModeRouter();
    this.logger = loggerWithConfig(new Logger("AgentLoop"));
  }

  /**
   * Executes a single step of the agent loop against the current conversation history.
   *
   * @param history - Current array of conversation messages.
   * @returns Promise resolving to the AgentStepResult with outcome and tool results.
   */
  public async step(history: readonly AIMessage[]): Promise<AgentStepResult> {
    const stepIndex = this.config.state.advanceStep();
    this.logger.debug("step: entering execution step", {
      stepIndex,
      historyLength: history.length,
    });

    // 1. Resolve operational mode (dynamically routed in AUTO mode via router)
    const activeMode =
      this.config.definition.mode === AgentMode.AUTO
        ? await this.router.route({
            messages: history,
            tools: this.config.tools.list(),
            currentMode: this.config.definition.mode,
          })
        : this.config.definition.mode;

    const modeStrategy = resolveModeStrategy(activeMode);

    // 2. Compile full prompt payload
    const compiledMessages = compilePrompt({
      systemPrompt: this.config.definition.systemPrompt,
      modeInstructions: modeStrategy.getSystemInstructions(),
      contextVariables: this.config.state.snapshot().contextVariables,
      history,
    });

    // 3. Invoke LLM via the model adapter
    const response = await this.config.adapter.invoke({
      model: this.config.definition.modelConfig.modelName,
      messages: compiledMessages,
      temperature: this.config.definition.modelConfig.temperature,
      maxTokens: this.config.definition.modelConfig.maxTokens,
      stream: false,
    });

    const assistantMessage: AIMessage = AIMessageSchema.parse({
      role: MessageRole.ASSISTANT,
      content: response.content,
    });

    const toolCalls = extractToolCalls(assistantMessage);

    // Case 1: Pure textual completion without tool calls
    if (toolCalls.length === 0) {
      // In PLAN mode, parse and attach structured plan if present
      if (activeMode === AgentMode.PLAN && typeof assistantMessage.content === "string") {
        const parsedPlan = parsePlanFromResponse(assistantMessage.content);
        if (parsedPlan) {
          this.config.state.setContextVariable("activePlan", parsedPlan);
        }
      }

      const isDone = modeStrategy.shouldTerminate(false);
      if (isDone) {
        this.config.state.terminate();
      }

      return {
        stepIndex,
        outcome: isDone ? StepOutcome.HALTED : StepOutcome.CONTINUE,
        assistantMessage,
        toolResults: [],
      };
    }

    // Case 2: Model emitted tool call(s) — evaluate and execute
    const outcome = await executeStepToolCalls({
      calls: toolCalls,
      tools: this.config.tools,
      state: this.config.state,
      activeMode,
      modeEnforcer: this.modeEnforcer,
      clearance: this.clearance,
      workspaceRoot: this.config.workspaceRoot,
    });

    if (outcome.halted) {
      return {
        stepIndex,
        outcome: StepOutcome.HALTED,
        assistantMessage,
        toolResults: outcome.toolResults,
        error: outcome.error,
      };
    }

    if (outcome.pendingApproval) {
      return {
        stepIndex,
        outcome: StepOutcome.WAITING_FOR_APPROVAL,
        assistantMessage,
        toolResults: outcome.toolResults,
        pendingApproval: outcome.pendingApproval,
      };
    }

    return {
      stepIndex,
      outcome: StepOutcome.CONTINUE,
      assistantMessage,
      toolResults: outcome.toolResults,
    };
  }

  /**
   * Runs sequential loop steps continuously until HALTED, WAITING_FOR_APPROVAL, or ERROR.
   */
  public async runUntilHalt(
    initialHistory: readonly AIMessage[],
    maxTurns = 10,
  ): Promise<AgentRunResult> {
    return runAgentUntilHalt(this, initialHistory, maxTurns);
  }
}
