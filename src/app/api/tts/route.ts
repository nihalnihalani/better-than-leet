import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, handleApiError } from '@/lib/api-utils';
import { DEFAULT_VOICE_ID } from '@/lib/constants';
import { TTSRequestSchema, validateRequest } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request using Zod schema
    const validation = validateRequest(TTSRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { text, voiceId } = validation.data!;

    const selectedVoiceId = voiceId || DEFAULT_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return errorResponse('API key not configured', 500, 'MISSING_API_KEY');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Parse error text if it's JSON to get a cleaner message
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail?.message || errorJson.message || errorText;
      } catch {
        // Keep original error text if not JSON
      }
      return errorResponse(errorMessage, response.status, 'TTS_API_ERROR');
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    return handleApiError(error, 'TTS Error');
  }
}
