import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: false, error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ ok: false, error: 'messages is required' });
    }

    const sanitized = messages.slice(-20)
  .filter((m: any) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
  .map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content.slice(0, 2000),
  }));

// Ensure starts with user message
const firstUserIdx = sanitized.findIndex((m: any) => m.role === 'user');
const trimmed = firstUserIdx >= 0 ? sanitized.slice(firstUserIdx) : [];

if (trimmed.length === 0) {
  return res.status(400).json({ ok: false, error: 'no valid user message found' });
}

    const systemPrompt = '你是一位专业友好的宠物AI助手，用中文简洁回答宠物相关问题（健康、喂养、训练等）。回复控制在200字以内。' +
      (context?.petName ? `\n当前用户正在询问关于宠物"${context.petName}"的问题。` : '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages: trimmed,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json({ ok: false, error: `Anthropic API error: ${response.status}` });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text?.trim() || '';
    if (!reply) {
      return res.status(200).json({ ok: false, error: 'Empty response' });
    }

    return res.status(200).json({ ok: true, reply });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return res.status(200).json({ ok: false, error: 'Request timeout' });
    }
    return res.status(200).json({ ok: false, error: 'Internal error' });
  }
}
