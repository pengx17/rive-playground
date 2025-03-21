import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

/** @type {import('tailwindcss').Config} */
export default {
  plugins: [react(), tailwindcss()],
  theme: {
    extend: {},
  },
};
