const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

function requireApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new OpenRouterError(
      'OPENROUTER_API_KEY is not set. Add it to server/.env (see .env.example) to enable AI features.',
      503
    );
  }
  return key;
}

interface ChatOptions {
  system: string;
  user: string;
  json?: boolean;
  temperature?: number;
}

/** Calls OpenRouter chat completions and returns the raw text content. */
export async function chatComplete({ system, user, json, temperature = 0.4 }: ChatOptions): Promise<string> {
  const key = requireApiKey();
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AI Personal CRM',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new OpenRouterError(`OpenRouter request failed (${res.status}): ${body.slice(0, 500)}`, 502);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError('OpenRouter returned an empty response.', 502);
  }
  return content;
}

/** Calls OpenRouter expecting a JSON object response, with a best-effort parse fallback. */
export async function chatCompleteJSON<T>(options: ChatOptions): Promise<T> {
  const raw = await chatComplete({ ...options, json: true });
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new OpenRouterError('Could not parse AI response as JSON.', 502);
  }
}
