import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, ArrowRight, Check, Loader2 } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import logo from "../../assets/lg-trans.png";

type SubscribeStatus = "idle" | "loading" | "success" | "error";

const socialLinks = [
  {
    name: "X (Twitter)",
    href: "https://twitter.com/khenx",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.9 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.65h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/khenx",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/khenx",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.114 20.452H3.556V9h3.558v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/khenx",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.462h-1.26c-1.243 0-1.63.774-1.63 1.567v1.88h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
      </svg>
    ),
  },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    try {
      // TODO: replace with your real subscribe endpoint
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-[#0A1628] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">

          {/* Brand */}
          <div className="col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center gap-1 -ml-2">
              <img src={logo} alt="KhenX" className="h-24 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Before you pay, know the area. Nigeria's first AI-powered property and neighbourhood intelligence platform.
            </p>

            {/* Newsletter */}
            <form
              className="mt-6 max-w-xs"
              onSubmit={handleSubscribe}
              aria-label="Subscribe to newsletter"
            >
              <label htmlFor="footer-email" className="text-xs font-semibold text-white uppercase tracking-wider">
                Get area alerts
              </label>

              {status === "success" ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#00C9A7]/10 border border-[#00C9A7]/30 px-3 py-2.5 text-sm text-[#00C9A7]">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>You're on the list — check your inbox.</span>
                </div>
              ) : (
                <>
                  <div
                    className={`mt-2 flex items-center rounded-lg bg-white/5 border transition-colors ${
                      status === "error"
                        ? "border-red-400/60 focus-within:border-red-400"
                        : "border-white/10 focus-within:border-[#00C9A7]"
                    }`}
                  >
                    <Mail className="h-4 w-4 text-slate-500 ml-3 shrink-0" />
                    <input
                      id="footer-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="you@email.com"
                      disabled={status === "loading"}
                      aria-invalid={status === "error"}
                      className="w-full bg-transparent px-2 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      aria-label="Subscribe"
                      className="flex items-center justify-center h-9 w-9 shrink-0 mr-1 rounded-md bg-[#00C9A7] text-[#0A1628] hover:bg-[#00e0bb] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="mt-1.5 text-xs text-red-400">
                      Something went wrong. Try again.
                    </p>
                  )}
                </>
              )}
            </form>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-white/5 text-slate-400 hover:bg-[#00C9A7] hover:text-[#0A1628] transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={ROUTES.LISTINGS} className="hover:text-[#00C9A7] transition-colors">
                  Browse listings
                </Link>
              </li>
              <li>
                <Link to={ROUTES.NEIGHBOURHOOD} className="hover:text-[#00C9A7] transition-colors">
                  Neighbourhood intelligence
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRICING ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FAQ ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Agents */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Agents
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={ROUTES.SIGNUP} className="hover:text-[#00C9A7] transition-colors">
                  List a property
                </Link>
              </li>
              <li>
                <Link to={ROUTES.AGENT_KYC} className="hover:text-[#00C9A7] transition-colors">
                  Get verified
                </Link>
              </li>
              <li>
                <Link to={ROUTES.AGENT_DASHBOARD} className="hover:text-[#00C9A7] transition-colors">
                  Agent dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={ROUTES.ABOUT ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to={ROUTES.BLOG ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CAREERS ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-[#00C9A7] shrink-0 mt-0.5" />
                <a
                  href="mailto:hello@khen-x.com"
                  className="hover:text-[#00C9A7] transition-colors break-all"
                >
                  hello@khen-x.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#00C9A7] shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            &copy; {year} KhenX. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <li>
              <Link to={ROUTES.PRIVACY ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to={ROUTES.TERMS ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to={ROUTES.COOKIES ?? "#"} className="hover:text-[#00C9A7] transition-colors">
                Cookie Policy
              </Link>
            </li>
          </ul>
          <p className="text-xs text-slate-600 hidden sm:block">
            Built for Lagos. Powered by AI.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;