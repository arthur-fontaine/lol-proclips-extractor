import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { database } from '../../../../../external-services/database/database.ts';
import { paginationValidator } from '../../utils/paginationValidator.ts';

export const listPlayerEventsHandler = new Hono().get(
  "/",
  zValidator(
    'query',
    z.object({
      type: z.enum(['kill', 'death', 'assist']).optional(),
    }),
  ),
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

    const { limit = 20, page = 1, ...query } = c.req.valid('query');
    const eventType = query.type;

    const events = await database.models.Match.aggregate<{
      _matchId: ObjectId;
      type: string;
      vod: {
        _id: ObjectId;
        timestamp: number;
      };
    }>([
      { $unwind: "$games" },
      { $unwind: "$games.events" },
      {
        $match: {
          "games.events.type": eventType,
          "games.events.playerId": new ObjectId(playerId),
        },
      },
      {
        $project: {
          _id: 0,
          _matchId: "$_id",
          event: "$games.events",
          vod: {
            _id: { $arrayElemAt: ["$games.vods", 0] },
            timestamp: "$games.events.relativeTimestampSeconds",
          }
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            _matchId: "$_matchId",
            type: "$event.type",
            vod: "$vod",
          }
        }
      },
    ]);

    const paginatedEvents = events.slice((page - 1) * limit, page * limit);

    return c.json({
      events: paginatedEvents,
      pagination: {
        page,
        limit,
        total: events.length,
      },
    });
  }
);
