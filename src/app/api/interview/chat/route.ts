import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech, textToSpeechStream, callMiniMax, CHAT_MODEL_NAME } from '@/lib/minimax';
import * as Sentry from "@sentry/nextjs";

function buildMessages(
  text: string,
  history: { role: string; content: string }[] | undefined,
  context: string | undefined,
  problemDescription: string | undefined
) {
  const messages: { sender_type: "USER" | "BOT"; sender_name: string; text: string }[] = [];
  let systemPrompt =
    "You are Shifu, a technical interviewer AI. Start the session like a real technical interview: introduce yourself briefly as Shifu, state the problem name and difficulty, then ask the candidate how they would approach it. " +
    "Keep all responses focused on the current coding problem. Do not discuss unrelated topics. " +
    "Be concise and professional: give brief, conversational replies (1–3 sentences per turn). Ask one question at a time, avoid long monologues, and react naturally to what the candidate said so it feels like a real back-and-forth dialogue. " +
    "Ask clarifying questions, give hints if they are stuck, and comment on their code when relevant. " +
    (problemDescription
      ? "The candidate is working on this problem. Use it in your opening and throughout:\n\n" + problemDescription
      : "");
  if (context) systemPrompt += `\n\nCurrent Code Context:\n${context}`;
  messages.push({ sender_type: "USER", sender_name: "System", text: systemPrompt.trim() });
  if (history && Array.isArray(history)) {
    for (const msg of history) {
      messages.push({
        sender_type: msg.role === "user" ? "USER" : "BOT",
        sender_name: msg.role === "user" ? "User" : "Shifu",
        text: msg.content,
      });
    }
  }
  messages.push({ sender_type: "USER", sender_name: "User", text });
  return messages;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, history, context, problemDescription, stream: wantStream } = body;

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const messages = buildMessages(text, history, context, problemDescription);

    // 1. Call MiniMax LLM
    console.log("🤖 Calling MiniMax LLM...");
    const aiResponseText = await callMiniMax(messages, 0.7, CHAT_MODEL_NAME);
    console.log("🤖 AI Response:", aiResponseText);

    const stream = wantStream === true;

    if (stream) {
      // 2b. Stream TTS chunks via SSE (lower latency; only when api.minimax.io)
      try {
        const encoder = new TextEncoder();
        const streamBody = new ReadableStream({
          async start(controller) {
            try {
              controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify({ text: aiResponseText })}\n\n`));
              for await (const chunk of textToSpeechStream(aiResponseText)) {
                const b64 = Buffer.from(chunk).toString("base64");
                controller.enqueue(encoder.encode(`event: audio\ndata: ${b64}\n\n`));
              }
              controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
            } catch (e) {
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(e) })}\n\n`));
            } finally {
              controller.close();
            }
          },
        });
        return new Response(streamBody, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      } catch (streamErr) {
        console.warn("Streaming TTS failed, falling back to non-streaming:", streamErr);
        // Fall through to non-streaming
      }
    }

    // 2. Call MiniMax TTS (single response)
    console.log("🔊 Calling MiniMax TTS...");
    const audioBuffer = await textToSpeech(aiResponseText);
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      text: aiResponseText,
      audio: audioBase64,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isInvalidKey = /invalid api key|api key.*invalid|unauthorized|not set/i.test(message);
    if (isInvalidKey) {
      return NextResponse.json(
        { error: "Invalid MiniMax API key. Add MINIMAX_API_KEY and MINIMAX_GROUP_ID to .env.local and restart the dev server." },
        { status: 401 }
      );
    }
    console.error("Chat API Error:", message, error);
    Sentry.captureException(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
