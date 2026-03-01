import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* ── Env Neo brand tokens (Rembrandt) ── */
        "en-void":      "var(--en-void)",
        "en-depth":     "var(--en-depth)",
        "en-surface":   "var(--en-surface)",
        "en-arc":       "var(--en-arc)",
        "en-arc-dim":   "var(--en-arc-dim)",
        "en-authority": "var(--en-authority)",
        "en-muted":     "var(--en-muted)",
        /* ── Govevia tokens (David) ── */
        "gv-civic":     "var(--gv-civic)",
        "gv-signal":    "var(--gv-signal)",
        "gv-alert":     "var(--gv-alert)",
        "gv-stone":     "var(--gv-stone)",
        "gv-trust":     "var(--gv-trust)",
        /* ── Env Live / ao vivo (Van Gogh) ── */
        "el-signal":    "var(--el-signal)",
        "el-pulse":     "var(--el-pulse)",
        "el-now":       "var(--el-now)",
        /* ── Leo Américo (Caravaggio) ── */
        "la-flesh":     "var(--la-flesh)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
