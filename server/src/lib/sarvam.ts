const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

interface SarvamTranscriptionResponse {
  request_id?: string | null;
  transcript?: string;
  language_code?: string | null;
  error?: string | { message?: string; code?: string; request_id?: string };
  message?: string;
  detail?: string;
}

export interface TranscriptionResult {
  transcript: string;
  languageCode: string | null;
  requestId: string | null;
}

export class SarvamError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
  }
}

function errorMessage(body: SarvamTranscriptionResponse, status: number) {
  if (typeof body.error === 'string') return body.error;
  if (body.error?.message) return body.error.message;
  if (body.detail) return body.detail;
  if (body.message) return body.message;
  return `Sarvam transcription failed (${status})`;
}

export async function transcribeAudio(
  audio: Buffer,
  fileName: string,
  mimeType: string,
  languageCode?: string,
): Promise<TranscriptionResult> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new SarvamError('Audio transcription is unavailable. Set SARVAM_API_KEY in server/.env.', 503);
  }

  const model = process.env.SARVAM_STT_MODEL || 'saaras:v3';
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(audio)], { type: mimeType }), fileName);
  form.append('model', model);
  form.append('language_code', languageCode || 'unknown');
  if (model === 'saaras:v3') form.append('mode', 'transcribe');

  let response: Response;
  try {
    response = await fetch(SARVAM_STT_URL, {
      method: 'POST',
      headers: { 'api-subscription-key': apiKey },
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError' ? 'timed out' : 'could not be reached';
    throw new SarvamError(`Sarvam ${reason}. Please try again.`);
  }

  const body = (await response.json().catch(() => ({}))) as SarvamTranscriptionResponse;
  if (!response.ok) {
    const status = response.status >= 400 && response.status < 500 ? response.status : 502;
    throw new SarvamError(errorMessage(body, response.status), status);
  }
  if (!body.transcript?.trim()) {
    throw new SarvamError('Sarvam returned an empty transcript. Check that the clip contains clear speech.', 422);
  }

  return {
    transcript: body.transcript.trim(),
    languageCode: body.language_code ?? null,
    requestId: body.request_id ?? null,
  };
}
