import { Link } from "react-router-dom";

const navLinks = [
  ["Home", "/"],
  ["Fleet", "/cars"],
  ["My Bookings", "/my-bookings"],
  ["Login", "/login"],
  ["Register", "/register"],
];

const contactInfo = [
  { icon: "✉", text: "support@rentxpress.in" },
  { icon: "📞", text: "+91 98765 43210" },
  { icon: "📍", text: "Pimpri, Pune, Maharashtra" },
];

const socials = [
  { label: "Twitter/X", href: "#", path: "M4 4l16 16M20 4L4 20" },
  {
    label: "Instagram", href: "https://instagram.com/niranjan_0411", filled: true,
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "LinkedIn", href: "https://linkedin.com/in/niranjanjadhav0411/",
    path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z",
    extra: "M2 4a2 2 0 104 0 2 2 0 00-4 0",
  },
  {
    label: "GitHub",
    href: "https://github.com/niranjanjadhav0411",
    path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
    filled: true,
  },
];

export default function Footer() {
  return (
    <footer className="w-full mt-auto" style={{ background: "var(--surface-1)", borderTop: "1px solid var(--border)" }}>
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-16">
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dim))" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v2M9 17h8m-4-4l4 4-4 4M3 9h14"
                    stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)" }}>
                Rent<span style={{ color: "var(--gold)" }}>Xpress</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)", maxWidth: 240 }}>
              Premium car rentals with transparent pricing and zero hassle. Drive more, stress less.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ label, href, path, extra, filled }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-muted)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.background = "rgba(201,168,76,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--surface-2)"; }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round">
                    <path d={path} />
                    {extra && <path d={extra} />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase mb-5"
              style={{ color: "var(--text-muted)", fontFamily: "Syne, sans-serif" }}>
              Navigation
            </p>
            <ul className="space-y-3">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link to={href}
                    className="text-sm flex items-center gap-2 group transition-colors duration-200"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                    <span className="w-0 group-hover:w-3 h-px transition-all duration-200 rounded"
                      style={{ background: "var(--gold)" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase mb-5"
              style={{ color: "var(--text-muted)", fontFamily: "Syne, sans-serif" }}>
              Contact
            </p>
            <ul className="space-y-4">
              {contactInfo.map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="text-base mt-0.5 shrink-0">{icon}</span>
                  <span className="text-sm leading-snug" style={{ color: "var(--text-secondary)" }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase mb-5"
              style={{ color: "var(--text-muted)", fontFamily: "Syne, sans-serif" }}>
              Stay Updated
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Get exclusive deals and new car alerts straight to your inbox.
            </p>
            <div className="flex flex-col gap-2">
              <input type="email" placeholder="you@email.com" className="input-premium text-sm w-full" />
              <button className="btn-gold py-2.5 text-sm w-full">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="w-full" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-5 max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} RentXpress. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>All systems operational</span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <a href="#" className="hover:text-[var(--gold)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--gold)] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
