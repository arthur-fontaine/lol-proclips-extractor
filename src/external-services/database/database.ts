import { MongoClient } from "mongodb";
import Papr from "papr";
import { env } from "../env/env.ts";
import { matchSchema } from "./schemas/matchSchema.ts";
import { playerSchema } from "./schemas/playerSchema.ts";
import { vodCalibrationSchema } from "./schemas/vodCalibrationSchema.ts";

export class Database implements AsyncDisposable {
	private dbName: string;
	private mongoClient: MongoClient;
	private mongoDb: ReturnType<MongoClient["db"]>;
	private papr: Papr;

	public models: ReturnType<Database["loadModels"]>;

	constructor(params: { url: string; dbName: string }) {
		this.dbName = params.dbName;
		this.mongoClient = new MongoClient(params.url);
		this.mongoDb = this.mongoClient.db(this.dbName);
		this.papr = new Papr();

		this.models = this.loadModels();
	}

	private loadModels() {
		const Match = this.papr.model("matches", matchSchema);
		const Player = this.papr.model("players", playerSchema);
		const VodCalibration = this.papr.model("vodCalibrations", vodCalibrationSchema);

		return {
			Match,
			Player,
			VodCalibration,
		};
	}

	get databaseInstance() {
		return this.mongoDb;
	}

	async connect() {
		await this.mongoClient.connect();
		this.papr.initialize(this.mongoDb);
		await this.papr.updateSchemas();

		return this;
	}

	async disconnect() {
		await this.mongoClient.close();
	}

	async [Symbol.asyncDispose]() {
		await this.disconnect();
	}
}

export const database = await new Database({
	dbName: env.dbName,
	url: env.mongoUrl,
}).connect();
