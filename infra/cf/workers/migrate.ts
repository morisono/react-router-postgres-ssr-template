/// <reference types="../../../worker-configuration.d.ts" />
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../../../db/orm/schema";

type HyperdriveBinding = Hyperdrive;

export default {
  async fetch(_req: Request, env: Env): Promise<Response> {
    try {
      // Get the database URL from Hyperdrive or environment
      // Cast env.HYPERDRIVE as Hyperdrive type since it's duplicated in the type definition
      const hyperdrive = env.HYPERDRIVE as unknown as HyperdriveBinding;
      const databaseUrl = hyperdrive?.connectionString || env.DATABASE_URL;

      if (!databaseUrl) {
        return new Response("Database URL not configured", { status: 500 });
      }

      // Create postgres client
      const client = postgres(databaseUrl);
      const db = drizzle(client, { schema });

      // Run migrations - using relative path from the worker location
      await migrate(db, { migrationsFolder: "../../../db/orm/migrations" });

      // Close the connection
      await client.end();

      return new Response("Migration applied successfully", { status: 200 });
    } catch (e: any) {
      console.error("Migration failed:", e);
      return new Response("Migration failed: " + e.message, { status: 500 });
    }
  },
};
