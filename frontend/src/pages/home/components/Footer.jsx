export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand + newsletter */}
        <div className="footer-brand-col">
          <span className="footer-brand">MODÉ</span>
          <p className="footer-tagline">Curated fashion for every occasion.</p>
          <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email for newsletter"
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        {/* Links */}
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li>Women's Clothing</li>
              <li>Men's Clothing</li>
              <li>Outerwear</li>
              <li>Footwear</li>
              <li>Accessories</li>
              <li>Sale</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li>Contact Us</li>
              <li>Track My Order</li>
              <li>Returns & Exchanges</li>
              <li>Shipping Info</li>
              <li>Size Guide</li>
              <li>FAQ</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Sustainability</li>
              <li>Affiliate Program</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-legal">
            © {new Date().getFullYear()} MODÉ. All rights reserved. &nbsp;·&nbsp;
            <span>Privacy Policy</span>
            &nbsp;·&nbsp;
            <span>Terms of Service</span>
            &nbsp;·&nbsp;
            <span>Cookie Settings</span>
          </p>
          <div className="footer-social">
            {/* Instagram */}
            <a href="#" aria-label="Instagram">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            {/* TikTok */}
            <a href="#" aria-label="TikTok">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            {/* Pinterest */}
            <a href="#" aria-label="Pinterest">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.38 1.27-5.38s-.32-.65-.32-1.61c0-1.51.88-2.64 1.97-2.64.93 0 1.38.7 1.38 1.54 0 .94-.6 2.34-.91 3.64-.26 1.09.54 1.97 1.6 1.97 1.92 0 3.21-2.47 3.21-5.39 0-2.23-1.51-3.79-3.67-3.79-2.5 0-3.97 1.88-3.97 3.82 0 .76.29 1.57.66 2.01.07.09.08.17.06.26l-.25 1c-.04.16-.13.19-.3.12-1.11-.52-1.81-2.14-1.81-3.44 0-2.8 2.03-5.37 5.86-5.37 3.08 0 5.47 2.19 5.47 5.12 0 3.05-1.92 5.51-4.59 5.51-.9 0-1.74-.47-2.03-1.02l-.55 2.07c-.2.77-.74 1.73-1.1 2.32.83.26 1.7.4 2.61.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" aria-label="Facebook">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
