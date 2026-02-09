import { NextRequest } from 'next/server';
import { errorResponse, handleApiError } from '@/lib/api-utils';
import { DEFAULT_GEMINI_VOICE } from '@/lib/constants';
import { TTSRequestSchema, validateRequest } from '@/lib/schemas';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request using Zod schema
    const validation = validateRequest(TTSRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { text, voiceId } = validation.data!;
    const selectedVoice = voiceId || DEFAULT_GEMINI_VOICE;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return errorResponse('Gemini API key not configured', 500, 'MISSING_API_KEY');
    }

    // Use Gemini's generateContent API with audio response modality
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice
            }
          }
        }
      }
    });

    // Extract audio data from response
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!audioData || !audioData.data) {
      return errorResponse('No audio generated', 500, 'TTS_GENERATION_ERROR');
    }

    // Decode base64 audio data
    const audioBuffer = Buffer.from(audioData.data, 'base64');

    // Gemini returns PCM audio - convert to WAV for browser playback
    const wavBuffer = createWavBuffer(audioBuffer, 24000, 1, 16);

    // Convert to Uint8Array for Response compatibility (works in all environments)
    const responseData = new Uint8Array(wavBuffer);

    return new Response(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(responseData.length),
      },
    });

  } catch (error) {
    return handleApiError(error, 'TTS Error');
  }
}

// Helper function to create WAV file from PCM data
function createWavBuffer(pcmData: Buffer, sampleRate: number, numChannels: number, bitsPerSample: number): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = Buffer.alloc(totalSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Chunk size
  buffer.writeUInt16LE(1, 20); // Audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);

  return buffer;
}
