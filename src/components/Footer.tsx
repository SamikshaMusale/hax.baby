import './Footer.css'

export const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="content-wrap footer-inner">
        <div className="footer-badges">
          <span className="footer-tag">haX.baby · Baby's First Website Hackathon</span>
          <span className="footer-tag">Track 1: Pip, the Skull Baby</span>
        </div>

        <p className="footer-canon-note">
          Pip is a Junior Dream Engineer at the Midnight Nursery. Official character canon &amp; artwork by <a href="https://hax.baby" target="_blank" rel="noopener noreferrer">haX.baby</a>.
        </p>

        <p className="footer-craft-note">
          Crafted with warm cream <span className="color-dot cream-dot" title="#fff8f1"></span>, rich berry <span className="color-dot berry-dot" title="#a34063"></span> &amp; sleepy starlight.
        </p>
      </div>
    </footer>
  )
}
