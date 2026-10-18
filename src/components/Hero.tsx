import { useState, useRef } from 'react'
import './Hero.css'

export const Hero = () => {
  // 1. Pointer tilt & touch reaction state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 })
  const [isPipBouncing, setIsPipBouncing] = useState(false)
  const [pipReactionText, setPipReactionText] = useState<string | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  // 2. Hidden Easter Egg state (5 clicks to reveal)
  const [easterClicks, setEasterClicks] = useState(0)
  const [showSecret, setShowSecret] = useState(false)

  // Pointer move handler for subtle 3D tilt
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Normalized offset from center (-1 to 1)
    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width * 0.8)))
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height * 0.8)))

    // Small, smooth, restrained tilt (max ±5 degrees, max ±6px translate)
    setTilt({
      rotateX: -normY * 5,
      rotateY: normX * 5,
      translateX: normX * 6,
      translateY: normY * 6
    })
  }

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 })
  }

  // Touch / click on Pip
  const handlePipTap = () => {
    setIsPipBouncing(true)
    setPipReactionText('Pip gives a friendly wave! ✨')

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25)
      } catch {
        // Ignore if haptics unavailable
      }
    }

    setTimeout(() => {
      setIsPipBouncing(false)
    }, 1200)

    setTimeout(() => {
      setPipReactionText(null)
    }, 3000)
  }

  // Secret star activation
  const handleEasterStarClick = () => {
    const nextCount = easterClicks + 1
    if (nextCount >= 5) {
      setShowSecret(true)
      setEasterClicks(5)
    } else {
      setEasterClicks(nextCount)
    }
  }

  const handleDismissSecret = () => {
    setShowSecret(false)
    setEasterClicks(0)
  }

  return (
    <section 
      className="hero-section" 
      aria-labelledby="hero-title"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="content-wrap hero-container">
        {/* Decorative background aura */}
        <div className="hero-backdrop-glow" aria-hidden="true"></div>

        {/* Text / Copy Column */}
        <div className="hero-content">
          {/* Eyebrow label */}
          <div className="hero-eyebrow">
            <span className="eyebrow-star" aria-hidden="true">✦</span>
            <span className="eyebrow-text">MIDNIGHT NURSERY</span>
            <span className="eyebrow-star" aria-hidden="true">✦</span>
          </div>

          {/* Main heading */}
          <h1 id="hero-title" className="hero-title">
            Hi, I'm <span className="hero-title-name">Pip!</span>
          </h1>

          {/* Profession */}
          <div className="hero-profession-banner" role="doc-subtitle">
            <span className="profession-icon" aria-hidden="true">🌙</span>
            <span className="profession-title">Junior Dream Engineer</span>
            <span className="profession-tag">Specialist in Sleepy Stars</span>
          </div>

          {/* Main tagline */}
          <p className="hero-tagline">
            “I build the dreams you fall asleep inside.”
          </p>

          {/* Supporting copy */}
          <p className="hero-copy">
            I'm a tiny dream-maker, a collector of sleepy stars, and the designer of little adventures that begin when you close your eyes.
          </p>

          {/* Primary CTA & Quick Traits */}
          <div className="hero-actions">
            <a href="#projects" className="hero-cta-button" id="explore-cta">
              <span>Explore my little world</span>
              <svg 
                className="cta-arrow-icon" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                aria-hidden="true"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </a>

            <div className="hero-trait-chips" aria-label="Pip's traits">
              <span className="trait-chip">
                <span className="trait-bullet" aria-hidden="true">★</span> Sleepy &amp; gentle
              </span>
              <span className="trait-chip">
                <span className="trait-bullet" aria-hidden="true">★</span> Friendly skull baby
              </span>
            </div>
          </div>
        </div>

        {/* Artwork / Character Stage Column */}
        <div className="hero-stage" ref={stageRef}>
          <div className="character-stage-wrapper">
            {/* Hidden Easter Egg: Discoverable Curious Star */}
            <button
              type="button"
              className={`secret-star-button ${easterClicks > 0 ? 'is-activated' : ''}`}
              onClick={handleEasterStarClick}
              aria-label="A tiny curious twinkling star near Pip"
              title="A tiny twinkling star"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
              {easterClicks > 0 && easterClicks < 5 && (
                <span className="star-click-pill" aria-hidden="true">{easterClicks}/5</span>
              )}
            </button>

            {/* Other Ambient Doodles */}
            <div className="stage-doodle doodle-star-2" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
            </div>
            <div className="stage-doodle doodle-sparkle-1" aria-hidden="true">✦</div>
            <div className="stage-doodle doodle-sparkle-2" aria-hidden="true">✧</div>

            {/* Glowing Cloud Pedestal */}
            <div className="character-aura" aria-hidden="true"></div>

            {/* Character Card / Artwork Frame with Pointer Tilt */}
            <div 
              className="character-frame"
              style={{
                transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translate3d(${tilt.translateX}px, ${tilt.translateY}px, 0)`
              }}
            >
              {/* Interactive Pip Artwork Container */}
              <div 
                className={`character-artwork-container ${isPipBouncing ? 'is-pip-bouncing' : ''}`}
                onClick={handlePipTap}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePipTap() }}
                aria-label="Pip, the sleepy skull baby. Tap or click for a friendly greeting"
                title="Tap or click Pip!"
              >
                <img 
                  src="/images/pip_avatar_cloud.png" 
                  alt="Pip, the sleepy skull baby with warm glowing eyes and star-patterned nightcap, floating happily on a cloud and waving a tiny hand" 
                  className="character-image" 
                  width="440" 
                  height="440" 
                  loading="eager"
                  decoding="async"
                />

                {/* Tap Reaction Speech Bubble */}
                {pipReactionText && (
                  <div className="pip-tap-bubble" role="status" aria-live="polite">
                    <span>{pipReactionText}</span>
                  </div>
                )}
              </div>

              {/* Character Badge */}
              <div className="character-status-badge">
                <span className="badge-pin">🎀</span>
                <span className="badge-caption">Nightcap on · Starlight ready</span>
              </div>
            </div>

            {/* Floating Tag */}
            <div className="stage-note-tag" aria-hidden="true">
              <span className="note-star">★</span>
              <span>100% gentle · never scary</span>
            </div>

            {/* Secret Message Toast Card */}
            {showSecret && (
              <div className="easter-secret-card" role="dialog" aria-modal="true" aria-labelledby="secret-title">
                <div className="secret-card-sparkles" aria-hidden="true">
                  <span>✦</span><span>✧</span><span>★</span><span>✨</span>
                </div>
                <h4 id="secret-title" className="secret-card-title">Pip's Secret Starlight</h4>
                <p className="secret-card-message">
                  Psst... you found Pip's little secret!<br />
                  Dream sweetly tonight. ✨
                </p>
                <button 
                  type="button" 
                  className="secret-dismiss-btn"
                  onClick={handleDismissSecret}
                  aria-label="Dismiss Pip's secret message"
                >
                  <span>Close with a smile</span> ✦
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
