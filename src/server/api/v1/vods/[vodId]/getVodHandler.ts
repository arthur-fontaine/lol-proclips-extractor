import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { database } from '../../../../../external-services/database/database.ts';

export const getVodHandler = new Hono().get(
  "/",
  zValidator(
    'param',
    z.object({
      vodId: z.string() ,
    }),
  ),
  async (c) => {
    const params = c.req.valid('param');
    const vodId = params.vodId;

    const vod = await database.models.Vod.findById(vodId);
    
    return c.json({
      vod,
    });
  }
);
