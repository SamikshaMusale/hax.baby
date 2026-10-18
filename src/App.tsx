import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Story } from './components/Story'
import { Footer } from './components/Footer'

export function App() {
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    try {
      const saved = localStorage.getItem('pip-theme')
      if (saved === 'day' || saved === 'night') {
        return saved
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'night'
      }
    } catch {
      // LocalStorage or matchMedia unavailable
    }
    return 'day'
  })

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('pip-theme', theme)
    } catch {
      // Storage access blocked or restricted
    }
  }, [theme])

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'day' ? 'night' : 'day'))
  }

  return (
    <div className="site-wrapper">
      <a href="#hero-title" className="skip-link">Skip to main content</a>
      <Header theme={theme} onToggleTheme={handleToggleTheme} />
      <main className="main-content" id="main-content">
        <Hero />
        <Projects />
        <Story />
      </main>
      <Footer />
    </div>
  )
}

export default App
