/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./free/app/**/*.{ts,tsx}",
    "../free/app/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FAF8F2",
          soft: "#F3EFE5",
          card: "#FFFFFF",
        },
        line: {
          DEFAULT: "#E3DCCB",
          soft: "#EDE7D8",
        },
        ink: {
          DEFAULT: "#1C1814",
          soft: "#57503F",
          dim: "#6E6459",
          faint: "#8A8073",
        },
        brick: {
          DEFAULT: "#B23A24",
          deep: "#8E2C1B",
          tint: "#F7E9E2",
        },
        moss: {
          DEFAULT: "#2E7D4F",
          tint: "#E6F1EA",
        },
        ochre: {
          DEFAULT: "#8A6100",
          tint: "#F7EFD8",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "'Times New Roman'", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "5px",
      },
    },
  },
  plugins: [],
};
