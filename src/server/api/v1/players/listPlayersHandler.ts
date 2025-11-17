import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { database } from "../../../../external-services/database/database.ts";
import { paginationValidator } from '../utils/paginationValidator.ts';

export const listPlayersHandler = new Hono().get(
  "/",
  zValidator(
    'query',
    z.object({
      summonerName: z.string().optional(),
    }),
  ),
  paginationValidator,
  async (c) => {
    const { limit = 20, page = 1, ...query } = c.req.valid('query');

    const players = await database.models.Player.find({
      summonerName: query.summonerName
        ? { $regex: new RegExp(`^${query.summonerName}$`, 'i') }
        : { $exists: true },
    });
    const paginatedPlayers = players.slice((page - 1) * limit, page * limit);

    return c.json({
      players: paginatedPlayers,
      pagination: {
        page,
        limit,
        total: players.length,
      },
    });
  }
);
