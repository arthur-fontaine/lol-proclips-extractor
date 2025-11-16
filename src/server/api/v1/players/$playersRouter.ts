import { Hono } from "hono";
import { $playerRouter } from "./[playerId]/$playerRouter.ts";
import { listPlayersHandler } from "./listPlayersHandler.ts";

export const $playersRouter = new Hono()
  .route("/", listPlayersHandler)
  .route("/:playerId", $playerRouter);
