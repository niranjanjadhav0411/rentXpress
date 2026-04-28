import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-1)] mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v2M9 17h8m-4-4l4 4-4 4M3 9h14"
                    stroke="#0a0a0f"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "17px",
                }}
                className="text-[var(--text-primary)]"
              >
                Rent<span className="text-gold">Xpress</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[220px]">
              Premium car rentals with transparent pricing and zero hassle.
            </p>
          </div>

          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-4"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Navigation
            </p>
            <ul className="space-y-2">
              {[
                ["Home", "/"],
                ["Fleet", "/cars"],
                ["My Bookings", "/my-bookings"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-4"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Contact
            </p>
            <ul className="space-y-2">
              <li className="text-sm text-[var(--text-secondary)]">
                support@rentxpress.in
              </li>
              <li className="text-sm text-[var(--text-secondary)]">
                +91 98765 43210
              </li>
              <li className="text-sm text-[var(--text-secondary)]">
                Pimpri, Maharashtra
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} RentXpress. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
            <span className="text-xs text-[var(--text-muted)]">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
