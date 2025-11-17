import { serve } from "@hono/node-server";
import { app } from "./app.ts";
import { env } from "../../external-services/env/env.ts";

const server = serve({
	fetch: app.fetch,
	port: Number(env.apiPort) ?? 3000,
});

server.once("listening", () => {
	console.log("📡 Server is running...");
	console.log(server.address());
});
