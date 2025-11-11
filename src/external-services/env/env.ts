interface Env {
	dbName: string;
	mongoUrl: string;
}

export const env = await getEnv();

async function getEnv(): Promise<Env> {
	return {
		dbName: getVar("DB_NAME", true),
		mongoUrl: getVar("MONGO_URL", true),
	};
}

function getVar<REQUIRED extends boolean>(
	key: string,
	required: REQUIRED,
): REQUIRED extends true ? string : string | undefined {
	const value = process.env[key];
	if (required && (value === undefined || value === "")) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value as REQUIRED extends true ? string : string | undefined;
}
