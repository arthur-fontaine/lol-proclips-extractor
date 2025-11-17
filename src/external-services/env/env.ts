interface Env {
	dbName: string;
	mongoUrl: string;
	geminiApiKey: string;
	apiPort?: string | undefined;
	websitePort?: string | undefined;
}

export const env = await getEnv();

async function getEnv(): Promise<Env> {
	return {
		dbName: getVar("DB_NAME", true),
		mongoUrl: getVar("MONGO_URL", true),
		geminiApiKey: getVar("GEMINI_API_KEY", true),
		apiPort: getVar("API_PORT", false) ?? getVar("LOL_ESPORTS_CLIPS_API_PORT", false),
		websitePort: getVar("WEBSITE_PORT", false) ?? getVar("LOL_ESPORTS_CLIPS_WEBSITE_PORT", false),
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
