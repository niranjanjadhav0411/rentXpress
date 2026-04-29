import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--surface-1)] to-[var(--surface)]" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--gold)]/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[420px]">
        <div className="glass rounded-3xl p-8 sm:p-10 animate-fade-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] flex items-center justify-center mx-auto mb-5 shadow-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0a0a0f"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Create Account
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Start your premium experience
            </p>
          </div>

          {error && (
            <div
              className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              role="alert"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-premium"
                required
                aria-label="Name"
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium"
                required
                aria-label="Email"
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-12"
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                >
                  {showPassword ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= n ? strengthColors[passwordStrength] : "bg-[var(--surface-3)]"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--gold)] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
