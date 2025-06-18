import { defineConfig } from "astro/config";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://bhgrecloud.com",

  server: {
    hmr: true
  },

  adapter: vercel()
});