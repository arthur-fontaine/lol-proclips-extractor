import { schema, types } from "papr";

export const matchSchema = schema({
	games: types.array(
		types.object({
			teams: types.array(
				types.object({
					playerIds: types.array(types.objectId(), { required: true }),
					externalIds: types.object(
						{ leagueOfLegends: types.string({ required: true }) },
						{ required: true },
					),
				}),
				{ required: true },
			),
			events: types.array(
				types.object({
					relativeTimestampSeconds: types.number({ required: true }),
					type: types.enum(["kill", "death", "assist"], { required: true }),
					playerId: types.objectId({ required: true }),
				}),
				{ required: true },
			),
			vods: types.array(types.objectId(), { required: true }),
			externalIds: types.object(
				{ leagueOfLegends: types.string({ required: true }) },
				{ required: true },
			),
		}),
		{ required: true },
	),
	externalIds: types.object(
		{ leagueOfLegends: types.string({ required: true }) },
		{ required: true },
	),
});

export type Match = (typeof matchSchema)[0];
