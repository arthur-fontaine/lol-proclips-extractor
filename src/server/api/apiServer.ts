import { serve } from "@hono/node-server";
import { app } from "./app.ts";

const server = serve({
	fetch: app.fetch,
	port: 3000,
});

server.once("listening", () => {
	console.log("📡 Server is running...");
	console.log(server.address());
});
