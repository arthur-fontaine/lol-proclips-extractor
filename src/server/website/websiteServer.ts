import path from "node:path";
import tailwindcssPlugin from "@tailwindcss/vite";
import vuePlugin from "@vitejs/plugin-vue";
import { createServer } from "vite";

export const viteServer = await createServer({
  plugins: [
    vuePlugin(),
    tailwindcssPlugin(),
  ],
  root: path.resolve(import.meta.dirname, "./core"),
})

await viteServer.listen()
  .then(server => console.log(server.httpServer?.address()));
