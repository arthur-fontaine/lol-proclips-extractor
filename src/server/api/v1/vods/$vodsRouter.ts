import { Hono } from "hono";
import { getVodHandler } from "./[vodId]/getVodHandler.ts";

export const $vodsRouter = new Hono()
  .route("/:vodId", getVodHandler);
