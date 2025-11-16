import { Hono } from "hono";
import { $playersRouter } from "./players/$playersRouter.ts";
import { $vodsRouter } from "./vods/$vodsRouter.ts";

export const v1 = new Hono()
  .route("/players", $playersRouter)
  .route("/vods", $vodsRouter);
