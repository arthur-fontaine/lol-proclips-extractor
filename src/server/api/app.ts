import { Hono } from "hono";
import { logger } from "hono/logger";
import { v1 } from "./v1/v1.ts";

export const app = new Hono()
	.use(logger())
	.get("/ping", (c) => c.text("pong"))
	.route("/v1", v1);
