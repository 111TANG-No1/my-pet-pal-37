import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: false, error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const { messages, context } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ ok: false, error: 'messages is required' });
    }

    // Validate and truncate messages
    const sanitized = messages.slice(-20).map((m: any) => ({
      role: ['user', 'assistant', 'system'].includes(m.role) ? m.role : 'user',
      content: typeof m.content === 'string' ? m.content.slice(0, 2000) : '',
    }));

    // Build system prompt
    const systemMsg = {
      role: 'system' as const,
      content: '你是一位专业友好的宠物AI助手，用中文简洁回答宠物相关问题（健康、喂养、训练等）。回复控制在200字以内。' +
        (context?.petName ? `\n当前用户正在询问关于宠物"${context.petName}"的问题。` : ''),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMsg, ...sanitized],
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json({ ok: false, error: `OpenAI API error: ${response.status}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '';

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
