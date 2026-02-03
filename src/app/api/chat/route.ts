import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    systemPrompt: string;
    currentContent: string;
    currentTitle?: string;
    currentDescription?: string;
    apiKey: string;
    examplePosts?: { body: string; title?: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, systemPrompt, currentContent, currentTitle, currentDescription, apiKey, examplePosts } = body;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build system prompt with current content context
  let fullSystemPrompt = systemPrompt;

  // Inject pinned example posts for writing style
  if (examplePosts && examplePosts.length > 0) {
    const nonEmpty = examplePosts.filter((ex) => ex.body.trim().length > 0);
    if (nonEmpty.length > 0) {
      const examples = nonEmpty.map((ex, i) => {
        const parts: string[] = [];
        if (ex.title) parts.push(`Title: ${ex.title}`);
        parts.push(ex.body);
        return `Example ${i + 1}:\n${parts.join('\n')}`;
      }).join('\n\n');
      fullSystemPrompt += `\n\n---\nIMPORTANT: The user has pinned the following ${nonEmpty.length} post(s) as examples of their personal writing style. When the user asks you to write in "their style", "my voice", or similar — you MUST closely mimic the tone, sentence structure, vocabulary, formatting, and personality shown in these examples.\n\n${examples}`;
    }
  }

  const contextParts: string[] = [];

  if (currentTitle) {
    contextParts.push(`Title: ${currentTitle}`);
  }
  if (currentDescription) {
    contextParts.push(`Description: ${currentDescription}`);
  }
  if (currentContent) {
    contextParts.push(`Content:\n${currentContent}`);
  }

  if (contextParts.length > 0) {
    fullSystemPrompt += `\n\n---\nThe user is currently working on a post. Here is the current state:\n\n${contextParts.join('\n\n')}`;
  }

  try {
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: fullSystemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const data = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Stream error';
          const data = JSON.stringify({ error: errorMessage });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
