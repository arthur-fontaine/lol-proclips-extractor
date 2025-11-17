import path from "node:path";
import tailwindcssPlugin from "@tailwindcss/vite";
import vuePlugin from "@vitejs/plugin-vue";
import { createServer } from "vite";
import { env } from "../../external-services/env/env.ts";

export const viteServer = await createServer({
  plugins: [
    vuePlugin(),
    tailwindcssPlugin(),
  ],
  root: path.resolve(import.meta.dirname, "./core"),
  server: {
    host: true,
    allowedHosts: ["lol-esports-clips.arthurfontaine.fr"],
  },
})

await viteServer.listen(Number(env.websitePort) ?? 5173)
  .then(server => console.log(server.httpServer?.address()));
