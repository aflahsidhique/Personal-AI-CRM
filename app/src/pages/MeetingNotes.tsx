import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ListChecks, Mic, Save, Sparkles, Square, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useAddMeetingNote,
  useContacts,
  useExtractTasks,
  useSummarizeMeeting,
  useTranscribeMeetingAudio,
} from '@/hooks/useCrm';
import TypingText from '@/components/TypingText';

const languageOptions = [
  ['unknown', 'Auto-detect'], ['en-IN', 'English'], ['hi-IN', 'Hindi'], ['bn-IN', 'Bengali'],
  ['kn-IN', 'Kannada'], ['ml-IN', 'Malayalam'], ['mr-IN', 'Marathi'], ['od-IN', 'Odia'],
  ['pa-IN', 'Punjabi'], ['ta-IN', 'Tamil'], ['te-IN', 'Telugu'], ['gu-IN', 'Gujarati'],
  ['as-IN', 'Assamese'], ['ur-IN', 'Urdu'], ['ne-IN', 'Nepali'], ['kok-IN', 'Konkani'],
  ['ks-IN', 'Kashmiri'], ['sd-IN', 'Sindhi'], ['sa-IN', 'Sanskrit'], ['sat-IN', 'Santali'],
  ['mni-IN', 'Manipuri'], ['brx-IN', 'Bodo'], ['mai-IN', 'Maithili'], ['doi-IN', 'Dogri'],
] as const;

export default function MeetingNotes() {
  const { data: contacts = [] } = useContacts();
  const [contactId, setContactId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [tasksExtracted, setTasksExtracted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [languageCode, setLanguageCode] = useState('unknown');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioMessage, setAudioMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  const summarize = useSummarizeMeeting();
  const extractTasks = useExtractTasks();
  const addMeetingNote = useAddMeetingNote();
  const transcribeAudio = useTranscribeMeetingAudio();
  const contact = contacts.find((item) => item.id === contactId);
  const result = summarize.data;

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current);
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function clearRecordingTimers() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current);
    timerRef.current = null;
    stopTimerRef.current = null;
  }

  function appendTranscription(data: { transcript: string; languageCode: string | null }) {
    setTranscript((current) => (current.trim() ? `${current.trim()}\n\n${data.transcript}` : data.transcript));
    setTasksExtracted(false);
    setSaved(false);
    summarize.reset();
    const detected = languageOptions.find(([code]) => code === data.languageCode)?.[1];
    setAudioMessage(detected ? `Transcribed in ${detected}.` : 'Audio transcribed by Sarvam.');
  }

  function submitAudio(audio: Blob, fileName: string) {
    if (!audio.size) {
      setAudioMessage('No audio was captured. Please try again.');
      return;
    }
    setAudioMessage('');
    transcribeAudio.mutate({ audio, fileName, languageCode }, { onSuccess: appendTranscription });
  }

  function stopRecording() {
    clearRecordingTimers();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setIsRecording(false);
  }

  async function startRecording() {
    setAudioMessage('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setAudioMessage('Audio recording is not supported in this browser. Upload a clip instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredTypes = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const type = recorder.mimeType || 'audio/webm';
        const extension = type.includes('mp4') ? 'm4a' : 'webm';
        submitAudio(new Blob(chunksRef.current, { type }), `meeting-clip-${Date.now()}.${extension}`);
      };
      recorder.start();
      setRecordingSeconds(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1_000);
      stopTimerRef.current = window.setTimeout(stopRecording, 29_000);
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setAudioMessage('Microphone access was denied or unavailable. Upload a clip instead.');
    }
  }

  function handleTranscriptChange(value: string) {
    setTranscript(value);
    setTasksExtracted(false);
    setSaved(false);
    summarize.reset();
  }

  function handleSummarize() {
    if (!transcript.trim()) return;
    setTasksExtracted(false);
    setSaved(false);
    summarize.mutate(transcript);
  }

  function handleExtractTasks() {
    if (!transcript.trim() || tasksExtracted) return;
    extractTasks.mutate(
      { rawTranscript: transcript, contactId: contactId || undefined },
      { onSuccess: () => setTasksExtracted(true) },
    );
  }

  function handleSave() {
    if (!result || !contact) return;
    addMeetingNote.mutate(
      { contactId: contact.id, rawTranscript: transcript, summary: result.summary, actionItems: result.actionItems },
      { onSuccess: () => setSaved(true) },
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="nb-display text-2xl sm:text-4xl">Meeting Notes</h1>
        <p className="mt-1 text-sm font-medium text-muted">Transcript → AI summary → action items, saved to the timeline.</p>
      </div>

      {contacts.length === 0 ? (
        <div className="nb-card p-8 text-center text-sm font-bold sm:p-10">
          Add a contact first, then log meeting notes against them.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="nb-card space-y-4 p-4 sm:p-5">
            <label className="block">
              <span className="nb-label mb-1.5 block text-muted">Contact</span>
              <div className="relative">
                <select value={contactId} onChange={(event) => setContactId(event.target.value)} className="nb-input nb-select">
                  <option value="">Select a contact…</option>
                  {contacts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <ChevronDown size={15} strokeWidth={2.8} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </label>

            <label className="block">
              <span className="nb-label mb-1.5 block text-muted">Transcript</span>
              <textarea
                value={transcript}
                onChange={(event) => handleTranscriptChange(event.target.value)}
                rows={8}
                placeholder="Paste a transcript, record a clip, or upload audio…"
                className="nb-input resize-none"
              />
            </label>

            <div className="nb-card-flat space-y-3 bg-sunken p-3">
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-36 flex-1">
                  <span className="nb-label mb-1 block text-muted">Audio language</span>
                  <div className="relative">
                    <select
                      value={languageCode}
                      onChange={(event) => setLanguageCode(event.target.value)}
                      disabled={isRecording || transcribeAudio.isPending}
                      className="nb-input nb-select py-2"
                    >
                      {languageOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                    </select>
                    <ChevronDown size={14} strokeWidth={2.8} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.aac,.aiff,.amr,.flac,.m4a,.mp3,.ogg,.opus,.wav,.webm,.wma"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) submitAudio(file, file.name);
                    event.target.value = '';
                  }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isRecording || transcribeAudio.isPending} className="nb-btn">
                  <Upload size={15} strokeWidth={2.8} /> Upload clip
                </button>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={transcribeAudio.isPending}
                  className={`nb-btn ${isRecording ? 'bg-coral text-onaccent' : 'bg-aqua text-onaccent'}`}
                >
                  {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={15} strokeWidth={2.8} />}
                  {isRecording ? `Stop · 0:${String(recordingSeconds).padStart(2, '0')}` : 'Record clip'}
                </button>
              </div>
              <p className="text-xs font-medium text-muted">Sarvam accepts clips up to 30 seconds. Each result is appended to the transcript.</p>
              {transcribeAudio.isPending && <p className="text-xs font-bold" role="status">Transcribing audio with Sarvam…</p>}
              {transcribeAudio.isError && (
                <div className="flex items-start gap-2 text-xs font-bold text-coral" role="alert">
                  <AlertCircle size={14} strokeWidth={2.6} className="mt-0.5 shrink-0" />
                  {(transcribeAudio.error as Error).message}
                </div>
              )}
              {audioMessage && !transcribeAudio.isError && <p className="text-xs font-bold" role="status">{audioMessage}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={handleSummarize} disabled={!transcript.trim() || summarize.isPending} className="nb-btn bg-acid text-onaccent">
                <Sparkles size={15} strokeWidth={2.8} className={summarize.isPending ? 'animate-spin' : ''} />
                {summarize.isPending ? 'Summarizing…' : 'Summarize'}
              </button>
              <button onClick={handleExtractTasks} disabled={!result || tasksExtracted || extractTasks.isPending} className="nb-btn">
                <ListChecks size={15} strokeWidth={2.8} />
                {tasksExtracted ? 'Tasks Added' : extractTasks.isPending ? 'Extracting…' : 'Extract Tasks'}
              </button>
              <button onClick={handleSave} disabled={!result || !contact || saved || addMeetingNote.isPending} className="nb-btn">
                {saved ? <CheckCircle2 size={15} strokeWidth={2.8} /> : <Save size={15} strokeWidth={2.8} />}
                {saved ? 'Saved' : addMeetingNote.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
            {!contact && result && <p className="nb-card-flat bg-sun p-2.5 text-xs font-bold text-onaccent">Select a contact above to save this note.</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="nb-card space-y-4 p-4 sm:p-5"
          >
            <h2 className="nb-display text-base sm:text-lg">AI Output</h2>
            {!result && !summarize.isPending && !summarize.isError && (
              <p className="text-sm font-medium text-muted">Summary and action items will appear here after you click Summarize.</p>
            )}
            {summarize.isPending && (
              <div className="space-y-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-4 animate-pulse rounded border-2 border-ink bg-sunken" style={{ width: `${85 - index * 10}%` }} />
                ))}
              </div>
            )}
            {summarize.isError && (
              <div className="nb-card-flat flex items-start gap-2 bg-coral p-3 text-sm font-bold text-onaccent">
                <AlertCircle size={16} strokeWidth={2.6} className="mt-0.5 shrink-0" />
                {(summarize.error as Error).message}
              </div>
            )}
            {result && (
              <>
                <div>
                  <h3 className="nb-label mb-1.5 text-muted">Summary</h3>
                  <p className="nb-card-flat bg-sunken p-3 text-sm font-medium leading-relaxed"><TypingText text={result.summary} /></p>
                </div>
                <div>
                  <h3 className="nb-label mb-1.5 text-muted">Action Items</h3>
                  <ul className="space-y-2">
                    {result.actionItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm font-medium">
                        <CheckCircle2 size={15} strokeWidth={2.8} className="mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {saved && <div className="nb-card-flat bg-mint p-2.5 text-xs font-bold text-onaccent">Saved to {contact?.name}&apos;s timeline.</div>}
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
