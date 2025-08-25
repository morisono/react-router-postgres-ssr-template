# Cloudflare サーバレス セットアップ

## 1. プロジェクト初期化・確認

```sh
git init
gh repo create --private --remote=origin --source=. react-router-postgres-ssr-template
npm create cloudflare@latest -- --template=cloudflare/templates/react-router-postgres-ssr-template

npx wrangler login

npx wrangler kv namespace list
npx wrangler d1 list

# set up kv/d1/r2 from cli/web if not yet
```

* Cloudflare Workers + React Router SSR のテンプレートを TypeScript で作成
* GitHub リポジトリは一旦 private、後で public に変更可能
* "Edit Cloudflare Workers" でCF_ACCOUNT_IDを発行,記入 ( Accounts:D1:Edit 権限が必要 )

## 2. 環境設定

```sh
cp .dev.vars.example .dev.vars
cp .env.example .env  # 必要に応じて編集

source .env                                   # Use set -x XXX for fish

npx wrangler secret put DB_URL
npx wrangler secret put CF_API_TOKEN
npx wrangler secret list

# Wrangler already loads .dev.vars automatically if present, so you don’t need to source it manually
```

`wrangler.toml` 最小例：

```toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2025-08-22"
```

TypeScript 型を生成：

```sh
npx wrangler types
npm run dev       # ローカル開発サーバ起動
npm test          # ユニットテスト
```


## 3. KV の設定（セッション・キャッシュ用）

```sh
npx wrangler kv:namespace create s10111-kv-1
```

`wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "s10111-kv-1"
id = "xxxx..."
```

使用例：

```ts
app.post('/login', async (c) => {
  const { email } = await c.req.json()
  const token = crypto.randomUUID()
  await c.env.CF_KV_NAMESPACE.put(`session:${token}`, email, { expirationTtl: 3600 })
  return c.json({ token })
})
```

### SQLite / Drizzle

新規登録:
```
npx wrangler d1 create s10111-d1-1
```

Table 作成:
```
npx wrangler d1 execute s12001-d1-1 --command "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);"
```

**Drizzle連携:**

```
npm install drizzle-orm drizzle-kit better-sqlite3
```
- drizzle.config.ts
  ```
  import type { Config } from "drizzle-kit";

  export default {
    schema: "./src/db/schema.ts",
    out: "./migrations",
    driver: "better-sqlite",
  } satisfies Config;
  ```

- schema.ts
  ```
  import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

  export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name"),
  });
  ```

**Ref.:** Local DB needs Docker
- https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/

**マイグレーション(手動)**:

- Migration:
  ```
  npx drizzle-kit generate --config=./db/orm/drizzle.config.ts
  npx drizzle-kit migrate --config=./db/orm/drizzle.config.ts
  ```

- Apply:
  ```
  npx wrangler d1 migrations apply s12001-d1-1  # --local for `wrangler dev`
  ```

client.ts: 実際には、CRUDを構築する
```
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}
```
- Env は wrangler.jsonc で D1 をバインドしたもの

CI/CD:
- `.github/workflows/deploy-cf-d1-drizzle.yaml`: Drizzle:移行 -> Wrangler:D1へ適用


## 4. D1 / HyperDrive (Postgres)

```sh
npx wrangler hyperdrive create $DB_NAME --connection-string="$DB_URL"
# or npx wrangler d1 create  $DB_NAME --connection-string="$DB_URL"

npx wrangler hyperdrive list
# npx wrangler d1 list
```

`wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
DB_name = "mydb"
DB_id = "xxxx"
```

### Neon Postgres

* Neonアカウント作成 → Postgresインスタンス作成
* HyperDrive経由接続：

```sh
npx wrangler hyperdrive create my-hyperdrive-config --connection-string="$DB_URL"
```

`wrangler.jsonc`:

```jsonc
"hyperdrive": [
  {
    "binding": "HYPERDRIVE",
    "id": "YOUR_HYPERDRIVE_ID",
    "localConnectionString": "postgresql://myuser:mypassword@localhost:5432/mydatabase"
  }
]
```

例：`users` テーブル

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```


## 5. R2（オプションのオブジェクトストレージ）

```toml
[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"
```

* ファイルアップロードや大容量データ保存に使用可能
* 例：`await env.MY_BUCKET.put('file.txt', data)`


## 6. Hono API + CRUD 例

`src/index.ts`:

```ts
import { Hono } from 'hono'
import { Pool } from '@neondatabase/serverless'
import { z } from 'zod'

export default {
  async fetch(req: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const app = new Hono()
    const pool = new Pool({ connectionString: env.HYPERDRIVE_DB })

    // Create
    app.post('/users', async (c) => {
      const data = z.object({ name: z.string(), email: z.string().email() }).parse(await c.req.json())
      const { rows } = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [data.name, data.email])
      return c.json(rows[0], 201)
    })

    // Read
    app.get('/users/:id', async (c) => {
      const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [c.req.param('id')])
      return rows.length ? c.json(rows[0]) : c.json({ error: 'Not found' }, 404)
    })

    // Update
    app.put('/users/:id', async (c) => {
      const body = await c.req.json()
      const { rows } = await pool.query('UPDATE users SET name=$1 WHERE id=$2 RETURNING *', [body.name, c.req.param('id')])
      return rows.length ? c.json(rows[0]) : c.json({ error: 'Not found' }, 404)
    })

    // Delete
    app.delete('/users/:id', async (c) => {
      await pool.query('DELETE FROM users WHERE id=$1', [c.req.param('id')])
      return c.json({ success: true })
    })

    return app.fetch(req, env, ctx)
  },
}
```


## 7. デプロイ

```sh
npm run deploy
```


## 8. GitHub Actions CI/CD

* Secretの設定：

```sh
gh secret set CF_ACCOUNT_ID
gh secret set CF_API_TOKEN
gh secret set MY_VARIABLE
```

- Cloudflare Pages/Workers に 組み込みデプロイする場合は、GitHub Actions などの外部 CI を挟まず、Cloudflare の Deploy Hook


## 参考

* 参照：[Cloudflare Workers + GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
* https://developers.cloudflare.com/workers/wrangler/commands/#deploy