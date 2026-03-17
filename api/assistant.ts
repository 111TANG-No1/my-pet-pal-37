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

    // Validate and truncate messages
    const sanitized = messages.slice(-20).map((m: any) => ({
      role: ['user', 'assistant'].includes(m.role) ? m.role : 'user',
      content: typeof m.content === 'string' ? m.content.slice(0, 2000) : '',
    }));

    // Anthropic requires alternating user/assistant roles, ensure first message is user
    const filtered = sanitized.filter((_, i) => {
      if (i === 0) return sanitized[0].role === 'user';
      return true;
    });

    // Build system prompt
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
        messages: filtered,
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
      return res.status(200).json({ ok: false, error: 'Empty response from AI' });
    }

    return res.status(200).json({ ok: true, reply });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return res.status(200).json({ ok: false, error: 'Request timeout' });
    }
    return res.status(200).json({ ok: false, error: 'Internal error' });
  }
}
