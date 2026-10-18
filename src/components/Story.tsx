import { useState, useEffect, useRef } from 'react'
import { DreamDeliveryMap } from './DreamDeliveryMap'
import './Story.css'

interface StoryScene {
  id: string
  chapter: string
  title: string
  tagline: string
  description: string
  secondaryNote: string
  icon: string
  imageSrc: string
  imageAlt: string
}

const STORY_SCENES: StoryScene[] = [
  {
    id: 'scene-01',
    chapter: 'CHAPTER 01',
    title: 'Scene 01 — A Little Star',
    tagline: 'A quiet awakening in the Midnight Nursery',
    description:
      'Pip wakes beneath a blanket of stars in a quiet corner of the Midnight Nursery and discovers that a little creature nearby cannot settle into sleep.',
    secondaryNote:
      'With warm amber pinpricks glowing in soft eye sockets, a tiny crooked smile, and a starry nightcap tied with a pink bow, Pip—our sleepy skull baby—notices a little creature tossing and turning beneath the quiet moon, unable to find rest.',
    icon: '✨',
    imageSrc: '/images/story/scene-01-a-little-star.png',
    imageAlt: 'Scene 01 — A restless little creature tossing and turning beneath the stars, discovered by Pip in the Midnight Nursery'
  },
  {
    id: 'scene-02',
    chapter: 'CHAPTER 02',
    title: 'Scene 02 — The First Lullaby',
    tagline: 'Soft chimes for restless dreamers',
    description:
      'Pip creates a gentle lullaby and discovers that music can soothe restless dreamers into deep slumber.',
    secondaryNote:
      'Tuning cloud-fluff winding gears and gentle starry chimes into a music box, Pip plays the very first lullaby. Watching the little creature’s eyelids flutter softly shut, Pip learns that music can turn any uneasy night into peace.',
    icon: '🎵',
    imageSrc: '/images/story/scene-02-the-first-lullaby.png',
    imageAlt: "Scene 02 — Pip's handcrafted lullaby music box sending soothing star chimes to quiet the night"
  },
  {
    id: 'scene-03',
    chapter: 'CHAPTER 03',
    title: 'Scene 03 — A Little Light',
    tagline: 'A reassuring lantern for the dark',
    description:
      'Pip creates a warm nightlight so little creatures feel safe and comforted in the dark.',
    secondaryNote:
      'Realizing that shadows can still feel scary after the lullaby fades, Pip carves a glowing crescent moon lantern. Its honey-amber warmth casts friendly dancing shapes, reassuring little dreamers that they are never alone.',
    icon: '🏮',
    imageSrc: '/images/story/scene-03-a-little-light.png',
    imageAlt: 'Scene 03 — A warm glowing crescent moon nightlight lantern crafted by Pip to comfort sleepy creatures'
  },
  {
    id: 'scene-04',
    chapter: 'CHAPTER 04',
    title: 'Scene 04 — Dream Delivery',
    tagline: 'Adventures across the moonlit neighborhood',
    description:
      'Pip combines these ideas and begins delivering little adventures across the moonlit neighborhood as a Junior Dream Engineer.',
    secondaryNote:
      'Floating high above the sleeping town on a gentle moonlit cloud, Pip charts quiet rooftop corridors—tucking lullabies, lanterns, and sweet adventures beneath every pillow before the morning sun rises.',
    icon: '☁️',
    imageSrc: '/images/story/scene-04-dream-delivery.png',
    imageAlt: 'Scene 04 — Pip flying across moonlit rooftops on a nighttime cloud, delivering dreams to neighborhood bedrooms'
  }
]

export const Story = () => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)
  const sceneRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sceneRefs.current.forEach((el, index) => {
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view')
              setActiveSceneIndex(index)
            }
          })
        },
        {
          rootMargin: '-15% 0px -25% 0px',
          threshold: 0.2
        }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      observers.forEach((obs) => obs.disconnect())
    }
  }, [])

  const scrollToScene = (index: number) => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sceneRefs.current[index]?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center'
    })
  }

  return (
    <section id="story" className="story-section" aria-labelledby="story-heading">
      <div className="content-wrap story-container">
        {/* Section Header */}
        <div className="story-header">
          <div className="story-eyebrow">
            <span className="eyebrow-sparkle" aria-hidden="true">★</span>
            <span>PIP'S ORIGIN STORY</span>
            <span className="eyebrow-sparkle" aria-hidden="true">★</span>
          </div>

          <h2 id="story-heading" className="story-title">
            How a tiny skull baby became a Dream Engineer
          </h2>

          <p className="story-lead">
            Every dream has a beginning. Step through the bedtime memories of Pip's journey from a quiet starlight awakening to guiding sleepy creatures into sweet adventures.
          </p>

          {/* Connected Chapter Quick-Track */}
          <nav className="story-nav-ribbon" aria-label="Story chapter progress">
            {STORY_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                type="button"
                className={`ribbon-step-btn ${activeSceneIndex === idx ? 'is-active' : ''}`}
                onClick={() => scrollToScene(idx)}
                aria-label={`Jump to ${scene.title}`}
                aria-current={activeSceneIndex === idx ? 'step' : undefined}
              >
                <span className="ribbon-step-icon" aria-hidden="true">{scene.icon}</span>
                <span className="ribbon-step-label">{scene.chapter}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Four Story Chapter Scenes with Connecting Star Spine */}
        <div className="story-chapters-flow">
          {/* Central Star Trail Spine (Scoped between chapter cards) */}
          <div className="story-track-spine" aria-hidden="true">
            <span className="spine-star-cap top-cap">✦</span>
            <div 
              className="story-track-progress"
              style={{ height: `${((activeSceneIndex + 1) / STORY_SCENES.length) * 100}%` }}
            />
            <span className="spine-star-cap bottom-cap">✦</span>
          </div>

          {STORY_SCENES.map((scene, index) => {
            const isEven = index % 2 === 1
            return (
              <article
                key={scene.id}
                id={scene.id}
                ref={(el) => { sceneRefs.current[index] = el }}
                className={`story-chapter ${isEven ? 'chapter-reversed' : ''}`}
                aria-labelledby={`title-${scene.id}`}
              >
                {/* Visual Picture-Book Art Frame */}
                <div className="chapter-art-column">
                  <div className="picturebook-frame">
                    <div className="frame-corner corner-tl" aria-hidden="true">✦</div>
                    <div className="frame-corner corner-tr" aria-hidden="true">✦</div>
                    <div className="frame-corner corner-bl" aria-hidden="true">✦</div>
                    <div className="frame-corner corner-br" aria-hidden="true">✦</div>

                    <img
                      src={scene.imageSrc}
                      alt={scene.imageAlt}
                      className="chapter-illustration"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="frame-badge">
                      <span className="frame-badge-icon" aria-hidden="true">{scene.icon}</span>
                      <span>{scene.chapter}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Copy Column */}
                <div className="chapter-narrative-column">
                  <div className="narrative-tag">
                    <span className="narrative-tag-star" aria-hidden="true">✧</span>
                    <span>{scene.tagline}</span>
                  </div>

                  <h3 id={`title-${scene.id}`} className="chapter-title">
                    {scene.title}
                  </h3>

                  <p className="chapter-lead-text">
                    {scene.description}
                  </p>

                  <p className="chapter-detail-text">
                    {scene.secondaryNote}
                  </p>

                  <div className="chapter-footer-stamp">
                    <span className="stamp-icon" aria-hidden="true">🎀</span>
                    <span className="stamp-text">Midnight Nursery Chronicle · Memory {index + 1} of 4</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Illustrated SVG Flight Map Connected to Scene 04 (Clear of the chapter spine line) */}
        <div className="story-flight-map-section">
          <div className="flight-map-header-note">
            <span className="flight-note-pin" aria-hidden="true">🗺️</span>
            <div>
              <h4 className="flight-map-heading">Pip's Active Flight Corridors</h4>
              <p className="flight-map-caption">
                Watch the golden route trace its path across moonlit rooftops as you journey through Pip's deliveries.
              </p>
            </div>
          </div>
          <DreamDeliveryMap mode="scroll" />
        </div>
      </div>
    </section>
  )
}
