import type { ScoreKey } from "../types";
import {
  analyzeUserPrompt,
  ANALYZE_SYSTEM_PROMPT,
  buildPlanUserPrompt,
  BUILD_PLAN_SYSTEM_PROMPT,
} from "./prompts";
import { buildPlanSchema, opportunityDraftSchema } from "./schema";
import { mockAI } from "./mock";
import type {
  AnalyzeInput,
  AIProvider,
  BuildPlan,
  ClusterBrief,
  OpportunityDraft,
} from "./types";




abstract class JsonAIProvider implements AIProvider {
  abstract name: string;
  protected abstract chat(system: string, user: string): Promise<unknown>;

  async analyzeCluster(input: AnalyzeInput): Promise<OpportunityDraft> {
    try {
      return opportunityDraftSchema.parse(
        await this.chat(ANALYZE_SYSTEM_PROMPT, analyzeUserPrompt(input))
      ) as OpportunityDraft;
    } catch (err) {
      console.warn(`[ai:${this.name}] analyzeCluster failed, using mock:`, (err as Error).message);
      return mockAI.analyzeCluster(input);
    }
  }

  async generateBuildPlan(brief: ClusterBrief, draft: OpportunityDraft): Promise<BuildPlan> {
    try {
      return buildPlanSchema.parse(
        await this.chat(BUILD_PLAN_SYSTEM_PROMPT, buildPlanUserPrompt(brief, draft))
      ) as BuildPlan;
    } catch (err) {
      console.warn(`[ai:${this.name}] generateBuildPlan failed, using mock:`, (err as Error).message);
      return mockAI.generateBuildPlan(brief, draft);
    }
  }
}




async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 60000
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export class OpenAIProvider extends JsonAIProvider {
  name = "openai";

  constructor(private apiKey: string, private model: string) {
    super();
  }

  protected async chat(system: string, user: string): Promise<unknown> {
    const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty content");
    return JSON.parse(content);
  }
}

export class AgentRouterProvider extends JsonAIProvider {
  name = "agentrouter";

  constructor(private apiKey: string, private baseUrl: string, private model: string) {
    super();
  }

  protected async chat(system: string, user: string): Promise<unknown> {
    const res = await fetchWithTimeout(`${this.baseUrl.replace(/\/$/, "")}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: `${system}\nReturn only valid JSON without markdown fences.`,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`AgentRouter ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { content?: { type: string; text?: string }[] };
    const content = json.content?.find((part) => part.type === "text")?.text;
    if (!content) throw new Error("AgentRouter returned empty content");
    return JSON.parse(content);
  }
}

export class OpenRouterProvider extends JsonAIProvider {
  name = "openrouter";

  constructor(private apiKey: string, private model: string) {
    super();
  }

  protected async chat(system: string, user: string): Promise<unknown> {
    const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-OpenRouter-Title": process.env.NEXT_PUBLIC_APP_NAME ?? "Trend Arbitrage Radar",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.4,
        reasoning: { exclude: true },
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${system}\nReturn only valid JSON without markdown fences.` },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned empty content");
    return JSON.parse(content);
  }
}

export function createAIProvider(): AIProvider {
  const choice = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (choice === "openrouter" && process.env.OPENROUTER_API_KEY) {
    return new OpenRouterProvider(
      process.env.OPENROUTER_API_KEY,
      process.env.OPENROUTER_MODEL ?? "openrouter/free"
    );
  }
  if (choice === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAIProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL ?? "gpt-4o-mini");
  }
  if (choice === "agentrouter" && process.env.AGENTROUTER_API_KEY) {
    return new AgentRouterProvider(
      process.env.AGENTROUTER_API_KEY,
      process.env.AGENTROUTER_BASE_URL ?? "https://agentrouter.org/v1",
      process.env.AGENTROUTER_MODEL ?? "gpt-5.6-sol"
    );
  }
  
  
  if (choice !== "mock") {
    console.warn(`[ai] provider '${choice}' is not configured (missing key?), using mock`);
  }
  return mockAI;
}

export const aiProvider = createAIProvider();
export type { ScoreKey };
