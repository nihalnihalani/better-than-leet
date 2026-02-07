/**
 * Programmatic sound effects using Web Audio API OscillatorNode.
 * No external audio files needed.
 */

let audioCtx: AudioContext | null = null;
let muted = false;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(frequency: number, duration: number, startTime: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

export type SoundType = 'success' | 'error' | 'ready' | 'complete';

export function playSound(type: SoundType) {
    if (muted) return;

    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const now = ctx.currentTime;

        switch (type) {
            case 'ready':
                // Single pleasant chime (A4 = 440Hz)
                playTone(440, 0.3, now, 'sine', 0.12);
                playTone(880, 0.2, now + 0.05, 'sine', 0.06);
                break;

            case 'success':
                // Two ascending tones (C5 → E5)
                playTone(523.25, 0.15, now, 'sine', 0.12);
                playTone(659.25, 0.2, now + 0.12, 'sine', 0.12);
                break;

            case 'error':
                // Descending tone (E4 → C4)
                playTone(329.63, 0.15, now, 'sine', 0.1);
                playTone(261.63, 0.25, now + 0.12, 'sine', 0.1);
                break;

            case 'complete':
                // Three ascending tones (C5 → E5 → G5)
                playTone(523.25, 0.15, now, 'sine', 0.1);
                playTone(659.25, 0.15, now + 0.15, 'sine', 0.1);
                playTone(783.99, 0.3, now + 0.3, 'sine', 0.1);
                break;
        }
    } catch {
        // Audio may not be available
    }
}

export function setMuted(value: boolean) {
    muted = value;
}

export function isMuted(): boolean {
    return muted;
}
