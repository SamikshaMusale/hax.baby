import { useState, useEffect, useRef, useCallback } from 'react'
import './DreamDeliveryMap.css'

interface Waypoint {
  id: string
  label: string
  role: string
  x: number
  y: number
  threshold: number
  icon: string
  caption: string
  detail: string
}

const WAYPOINTS: Waypoint[] = [
  {
    id: 'start',
    label: 'Midnight Nursery',
    role: 'START',
    x: 100,
    y: 130,
    threshold: 0.0,
    icon: '🌙',
    caption: 'Pip begins the journey.',
    detail: 'Starlight bottled, nightcaps ready, and flight corridors charted.'
  },
  {
    id: 'stop-1',
    label: 'Sleepy Cottage',
    role: 'STOP 1',
    x: 350,
    y: 220,
    threshold: 0.32,
    icon: '🏡',
    caption: 'The first dream is delivered.',
    detail: 'A gentle drop down the chimney onto a sleeping child’s quilt.'
  },
  {
    id: 'stop-2',
    label: 'Lantern-Lit Treehouse',
    role: 'STOP 2',
    x: 600,
    y: 130,
    threshold: 0.65,
    icon: '🏮',
    caption: 'A little dream reaches another sleepy friend.',
    detail: 'Twin amber lanterns guide Pip through whispering willow branches.'
  },
  {
    id: 'stop-3',
    label: "Little Dreamer's Bedroom",
    role: 'STOP 3',
    x: 830,
    y: 230,
    threshold: 0.95,
    icon: '🛏️',
    caption: 'The final delivery arrives.',
    detail: 'Soft touchdown at the bedside dormer as sweet slumber takes hold.'
  }
]

// Harmonious cubic bezier curve flowing across moonlit rooftops
const ROUTE_PATH_D = 'M 100 130 C 180 50, 260 270, 350 220 C 430 170, 520 60, 600 130 C 680 190, 750 280, 830 230'

interface DreamDeliveryMapProps {
  mode?: 'scroll' | 'interactive'
  scrollTargetRef?: React.RefObject<HTMLElement | null>
}

export const DreamDeliveryMap = ({ mode = 'scroll', scrollTargetRef }: DreamDeliveryMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const [totalLength, setTotalLength] = useState(890)
  const [progress, setProgress] = useState(mode === 'scroll' ? 0.05 : 1.0)
  const [pipCoords, setPipCoords] = useState({ x: 100, y: 130 })
  const [activeWaypointId, setActiveWaypointId] = useState('start')
  const rafIdRef = useRef<number | null>(null)

  // Measure path length on mount
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength()
      setTotalLength(len)
    }
  }, [])

  // Update Pip's cloud coordinates along the SVG path
  const updatePipPosition = useCallback((prog: number, pathLen: number) => {
    if (!pathRef.current) return
    const currentDist = Math.max(0, Math.min(pathLen, pathLen * prog))
    try {
      const point = pathRef.current.getPointAtLength(currentDist)
      setPipCoords({ x: point.x, y: point.y })
    } catch {
      // SVG point calc fallback
    }

    // Determine current active waypoint based on progression
    let active = 'start'
    for (let i = WAYPOINTS.length - 1; i >= 0; i--) {
      if (prog >= WAYPOINTS[i].threshold - 0.05) {
        active = WAYPOINTS[i].id
        break
      }
    }
    setActiveWaypointId(active)
  }, [])

  // Scroll-synchronized calculation
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setProgress(1.0)
      if (pathRef.current) {
        updatePipPosition(1.0, totalLength)
      }
      return
    }

    if (mode !== 'scroll') return

    const handleScroll = () => {
      if (rafIdRef.current) return

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null
        const targetEl = scrollTargetRef?.current || containerRef.current
        if (!targetEl) return

        const rect = targetEl.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Progressive reveal starts as element enters viewport (top at 82%)
        // and completes when element is comfortably centered (top at 22%)
        const startY = viewportHeight * 0.82
        const endY = viewportHeight * 0.22
        const totalDistance = (startY - endY) + (rect.height * 0.45)
        const currentPos = startY - rect.top

        const rawProgress = currentPos / totalDistance
        const clamped = Math.max(0, Math.min(1.0, rawProgress))

        setProgress(clamped)
        updatePipPosition(clamped, totalLength)
      })
    }

    // Initial check and event binding
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafIdRef.current) {
        window.cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [mode, scrollTargetRef, totalLength, updatePipPosition])

  // Interactive jump to a waypoint (used in modal or manual exploration)
  const jumpToWaypoint = (wp: Waypoint) => {
    setProgress(wp.threshold === 0 ? 0.05 : wp.threshold)
    updatePipPosition(wp.threshold === 0 ? 0.05 : wp.threshold, totalLength)
  }

  // Dashoffset calculation
  const strokeDashoffset = totalLength * (1 - progress)

  // Current active waypoint object for narration
  const currentWaypoint = WAYPOINTS.find(w => w.id === activeWaypointId) || WAYPOINTS[0]

  return (
    <div 
      ref={containerRef} 
      className={`dream-delivery-map-card ${mode === 'interactive' ? 'is-interactive-mode' : ''}`}
      aria-label="Interactive map of Pip's Dream Delivery Routes across the moonlit neighborhood"
    >
      {/* Map Header */}
      <div className="delivery-map-header">
        <div className="map-badge">
          <span className="map-badge-icon" aria-hidden="true">🗺️</span>
          <span>Pip's Nocturnal Village Cartography</span>
        </div>

        <div className="map-story-pill" role="status" aria-live="polite">
          <span className="pill-dot" aria-hidden="true"></span>
          <span className="pill-text">
            <strong>{currentWaypoint.label}</strong> — {currentWaypoint.caption}
          </span>
        </div>

        <div className="map-scroll-hint" aria-hidden="true">
          {mode === 'scroll' ? (
            <span>★ Scroll page to chart Pip's route</span>
          ) : (
            <span>★ Click destinations to preview flight</span>
          )}
        </div>
      </div>

      {/* SVG Canvas Map — Rich Bedtime Village Illustration */}
      <div className="delivery-svg-viewport">
        <svg
          viewBox="0 0 940 360"
          className="delivery-route-svg"
          role="img"
          aria-labelledby="delivery-map-svg-title delivery-map-svg-desc"
        >
          <title id="delivery-map-svg-title">Pip's Dream Delivery Flight Map</title>
          <desc id="delivery-map-svg-desc">
            An illustrated nocturnal map showing Pip delivering dreams across the moonlit neighborhood, from Midnight Nursery to Sleepy Cottage, Lantern-Lit Treehouse, and Little Dreamer's Bedroom.
          </desc>

          <defs>
            {/* Sky Background Gradient */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#181024" />
              <stop offset="60%" stopColor="#251638" />
              <stop offset="100%" stopColor="#2e1b42" />
            </linearGradient>

            {/* Glowing Golden Stardust Route Gradient */}
            <linearGradient id="goldenRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="75%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#df6890" stopOpacity="1" />
            </linearGradient>

            {/* Soft Route Glow Filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Warm Honey Window Glow */}
            <radialGradient id="windowGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
              <stop offset="45%" stopColor="#fde047" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e89528" stopOpacity="0.3" />
            </radialGradient>

            {/* Lantern Glow */}
            <radialGradient id="lanternAuraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deep Night Sky Canvas Frame */}
          <rect x="0" y="0" width="940" height="360" rx="22" fill="url(#skyGrad)" className="map-sky-rect" />

          {/* Background Distant Starlit Hills */}
          <path
            d="M 0 360 L 0 295 C 120 280, 240 310, 380 290 C 520 270, 680 305, 820 285 C 890 275, 940 285, 940 360 Z"
            fill="#1e132c"
            opacity="0.8"
          />

          {/* Ambient Starlight Dots & Twinkling Constellations */}
          <g className="map-stars" aria-hidden="true">
            <circle cx="65" cy="45" r="1.5" fill="#fef3c7" opacity="0.8" />
            <circle cx="150" cy="35" r="2" fill="#fff" opacity="0.95" />
            <circle cx="230" cy="65" r="1.5" fill="#fef3c7" opacity="0.75" />
            <circle cx="310" cy="30" r="2.5" fill="#fff" opacity="0.9" />
            <circle cx="430" cy="50" r="1.5" fill="#fef3c7" opacity="0.8" />
            <circle cx="510" cy="25" r="2.5" fill="#fff" opacity="0.95" />
            <circle cx="680" cy="35" r="2" fill="#fff" opacity="0.9" />
            <circle cx="760" cy="55" r="1.5" fill="#fef3c7" opacity="0.75" />
            <circle cx="890" cy="40" r="2" fill="#fff" opacity="0.95" />
            <circle cx="280" cy="95" r="1.2" fill="#fef3c7" opacity="0.65" />
            <circle cx="720" cy="90" r="1.2" fill="#fef3c7" opacity="0.65" />
            {/* Little Stardust Crosses */}
            <text x="195" y="45" fill="#fbbf24" fontSize="12" opacity="0.8">✦</text>
            <text x="560" y="32" fill="#fbbf24" fontSize="11" opacity="0.85">✧</text>
            <text x="815" y="52" fill="#fbbf24" fontSize="12" opacity="0.8">✦</text>
          </g>

          {/* Crescent Moon with Cozy Starlight Halo */}
          <g className="map-moon-group" transform="translate(470, 38)" aria-hidden="true">
            <circle cx="0" cy="0" r="32" fill="rgba(254, 243, 199, 0.15)" filter="blur(8px)" />
            <path
              d="M -16 -16 A 22 22 0 1 0 10 16 A 17 17 0 1 1 -16 -16 Z"
              fill="#fef3c7"
              filter="drop-shadow(0 0 10px rgba(254, 243, 199, 0.7))"
            />
            <circle cx="5" cy="-2" r="1" fill="#e89528" opacity="0.4" />
            <circle cx="-2" cy="7" r="1.5" fill="#e89528" opacity="0.3" />
          </g>

          {/* Soft Floating Bedtime Clouds */}
          <g className="map-floating-clouds" aria-hidden="true">
            {/* Cloud near Nursery */}
            <path
              d="M 50 180 C 50 160, 75 155, 90 165 C 105 150, 135 152, 145 168 C 160 165, 175 178, 170 195 L 45 195 C 40 190, 42 182, 50 180 Z"
              fill="#2a1b3d"
              opacity="0.9"
            />
            {/* Cloud in Central Sky */}
            <path
              d="M 380 95 C 380 82, 400 78, 412 85 C 424 74, 448 76, 456 88 C 468 85, 480 95, 476 108 L 375 108 C 370 104, 372 98, 380 95 Z"
              fill="#341f4a"
              opacity="0.75"
            />
          </g>

          {/* Illustrated Village Architecture & Scenery */}
          <g className="village-architecture" aria-hidden="true">
            {/* 1. START: Celestial Midnight Nursery Tower & Cloud Pedestal */}
            <g transform="translate(60, 170)">
              <path d="M 15 130 C 15 100, 35 70, 40 40 L 45 40 L 45 10 L 42 10 L 42 0 L 48 0 L 48 10 L 45 10 L 50 40 C 55 70, 75 100, 75 130 Z" fill="#2d1c42" />
              <circle cx="45" cy="40" r="14" fill="#3b2354" />
              <circle cx="45" cy="40" r="6" fill="url(#windowGlowGrad)" />
              <path d="M 45 -6 L 49 2 L 41 2 Z" fill="#fbbf24" />
              {/* Cloud Fluff Pedestal */}
              <path d="M -10 130 C -10 110, 15 105, 30 112 C 45 100, 75 100, 90 112 C 105 105, 130 110, 130 130 Z" fill="#3d2559" />
            </g>

            {/* 2. STOP 1: Sleepy Cottage with Peaked Roof & Chimney */}
            <g transform="translate(290, 240)">
              <rect x="25" y="45" width="95" height="75" rx="3" fill="#2d1c40" />
              {/* Pitched Roof with tiles */}
              <path d="M 15 48 L 72.5 5 L 130 48 Z" fill="#462758" stroke="#5a336f" strokeWidth="1" />
              {/* Chimney & Soft Drifting Smoke */}
              <rect x="95" y="10" width="14" height="28" fill="#241634" />
              <circle cx="102" cy="0" r="4" fill="rgba(254, 243, 199, 0.45)" />
              <circle cx="105" cy="-8" r="5" fill="rgba(254, 243, 199, 0.3)" />
              <circle cx="109" cy="-17" r="6" fill="rgba(254, 243, 199, 0.15)" />
              {/* Glowing Mullioned Windows */}
              <rect x="42" y="55" width="22" height="26" rx="2" fill="url(#windowGlowGrad)" />
              <line x1="53" y1="55" x2="53" y2="81" stroke="#2d1c40" strokeWidth="1.5" />
              <line x1="42" y1="68" x2="64" y2="68" stroke="#2d1c40" strokeWidth="1.5" />
              <rect x="80" y="55" width="22" height="26" rx="2" fill="url(#windowGlowGrad)" />
              <line x1="91" y1="55" x2="91" y2="81" stroke="#2d1c40" strokeWidth="1.5" />
              <line x1="80" y1="68" x2="102" y2="68" stroke="#2d1c40" strokeWidth="1.5" />
            </g>

            {/* 3. STOP 2: Lantern-Lit Treehouse & Willow Boughs */}
            <g transform="translate(540, 160)">
              {/* Sturdy Oak Trunk & Roots */}
              <path d="M 50 160 C 50 110, 58 75, 62 45 C 45 45, 30 25, 45 5 C 50 -5, 75 -5, 80 5 C 95 25, 80 45, 68 45 C 72 75, 80 110, 80 160 Z" fill="#251636" />
              {/* Lush Tree Foliage Canopies */}
              <circle cx="40" cy="18" r="32" fill="#1b2a26" opacity="0.9" />
              <circle cx="85" cy="12" r="35" fill="#22362f" opacity="0.9" />
              <circle cx="60" cy="-10" r="30" fill="#2a423a" opacity="0.9" />
              {/* Rustic Treehouse Cabin */}
              <rect x="42" y="15" width="40" height="28" rx="3" fill="#462c52" stroke="#5d3b6e" strokeWidth="1" />
              <path d="M 38 16 L 62 -4 L 86 16 Z" fill="#321e3d" />
              <circle cx="62" cy="28" r="7" fill="url(#windowGlowGrad)" />
              {/* Hanging Amber Lantern with Swinging Glow */}
              <line x1="84" y1="38" x2="84" y2="52" stroke="#fbbf24" strokeWidth="1.5" />
              <circle cx="84" cy="56" r="12" fill="url(#lanternAuraGrad)" />
              <rect x="80" y="50" width="8" height="11" rx="2" fill="#fbbf24" stroke="#e89528" strokeWidth="1" />
            </g>

            {/* 4. STOP 3: Little Dreamer's Bedroom Dormer Roof */}
            <g transform="translate(770, 245)">
              <rect x="20" y="40" width="100" height="75" rx="3" fill="#2d1c40" />
              {/* Cozy Sloped Tile Roof with Dormer Gable */}
              <path d="M 10 45 L 70 5 L 130 45 Z" fill="#482755" />
              <rect x="45" y="16" width="40" height="34" rx="2" fill="#331e40" />
              <path d="M 40 18 L 65 -4 L 90 18 Z" fill="#583168" />
              {/* Bedroom Window with Soft Curtains and Nightlight */}
              <rect x="52" y="22" width="26" height="24" rx="2" fill="url(#windowGlowGrad)" />
              {/* Curtain Drapery Silhouettes */}
              <path d="M 52 22 C 58 28, 56 36, 52 46 L 52 22 Z" fill="#2d1c40" />
              <path d="M 78 22 C 72 28, 74 36, 78 46 L 78 22 Z" fill="#2d1c40" />
              {/* Sleepy Stardust rising from dormer */}
              <text x="61" y="15" fill="#fef08a" fontSize="10">✨</text>
            </g>
          </g>

          {/* 1. Underlying Base Guide Path (Dashed Stardust Trail) */}
          <path
            d={ROUTE_PATH_D}
            fill="none"
            stroke="rgba(232, 149, 40, 0.25)"
            strokeWidth="3.5"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />

          {/* 2. Scroll-Synchronized Animated Golden Starlight Path */}
          <path
            ref={pathRef}
            d={ROUTE_PATH_D}
            fill="none"
            stroke="url(#goldenRouteGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#routeGlow)"
            style={{
              strokeDasharray: totalLength,
              strokeDashoffset: strokeDashoffset,
              transition: mode === 'interactive' ? 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'stroke-dashoffset 0.08s linear'
            }}
          />

          {/* 3. Destination Waypoint Nodes & Non-overlapping Labels */}
          {WAYPOINTS.map(wp => {
            const isReached = progress >= wp.threshold - 0.03
            const isCurrent = activeWaypointId === wp.id

            return (
              <g
                key={wp.id}
                className={`map-waypoint-group ${isReached ? 'is-reached' : ''} ${isCurrent ? 'is-current' : ''}`}
                transform={`translate(${wp.x}, ${wp.y})`}
              >
                {/* Radiant Pulse Aura when reached */}
                {isReached && (
                  <circle
                    cx="0"
                    cy="0"
                    r="25"
                    fill="none"
                    stroke="var(--color-amber)"
                    strokeWidth="1.5"
                    opacity="0.5"
                    className="waypoint-pulse-ring"
                  />
                )}

                {/* Outer Waypoint Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="17"
                  className="waypoint-outer-circle"
                />

                {/* Inner Waypoint Core */}
                <circle
                  cx="0"
                  cy="0"
                  r="13"
                  className="waypoint-inner-circle"
                />

                {/* Waypoint Icon */}
                <text
                  x="0"
                  y="4.5"
                  textAnchor="middle"
                  fontSize="13"
                  className="waypoint-icon-text"
                >
                  {wp.icon}
                </text>

                {/* Non-overlapping Destination Label Pill (Positioned above or below path) */}
                <g transform={`translate(0, ${wp.y > 180 ? 36 : -32})`}>
                  <rect
                    x="-85"
                    y="-13"
                    width="170"
                    height="26"
                    rx="13"
                    className="waypoint-label-bg"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    className="waypoint-label-text"
                  >
                    {wp.label}
                  </text>
                </g>
              </g>
            )
          })}

          {/* 4. Pip's Moving Starlight Cloud Avatar */}
          <g
            className="map-pip-avatar"
            transform={`translate(${pipCoords.x}, ${pipCoords.y})`}
            aria-hidden="true"
          >
            {/* Trailing Stardust Wake */}
            <circle cx="-16" cy="2" r="3" fill="#fbbf24" opacity="0.7" />
            <circle cx="-24" cy="5" r="2" fill="#fef08a" opacity="0.5" />
            <circle cx="0" cy="0" r="20" fill="rgba(254, 243, 199, 0.45)" filter="blur(5px)" />
            
            {/* Fluffy Cloud Body */}
            <path
              d="M -14 3 C -14 -4, -6 -9, 2 -6 C 7 -10, 16 -8, 16 0 C 20 2, 20 9, 14 10 L -12 10 C -16 10, -17 6, -14 3 Z"
              fill="#fff8f1"
              stroke="var(--color-berry)"
              strokeWidth="1.5"
            />
            {/* Pip's Nightcap Bow */}
            <circle cx="4" cy="-5" r="2.5" fill="var(--color-berry)" />
            {/* Twinkling Wand Sparkle */}
            <text x="11" y="-5" fontSize="11" fill="#fbbf24">✦</text>
          </g>
        </svg>
      </div>

      {/* Accessible Destination Cards & Interactive Waypoint Selector */}
      <div className="delivery-destinations-row" role="region" aria-label="Dream delivery waypoints list">
        {WAYPOINTS.map(wp => {
          const isReached = progress >= wp.threshold - 0.03
          const isCurrent = activeWaypointId === wp.id

          return (
            <button
              key={wp.id}
              type="button"
              className={`destination-card-btn ${isReached ? 'is-reached' : ''} ${isCurrent ? 'is-active' : ''}`}
              onClick={() => jumpToWaypoint(wp)}
              aria-label={`${wp.role}: ${wp.label}. ${wp.caption} ${isReached ? '(Reached by Pip)' : ''}`}
            >
              <div className="destination-top">
                <span className="dest-role-badge">{wp.role}</span>
                <span className="dest-icon" aria-hidden="true">{wp.icon}</span>
              </div>
              <h5 className="dest-name">{wp.label}</h5>
              <p className="dest-caption">{wp.caption}</p>
              <p className="dest-detail">{wp.detail}</p>
              <div className="dest-status-badge">
                {isReached ? (
                  <span className="status-pill reached-pill">★ Stardust Delivered</span>
                ) : (
                  <span className="status-pill pending-pill">En Route</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
