import { useState, useRef, useEffect, useCallback } from 'react'
import './LullabyMusicBox.css'

interface MelodyNote {
  freq: number
  startTime: number // seconds from start
  duration: number  // seconds
  name: string
  label: string
}

// Gentle bedtime lullaby composed around Pip's canon: G-sharp, B-flat, and stardust chords
const LULLABY_NOTES: MelodyNote[] = [
  { freq: 415.30, startTime: 0.0, duration: 0.75, name: 'G#4', label: 'G-sharp (Nursery Bell)' },
  { freq: 523.25, startTime: 0.65, duration: 0.75, name: 'C5',  label: 'C (Quiet Glow)' },
  { freq: 622.25, startTime: 1.30, duration: 0.75, name: 'D#5', label: 'D-sharp (Stardust)' },
  { freq: 783.99, startTime: 1.95, duration: 0.85, name: 'G5',  label: 'G (Dream Drift)' },
  { freq: 830.61, startTime: 2.70, duration: 0.95, name: 'G#5', label: 'High G-sharp (Soft Star)' },
  { freq: 698.46, startTime: 3.55, duration: 0.75, name: 'F5',  label: 'F (Nightcap Breeze)' },
  { freq: 622.25, startTime: 4.20, duration: 0.75, name: 'D#5', label: 'D-sharp (Stardust)' },
  { freq: 466.16, startTime: 4.85, duration: 0.75, name: 'Bb4', label: 'B-flat (Sleepy Slumber)' },
  { freq: 523.25, startTime: 5.50, duration: 0.75, name: 'C5',  label: 'C (Quiet Glow)' },
  { freq: 622.25, startTime: 6.15, duration: 0.75, name: 'D#5', label: 'D-sharp (Stardust)' },
  { freq: 523.25, startTime: 6.80, duration: 0.85, name: 'C5',  label: 'C (Resting Moon)' },
  { freq: 415.30, startTime: 7.55, duration: 2.10, name: 'G#4', label: 'G-sharp (Sweet Dreams)' }
]

const TOTAL_MELODY_DURATION = 9.8 // seconds

interface LullabyMusicBoxProps {
  onPlayStateChange?: (isPlaying: boolean) => void
  compact?: boolean
}

export const LullabyMusicBox = ({ onPlayStateChange, compact = false }: LullabyMusicBoxProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)
  const [statusMessage, setStatusMessage] = useState('Ready for a little lullaby ✨')
  const [pipSpeech, setPipSpeech] = useState(
    '“Gently turn the winding key... my bedtime music box is ready.”'
  )
  const [audioError, setAudioError] = useState<string | null>(null)

  // Audio Context and node references
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null)
  const activeOscillatorsRef = useRef<OscillatorNode[]>([])
  const timeoutIdsRef = useRef<number[]>([])

  // Notify parent of play state changes
  useEffect(() => {
    onPlayStateChange?.(isPlaying)
  }, [isPlaying, onPlayStateChange])

  // Stop playback and release audio nodes immediately
  const stopLullaby = useCallback(() => {
    // Clear all scheduled timeouts
    timeoutIdsRef.current.forEach(id => clearTimeout(id))
    timeoutIdsRef.current = []

    // Silence active oscillators cleanly
    activeOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop()
        osc.disconnect()
      } catch {
        // Oscillator already stopped
      }
    })
    activeOscillatorsRef.current = []

    setIsPlaying(false)
    setActiveNoteIdx(null)
    setStatusMessage('Lullaby resting · Sweet dreams 🌙')
    setPipSpeech('“Lullaby paused. Take all the time you need to settle in.”')
  }, [])

  // Master Gain setup & mute control
  const updateMasterGain = useCallback((muted: boolean) => {
    if (masterGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime
      masterGainRef.current.gain.cancelScheduledValues(now)
      // Smooth 20ms ramp to prevent audio popping
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now)
      masterGainRef.current.gain.linearRampToValueAtTime(muted ? 0 : 0.16, now + 0.02)
    }
  }, [])

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev
      updateMasterGain(next)
      if (next) {
        setPipSpeech('“Whispering in silent starlight... (Sound muted)”')
      } else if (isPlaying) {
        setPipSpeech('“Soft chimes are drifting into the dark. Close your eyes, little dreamer.”')
      }
      return next
    })
  }

  // Play gentle lullaby melody
  const playLullaby = async () => {
    // 1. Clean up any existing playback safely (prevent duplicate melodies)
    stopLullaby()
    setAudioError(null)

    // 2. Initialize or resume AudioContext on explicit user interaction
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        setAudioError('Web Audio is not supported by your browser.')
        return
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass()
      }

      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      // Warm acoustic low-pass filter (removes any harsh digital frequencies)
      if (!biquadFilterRef.current) {
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(2600, ctx.currentTime)
        filter.Q.setValueAtTime(1.1, ctx.currentTime)
        filter.connect(ctx.destination)
        biquadFilterRef.current = filter
      }

      // Master gain node
      if (!masterGainRef.current) {
        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.16, ctx.currentTime)
        masterGain.connect(biquadFilterRef.current)
        masterGainRef.current = masterGain
      } else {
        updateMasterGain(isMuted)
      }

      const startTime = ctx.currentTime + 0.06
      const newOscillators: OscillatorNode[] = []

      // 3. Schedule each gentle music-box note
      LULLABY_NOTES.forEach((note, idx) => {
        const noteStart = startTime + note.startTime
        const noteStop = noteStart + note.duration + 0.06

        // Primary pure sine oscillator (bell fundamental)
        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(note.freq, noteStart)

        // Subtly warm triangle oscillator for metal music-box tine body
        const osc2 = ctx.createOscillator()
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(note.freq, noteStart)

        // Triangle harmonic sub-gain (delicate, low volume)
        const harmGain = ctx.createGain()
        harmGain.gain.value = 0.2

        // Note envelope (fast attack without click, natural chime ring-out)
        const noteGain = ctx.createGain()
        noteGain.gain.setValueAtTime(0.0001, noteStart)
        noteGain.gain.linearRampToValueAtTime(1.0, noteStart + 0.016)
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration)

        // Connect graph: oscillators -> noteGain -> masterGain -> lowpass filter -> destination
        osc1.connect(noteGain)
        osc2.connect(harmGain)
        harmGain.connect(noteGain)
        noteGain.connect(masterGainRef.current!)

        // Start & stop nodes cleanly
        osc1.start(noteStart)
        osc2.start(noteStart)
        osc1.stop(noteStop)
        osc2.stop(noteStop)

        newOscillators.push(osc1, osc2)

        // Schedule visual UI feedback for each note
        const noteTimer = window.setTimeout(() => {
          setActiveNoteIdx(idx)
        }, note.startTime * 1000)
        timeoutIdsRef.current.push(noteTimer)
      })

      activeOscillatorsRef.current = newOscillators
      setIsPlaying(true)
      setStatusMessage('Pip is playing a sleepy melody... 🎵')
      setPipSpeech('“Soft chimes are drifting into the dark. Close your eyes, little dreamer.”')

      // Schedule natural completion
      const endTimer = window.setTimeout(() => {
        setIsPlaying(false)
        setActiveNoteIdx(null)
        setStatusMessage('Your lullaby has ended · Sweet dreams ✨')
        setPipSpeech('“The chimes rest softly. Sweet dreams until morning light.”')
      }, TOTAL_MELODY_DURATION * 1000)
      timeoutIdsRef.current.push(endTimer)

    } catch (err) {
      console.error('Lullaby audio error:', err)
      setAudioError('Could not start bedtime melody. Please check audio permissions.')
      setIsPlaying(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLullaby()
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close()
        } catch {
          // Context already closed
        }
      }
    }
  }, [stopLullaby])

  return (
    <div className={`lullaby-music-box ${compact ? 'is-compact' : ''} ${isPlaying ? 'is-playing' : ''}`}>
      {/* Decorative Music Box Header */}
      <div className="music-box-header">
        <div className="music-box-brand">
          <span className="brand-pin" aria-hidden="true">🎵</span>
          <div>
            <h4 className="music-box-title">Pip's Midnight Music Box</h4>
            <span className="music-box-subtitle">Hand-tuned celestial chimes in E-flat Major</span>
          </div>
        </div>

        {/* Dynamic State Pill */}
        <div className="playback-state-pill" aria-hidden="true">
          <span className={`state-led ${isPlaying ? 'is-on' : ''}`}></span>
          <span>{isPlaying ? 'Playing' : 'Ready'}</span>
        </div>
      </div>

      {/* Central Music Box Stage with Official Artwork & Winding Key */}
      <div className="music-box-stage">
        {/* Ambient Stardust Aura */}
        <div className={`music-box-aura ${isPlaying ? 'aura-active' : ''}`} aria-hidden="true"></div>

        {/* Floating Musical Notes Animation */}
        {isPlaying && (
          <div className="floating-notes-layer" aria-hidden="true">
            <span className="floating-note note-1">♪</span>
            <span className="floating-note note-2">♫</span>
            <span className="floating-note note-3">♩</span>
            <span className="floating-note note-4">✦</span>
            <span className="floating-note note-5">♬</span>
            <span className="floating-note note-6">✨</span>
          </div>
        )}

        {/* Official Local Music Box Illustration */}
        <div className="music-box-art-frame">
          <img
            src="/images/pip_lullaby_box.png"
            alt="Pip's handcrafted starlight music box with golden winding key and floating star chimes"
            className="music-box-img"
            width="320"
            height="240"
            loading="eager"
            decoding="async"
          />

          {/* Interactive / Animated Winding Key */}
          <div 
            className={`winding-key-interactive ${isPlaying ? 'key-turning' : ''}`}
            title={isPlaying ? 'Music box winding key spinning' : 'Winding key resting'}
            aria-hidden="true"
          >
            <svg width="42" height="42" viewBox="0 0 36 36" fill="currentColor" className="winding-key-svg">
              <circle cx="18" cy="18" r="4.5" fill="var(--color-amber)" />
              <path d="M18 4 C11 4 6 9 6 15 C6 19 9 22 13 23 L13 18 C11 17 10 15 10 13 C10 9 13.5 7 18 7 C22.5 7 26 9 26 13 C26 15 25 17 23 18 L23 23 C27 22 30 19 30 15 C30 9 25 4 18 4 Z" fill="var(--color-amber)" />
              <rect x="16" y="22" width="4" height="11" rx="2" fill="var(--color-brown)" />
            </svg>
          </div>
        </div>

        {/* Pip's Adaptive Character Dialogue */}
        <div className="pip-speech-bubble" role="status" aria-live="polite">
          <span className="speech-avatar" aria-hidden="true">🎀</span>
          <p className="speech-text">{pipSpeech}</p>
        </div>
      </div>

      {/* Musical Chime Bar Visualizer */}
      <div className="chime-bars-container" aria-label="Musical chime notes visualizer">
        <span className="chime-label" aria-hidden="true">Comb Tines:</span>
        <div className="chime-notes-track">
          {LULLABY_NOTES.map((note, idx) => (
            <div
              key={`${note.name}-${idx}`}
              className={`chime-note-pill ${activeNoteIdx === idx ? 'is-active' : ''}`}
              title={note.label}
            >
              <span className="note-star" aria-hidden="true">★</span>
              <span className="note-name">{note.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Live Status Banner */}
      <div className="music-box-status" role="status" aria-live="polite">
        <span className="status-star" aria-hidden="true">{isPlaying ? '✨' : '✦'}</span>
        <span className="status-text">{statusMessage}</span>
      </div>

      {audioError && (
        <div className="music-box-error" role="alert">
          <span>⚠️ {audioError}</span>
        </div>
      )}

      {/* Control Actions Row with Visible Large Tap Targets */}
      <div className="music-box-controls">
        {!isPlaying ? (
          <button
            type="button"
            className="music-btn play-btn"
            onClick={playLullaby}
            aria-label="Play Pip's lullaby melody"
          >
            <span className="btn-icon" aria-hidden="true">▶</span>
            <span>Play Lullaby</span>
          </button>
        ) : (
          <button
            type="button"
            className="music-btn stop-btn"
            onClick={stopLullaby}
            aria-label="Stop lullaby melody"
          >
            <span className="btn-icon" aria-hidden="true">⏹</span>
            <span>Stop</span>
          </button>
        )}

        {/* Clearly Visible Mute / Unmute Button */}
        <button
          type="button"
          className={`music-btn mute-btn ${isMuted ? 'is-muted' : ''}`}
          onClick={toggleMute}
          aria-pressed={isMuted}
          aria-label={isMuted ? 'Unmute lullaby sound' : 'Mute lullaby sound'}
          title={isMuted ? 'Sound muted (click to unmute)' : 'Sound on (click to mute)'}
        >
          <span className="btn-icon" aria-hidden="true">
            {isMuted ? '🔇' : '🔔'}
          </span>
          <span>{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
      </div>

      <div className="music-box-footnote">
        <span>Handcrafted in the Midnight Nursery · Soft sine-chime synthesis · Never autoplays</span>
      </div>
    </div>
  )
}
