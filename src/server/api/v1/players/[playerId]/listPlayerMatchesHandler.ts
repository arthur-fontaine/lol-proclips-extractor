import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { database } from '../../../../../external-services/database/database.ts';
import type { Match } from '../../../../../external-services/database/schemas/matchSchema.ts';
import { paginationValidator } from '../../utils/paginationValidator.ts';

export const listPlayerMatchesHandler = new Hono().get(
  "/",
  paginationValidator,
  zValidator(
    'param',
    z.object({
      playerId: z.string(),
    }),
  ),
  async (c) => {
    const params = c.req.valid('param');
    const playerId = params.playerId;
    
    const { limit = 20, page = 1 } = c.req.valid('query');

    const matches = await database.models.Match.aggregate<Match['games'][number]>([
      {
        $match: {
          "games.teams.playerIds": new ObjectId(playerId),
        },
      },
      {
        $project: {
          "games.events": 0
        }
      }
    ]);

    const paginatedMatches = matches.slice((page - 1) * limit, page * limit);

    return c.json({
      matches: paginatedMatches,
      pagination: {
        page,
        limit,
        total: matches.length,
      },
    });
  }
);
