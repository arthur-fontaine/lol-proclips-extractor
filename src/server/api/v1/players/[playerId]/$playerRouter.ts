import { Hono } from "hono";
import { listPlayerEventsHandler } from "./listPlayerEventsHandler.ts";
import { listPlayerMatchesHandler } from "./listPlayerMatchesHandler.ts";

export const $playerRouter = new Hono()
  .route("/matches", listPlayerMatchesHandler)
  .route("/events", listPlayerEventsHandler);
