import { schema, types } from "papr";

export const matchSchema = schema({
	games: types.array(
		types.object({
			externalIds: types.object(
				{
					leagueOfLegends: types.string({ required: true }),
				},
				{ required: true },
			),
			players: types.array(
				types.object({
					playerId: types.objectId({ required: true }),
				}),
				{ required: true },
			),
			events: types.array(
				types.object({
					relativeTimestamp: types.number({ required: true }),
					type: types.enum(["kill", "death", "assist"], { required: true }),
					playerId: types.objectId({ required: true }),
				}),
			),
		}),
		{ required: true },
	),
	externalIds: types.object(
		{
			leagueOfLegends: types.string({ required: true }),
		},
		{ required: true },
	),
});

export type Match = (typeof matchSchema)[0];
