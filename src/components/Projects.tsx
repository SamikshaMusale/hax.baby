import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LullabyMusicBox } from './LullabyMusicBox'
import { DreamDeliveryMap } from './DreamDeliveryMap'
import './Projects.css'

interface ProjectData {
  id: string
  title: string
  tag: string
  tagIcon: string
  description: string
  imageSrc?: string
  imageAlt?: string
  isSvgIllustration?: boolean
  craftStory: {
    howItWorks: string
    specialDetail: string
    nurseryReport: string
  }
}

const PROJECTS: ProjectData[] = [
  {
    id: 'lullaby-lab',
    title: 'The Lullaby Lab',
    tag: 'Bedtime Melody Craft',
    tagIcon: '🎵',
    description:
      'Tiny melodies for tiny dreamers. I turn sleepy notes into gentle lullabies that help little creatures drift off to dreamland.',
    imageSrc: '/images/pip_lullaby_box.png',
    imageAlt: "The Lullaby Lab — Pip's pastel music box with golden winding key and floating star chimes",
    craftStory: {
      howItWorks:
        'Composed around three soothing bedtime chords: G-sharp, B-flat, and the whispering hush of falling stardust.',
      specialDetail:
        'Fitted with a cloud-fluff winding spring so the internal gears spin in whisper-quiet harmony, never ticking loudly.',
      nurseryReport:
        'Tested and approved by 42 sleepy squirrels, 18 baby bats, and one very drowsy moonbeam.'
    }
  },
  {
    id: 'nightlight-collection',
    title: 'The Nightlight Collection',
    tag: 'Bedside Glow Craft',
    tagIcon: '🏮',
    description:
      'Little lanterns, big comfort. Each nightlight brings a warm, reassuring glow to the corners where little dreamers sleep.',
    imageSrc: '/images/pip_dream_lantern.png',
    imageAlt: "The Nightlight Collection — Pip's glowing crescent moon porcelain lamp with cozy brass handle",
    craftStory: {
      howItWorks:
        'Cast from soft midnight porcelain and illuminated by a gentle spark of captured twilight.',
      specialDetail:
        'Tuned to a 2400K warm honey-amber aura that chases away shadows without startling drowsy eyelids.',
      nurseryReport:
        'Stays warm and reassuring until first dawn, then softly dims when morning songbirds begin to chirp.'
    }
  },
  {
    id: 'dream-delivery-routes',
    title: 'Dream Delivery Routes',
    tag: 'Nocturnal Sky Cartography',
    tagIcon: '🗺️',
    description:
      'A tiny journey across sleepy rooftops. I map the gentlest routes to deliver just the right dreams to every little bedroom.',
    isSvgIllustration: true,
    craftStory: {
      howItWorks:
        'Hand-charted across starlight parchment, mapping safe flight corridors between chimney tops and willow branches.',
      specialDetail:
        'Includes soft cloud-cushioned landing spots on every rooftop for whisper-quiet dream drops.',
      nurseryReport:
        'Average flight time from the Midnight Nursery to bedside: 4 minutes before deep REM sleep begins.'
    }
  }
]

export const Projects = () => {
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null)
  const triggerRefMap = useRef<Record<string, HTMLButtonElement | null>>({})
  const modalCloseButtonRef = useRef<HTMLButtonElement | null>(null)

  // Manage Escape key and focus return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeProject) {
        closeModal()
      }
    }

    if (activeProject) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
      // Focus the close button for accessibility
      setTimeout(() => {
        modalCloseButtonRef.current?.focus()
      }, 50)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeProject])

  const openModal = (project: ProjectData) => {
    setActiveProject(project)
  }

  const closeModal = () => {
    const closedId = activeProject?.id
    setActiveProject(null)
    // Return focus to triggering button
    if (closedId && triggerRefMap.current[closedId]) {
      triggerRefMap.current[closedId]?.focus()
    }
  }

  return (
    <section id="projects" className="projects-section" aria-labelledby="projects-heading">
      <div className="content-wrap projects-container">
        {/* Section Header */}
        <div className="projects-header">
          <div className="projects-eyebrow">
            <span className="eyebrow-sparkle" aria-hidden="true">✦</span>
            <span>A LITTLE MAGIC, MADE BY PIP</span>
            <span className="eyebrow-sparkle" aria-hidden="true">✦</span>
          </div>

          <h2 id="projects-heading" className="projects-title">
            Little things I've dreamed up
          </h2>

          <p className="projects-lead">
            Every little dream starts somewhere. Here are three of my favorite creations from the Midnight Nursery.
          </p>
        </div>

        {/* 3 Project Cards Grid */}
        <div className="projects-grid">
          {PROJECTS.map((project) => (
            <article 
              key={project.id} 
              className={`project-card card-${project.id}`}
              aria-labelledby={`card-title-${project.id}`}
            >
              {/* Card Media Preview */}
              <div className="project-media-wrap">
                {project.imageSrc ? (
                  <div className="project-image-container">
                    <img 
                      src={project.imageSrc} 
                      alt={project.imageAlt || project.title}
                      className="project-image"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  /* Route Decorative Illustrated Map */
                  <div className="route-illustration-stage" aria-label="Illustrated dream flight route over sleepy rooftops under a glowing moon">
                    <svg className="route-svg" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="320" height="220" rx="16" fill="#2d1d36" />
                      
                      {/* Deep night stars */}
                      <g className="route-stars" fill="#fff" opacity="0.8">
                        <circle cx="45" cy="35" r="1.5" />
                        <circle cx="110" cy="22" r="2" />
                        <circle cx="180" cy="40" r="1.2" />
                        <circle cx="260" cy="28" r="1.8" />
                        <circle cx="295" cy="65" r="1.2" />
                        <circle cx="30" cy="85" r="1.5" />
                        <circle cx="145" cy="70" r="1" />
                        <circle cx="230" cy="80" r="2" />
                      </g>

                      {/* Glowing Crescent Moon */}
                      <g className="route-moon" transform="translate(245, 25)">
                        <circle cx="20" cy="20" r="18" fill="#fef3c7" />
                        <circle cx="14" cy="15" r="15" fill="#2d1d36" />
                        <circle cx="20" cy="20" r="24" fill="#fef3c7" opacity="0.12" />
                      </g>

                      {/* Gentle Constellation lines */}
                      <path d="M45 35 L75 50 L110 22" stroke="rgba(254, 243, 199, 0.3)" strokeDasharray="2 3" strokeWidth="1" />
                      <path d="M230 80 L260 28 L295 65" stroke="rgba(254, 243, 199, 0.3)" strokeDasharray="2 3" strokeWidth="1" />

                      {/* Dotted Delivery Flight Path */}
                      <path 
                        d="M30 140 C 70 80, 120 120, 160 70 C 200 30, 240 100, 285 110" 
                        stroke="#e89528" 
                        strokeWidth="2.5" 
                        strokeDasharray="5 5" 
                        strokeLinecap="round" 
                        className="flight-path"
                      />

                      {/* Delivery waypoints */}
                      <circle cx="30" cy="140" r="5" fill="#ffccd8" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="160" cy="70" r="5.5" fill="#e89528" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="285" cy="110" r="6" fill="#a34063" stroke="#fff" strokeWidth="1.5" />

                      {/* Starlight pulse at destination */}
                      <path d="M285 98 L287 107 L296 110 L287 113 L285 122 L283 113 L274 110 L283 107 Z" fill="#fef3c7" />

                      {/* Sleepy Rooftops Silhouette */}
                      <path 
                        d="M0 220 L0 185 L35 155 L70 185 L70 170 L115 135 L160 170 L195 145 L230 175 L230 160 L275 130 L320 170 L320 220 Z" 
                        fill="#1b1022" 
                      />
                      
                      {/* Cozy glowing windows */}
                      <rect x="25" y="190" width="8" height="10" rx="1.5" fill="#fef08a" opacity="0.85" />
                      <rect x="135" y="180" width="8" height="10" rx="1.5" fill="#fde047" opacity="0.9" />
                      <rect x="250" y="175" width="8" height="10" rx="1.5" fill="#fef08a" opacity="0.8" />
                      
                      {/* Cute Chimney with subtle cloud puff */}
                      <rect x="80" y="155" width="10" height="18" fill="#1b1022" />
                      <circle cx="85" cy="145" r="4" fill="rgba(255, 255, 255, 0.45)" />
                      <circle cx="88" cy="138" r="5" fill="rgba(255, 255, 255, 0.3)" />
                    </svg>
                  </div>
                )}

                <div className="project-badge">
                  <span className="badge-icon" aria-hidden="true">{project.tagIcon}</span>
                  <span className="badge-text">{project.tag}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="project-body">
                <h3 id={`card-title-${project.id}`} className="project-title">
                  {project.title}
                </h3>

                <p className="project-description">
                  {project.description}
                </p>

                {/* Working "Peek inside" control */}
                <div className="project-footer">
                  <button 
                    ref={(el) => { triggerRefMap.current[project.id] = el }}
                    type="button" 
                    className="peek-inside-btn"
                    onClick={() => openModal(project)}
                    aria-haspopup="dialog"
                    aria-expanded={activeProject?.id === project.id}
                  >
                    <span>Peek inside</span>
                    <span className="btn-sparkle" aria-hidden="true">✦</span>
                  </button>

                  {project.id === 'lullaby-lab' && (
                    <span className="card-feature-hint">
                      <span className="hint-icon" aria-hidden="true">🎵</span> Play melody
                    </span>
                  )}
                  {project.id === 'dream-delivery-routes' && (
                    <span className="card-feature-hint">
                      <span className="hint-icon" aria-hidden="true">🗺️</span> Explore route
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Accessible Detail Modal portaled to document.body */}
      {activeProject && typeof document !== 'undefined' && createPortal(
        <div 
          className="modal-backdrop" 
          onClick={closeModal} 
          role="presentation"
        >
          <div 
            className="modal-card" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-tag">
                <span className="modal-tag-icon">{activeProject.tagIcon}</span>
                <span>{activeProject.tag}</span>
              </div>
              
              <button 
                ref={modalCloseButtonRef}
                type="button" 
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Close detail modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Title & Intro */}
            <h3 id="modal-title" className="modal-title">
              {activeProject.title}
            </h3>

            <p id="modal-desc" className="modal-lead-desc">
              {activeProject.description}
            </p>

            {/* Project Preview & Interactive Experience inside Modal */}
            {activeProject.id === 'lullaby-lab' ? (
              <div className="modal-interactive-feature">
                {/* Dedicated Interactive Music Box with Pip's Official Artwork & Web Audio */}
                <LullabyMusicBox />
              </div>
            ) : activeProject.id === 'dream-delivery-routes' ? (
              <div className="modal-interactive-feature">
                {/* Interactive Flight Cartography Map */}
                <DreamDeliveryMap mode="interactive" />
              </div>
            ) : (
              <div className="modal-preview-frame">
                {activeProject.imageSrc ? (
                  <img 
                    src={activeProject.imageSrc} 
                    alt={activeProject.imageAlt || activeProject.title} 
                    className="modal-preview-img"
                  />
                ) : (
                  <div className="modal-preview-note">
                    <span className="preview-note-star">★</span>
                    <span>Direct from Pip's Nocturnal Navigator Table</span>
                  </div>
                )}
              </div>
            )}

            {/* Pip's Workshop Craft Notes */}
            <div className="modal-notes-box">
              <h4 className="notes-box-heading">
                <span className="notes-icon" aria-hidden="true">📖</span>
                <span>Pip's Workshop Field Notes</span>
              </h4>

              <div className="notes-item">
                <strong>How it's crafted:</strong>
                <p>{activeProject.craftStory.howItWorks}</p>
              </div>

              <div className="notes-item">
                <strong>Pip's gentle secret:</strong>
                <p>{activeProject.craftStory.specialDetail}</p>
              </div>

              <div className="notes-item nursery-verdict">
                <strong>Midnight Nursery Log:</strong>
                <p>{activeProject.craftStory.nurseryReport}</p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="modal-dismiss-btn"
                onClick={closeModal}
              >
                Close notes &amp; return to lab
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
