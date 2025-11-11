import { schema, types } from "papr";

export const playerSchema = schema({
	summonerName: types.string({ required: true }),
	externalIds: types.object(
		{
			leagueOfLegends: types.string({ required: true }),
		},
		{ required: true },
	),
});

export type Player = (typeof playerSchema)[0];
