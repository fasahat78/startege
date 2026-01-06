import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* App tokens (shadcn-compatible) */
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "rgb(var(--secondary-foreground) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
        "destructive-foreground": "rgb(var(--destructive-foreground) / <alpha-value>)",

        /* Explicit brand namespace (easy to use directly) */
        brand: {
          midnight: "rgb(var(--brand-midnight) / <alpha-value>)",
          slate: "rgb(var(--brand-slate) / <alpha-value>)",
          teal: "rgb(var(--brand-teal) / <alpha-value>)",
        },
        status: {
          success: "rgb(var(--status-success) / <alpha-value>)",
          warning: "rgb(var(--status-warning) / <alpha-value>)",
          error: "rgb(var(--status-error) / <alpha-value>)",
          disabled: "rgb(var(--status-disabled) / <alpha-value>)",
        },
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      fontSize: {
        /* Matches brand scale */
        title: ["1.75rem", { lineHeight: "2.25rem", fontWeight: "600" }],  // 28px
        section: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }], // 20px
        body: ["1rem", { lineHeight: "1.5rem" }],                            // 16px
        label: ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "500" }], // 13px
        meta: ["0.75rem", { lineHeight: "1rem" }],                           // 12px
      },

      borderRadius: {
        lg: "var(--radius)",     // 16px
        xl: "calc(var(--radius) + 0.25rem)", // 20px
        "2xl": "calc(var(--radius) + 0.5rem)", // 24px
      },

      boxShadow: {
        card: "0 8px 24px rgb(15 23 42 / 0.08)",
        float: "0 12px 40px rgb(15 23 42 / 0.12)",
      },
    },
  },
  plugins: [typography],
};

export default config;

