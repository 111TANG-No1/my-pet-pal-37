import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: false, error: 'no key' });
  }

  const { messages, context } = req.body || {};
  const lastUserMsg = Array.isArray(messages)
    ? [...messages].reverse().find((m: any) => m.role === 'user')?.content
    : null;

  if (!lastUserMsg) {
    return res.status(200).json({ ok: false, error: 'no user message' });
  }

  const systemPrompt = '你是一位专业友好的宠物AI助手，用中文简洁回答宠物相关问题。回复控制在200字以内。' +
    (context?.petName ? `\n用户正在询问关于宠物"${context.petName}"的问题。` : '');

  try {
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
        messages: [{ role: 'user', content: String(lastUserMsg).slice(0, 2000) }],
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text?.trim();

    if (!reply) {
      return res.status(200).json({ ok: false, error: 'empty reply', raw: data });
    }

    return res.status(200).json({ ok: true, reply });
  } catch (err: any) {
    return res.status(200).json({ ok: false, error: err.message });
  }
}
