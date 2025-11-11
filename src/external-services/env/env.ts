interface Env {
	dbFileName: string;
}

export const env = getEnv();

function getEnv(): Env {
	return {
		dbFileName: getVar(
			"DB_FILE_NAME",
			true,
		),
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