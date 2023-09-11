import * as dotenv from "dotenv";

dotenv.config();

export const MONGO_URI: any = process.env.MONGO_URI;
export const PORT: string | undefined = process.env.PORT;
export const NODE_ENV: string | undefined = process.env.NODE_ENV;
export const JWT_SECRET: any = process.env.JWT_SECRET;
