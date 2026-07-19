/**
 * LLM model configuration. Kept dependency-free (no DB/OpenAI imports) so it can be
 * unit-tested in isolation without provisioning infrastructure.
 */

/** Safe, generally-available default OpenAI chat model. */
export const DEFAULT_OPENAI_MODEL = "gpt-4o";

/**
 * Resolve the OpenAI chat model to use.
 * Env-override: OPENAI_MODEL (defaults to a real GA model).
 * NOTE: a previously hard-coded "gpt-5" value never existed as a public model
 * and would fail at runtime — the default here is therefore a safe GA model.
 */
export function resolveOpenAIModel(): string {
  const fromEnv = process.env.OPENAI_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_OPENAI_MODEL;
}
