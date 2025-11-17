import { zValidator } from "@hono/zod-validator";
import z from "zod";

export const paginationValidator = zValidator(
  'query',
  z.looseObject({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().max(100).optional(),
  }),
)
