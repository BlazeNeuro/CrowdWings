import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { memoryAdapter } from "better-auth/adapters/memory";
import { db, schema } from "../db";

export const auth = betterAuth({
  database: db ? drizzleAdapter(db, { provider: "pg", schema }) : memoryAdapter({}),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      walletAddress: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "crowdwings-super-secret-key-32-chars-long",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
