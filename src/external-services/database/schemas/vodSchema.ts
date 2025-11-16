import { schema, types } from "papr";

export const vodSchema = schema({
	youtubeId: types.string({ required: false }),
	calibrationPoints: types.array(
		types.object({
			gameTimestampSeconds: types.number({ required: true }),
			videoTimestampSeconds: types.number({ required: true }),
		}),
		{ required: true },
	),
});

export type Vod = (typeof vodSchema)[0];
