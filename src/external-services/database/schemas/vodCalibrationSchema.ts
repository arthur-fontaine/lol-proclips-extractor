import { schema, types } from "papr";

export const vodCalibrationSchema = schema({
	matchId: types.objectId({ required: true }),
	gameNumber: types.number({ required: true }),
	vod: types.oneOf([types.object({
    youTubeId: types.string({ required: true }),
  })], { required: true }),
	calibrationPoints: types.array(
		types.object({
			gameSeconds: types.number({ required: true }),
			videoTimestampSeconds: types.number({ required: true }),
		}),
		{ required: true },
	),
});

export type VodCalibration = (typeof vodCalibrationSchema)[0];
