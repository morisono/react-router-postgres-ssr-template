# PostgreSQL DB の基本

## 概要

Homebrew で Postgres をインストールし、サービス管理すると起動停止の自動化ができる。常に動作状況を確認し、適切な権限設定・接続方式を選ぶことが安定運用の第一歩。

```bash
brew services start postgresql         # 起動
brew services list                     # 状態確認

psql -U postgres                       # デフォルト管理ユーザーで接続
```

## 基本操作

* データベースを作成し、存在確認。
* 開発用ユーザーは専用ロールを作り、必要最小限の権限を与える。

```sql
CREATE DATABASE fsb;
SELECT datname FROM pg_database WHERE datname = 'fsb';

-- 必要ならユーザー作成
CREATE USER sana WITH PASSWORD 'your_password';

-- DB作成とオーナー付与
CREATE DATABASE app_db OWNER sana;

-- 本番運用以外では SUPERUSER を与えないこと
ALTER USER sana WITH SUPERUSER;

\du        -- ロール一覧
\dt        -- テーブル一覧（カレントDB）
\l         -- データベース一覧
\c app_db  -- app_db に接続
\q         -- psql 終了
```

### ロールと権限

* SUPERUSER は最小限にとどめ、代わりに `GRANT`／`REVOKE` で細かく権限制御。
* 本番環境ではパスワード認証（md5）か、より厳格な SCRAM-SHA-256 を推奨。

## クラスタレベル操作（DB に接続せずに実行）

`createdb`／`dropdb` や `createuser`／`dropuser` を使うとスクリプト化が容易。CI/CD パイプラインや自動化スクリプトへ組み込みやすい。

```bash
createdb -U sana -d app_db             # DB 作成
dropdb --if-exists test_db             # DB 削除（存在チェック付き）

createuser alan                        # ユーザー作成
dropuser alan                          # ユーザー削除

pg_dump app_db > backup.sql            # ダンプ出力
pg_ctl status                          # サーバ制御
initdb -D /usr/local/var/postgres      # クラスタ初期化

psql -d postgres -c '\du'              # ロール確認
```

See.
- https://formulae.brew.sh/formula/postgresql
- https://www.postgresql.org/docs/current/app-psql.html
- https://www.postgresql.org/docs/current/app-initdb.html

* TCP 接続 (`-h localhost -p 5432`) を明示すると認証方式やバージョン差異のトラブルを減らせる。

```bash
createdb -U postgres cf-ssr-test
psql -l
psql -h localhost -p 5432 -U sana -d cf-ssr-test -f init.sql
```

* `pg_hba.conf` で接続元ごとの認証方式を明示

  * `host    all    all    127.0.0.1/32    md5`
  * リモートからは SSL 接続を必須化


## ローカルテスト

ローカル開発環境で変更を検証する手順。npm パッケージ開発時の例。

```bash
# パッケージをグローバルリンク
npm link

# テスト用プロジェクトでリンク版を利用
npm create vite-shadcn-stripe test-project
```

## 公開

npm パッケージを公開する際の基本フロー。バージョン管理とリリースは必ず一貫した戦略で。

```bash
# npm にログイン
npm login

# バージョン番号更新（patch, minor, major）
npm version patch

# パッケージ公開
npm publish
```


## スキーマ設計

* **正規化 vs. 非正規化**

  * 正規化で重複削減、データ整合性向上
  * JOIN が多くなる場合は、一部非正規化で性能改善を検討
* **インデックス**

  * 適切なカーディナリティの高い列に B-tree インデックス
  * 部分インデックスや関数インデックスでフィルタ効率化
  * 定期的に `pg_stat_user_indexes` を監視し、不要なインデックスを削除 [https://www.postgresql.org/docs/current/ddl-indexes.html](https://www.postgresql.org/docs/current/ddl-indexes.html)
* **パーティショニング**

  * 大規模テーブルはレンジパーティションで I/O 分散
  * 古いパーティションはアーカイブ／削除でメンテ容易化

## 運用・チューニング

* **VACUUM / ANALYZE の自動化**

  * 自動バキューム設定を確認・調整

    ```sql
    SHOW autovacuum;  
    ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;  
    SELECT current_setting('autovacuum_vacuum_scale_factor');
    ```
* **バックアップ戦略**

  * フルバックアップ＋WAL アーカイブで PITR（Point-In-Time Recovery）実装
  * `pg_basebackup` と `archive_command` の組み合わせで自動化 [https://www.postgresql.org/docs/current/continuous-archiving.html](https://www.postgresql.org/docs/current/continuous-archiving.html)
* **モニタリング**

  * `pg_stat_activity`／`pg_stat_statements` で長時間クエリや頻出クエリを検出
  * Prometheus + Grafana 連携で可視化し、閾値アラートを設定
* **接続管理**

  * コネクションプール（PgBouncer）導入で同時接続数を制御
  * 高スループット環境ではトランザクション分離レベルを `READ COMMITTED` に設定し、ロック競合を緩和

## セキュリティ

* パスワード方式は `scram-sha-256` を推奨 [https://www.postgresql.org/docs/current/auth-password.html](https://www.postgresql.org/docs/current/auth-password.html)
* `pg_hba.conf` で接続元／ユーザーごとにアクセス制御
* 不要な拡張機能は無効化し、最小権限の原則を徹底

## CI/CD 連携例

```bash
# テスト環境に DB を立ててマイグレーション適用
docker-compose run --rm db_init psql -U postgres -f init_schema.sql

# npm パッケージのリンク
npm link
npm create vite-shadcn-stripe test-project

# リリース
npm login
npm version patch
npm publish
```

## バックアップとリストア

* フルダンプ

```bash
pg_dump -U sana app_db > app_db.sql
psql -U sana -d new_db < app_db.sql
```

* インクリメンタル／アーカイブログ

  * `archive_mode = on`
  * `archive_command = 'cp %p /path/to/archive/%f'`

## パフォーマンス最適化

* インデックス設計

  * 頻出する WHERE／JOIN 列に B-tree／GIN／BRIN を適切に選択
* 設定チューニング（`postgresql.conf`）

  * `shared_buffers`: 全メモリの25% 前後
  * `work_mem`: クエリ毎に数～十数MB
  * `max_connections`: 実使用量を想定
* Connection Pooling

  * PgBouncer や Pgpool-II で接続オーバーヘッドを抑制

## マイグレーション運用

* スキーマ変更はマイグレーションツール（Flyway／Liquibase／Knex など）で一元管理
* 「段階的変更」（新列追加→アプリで利用→旧列削除）のパターンを徹底

## モニタリングとアラート

* `pg_stat_statements` 拡張で重いクエリを可視化
* `pg_stat_activity` でロック競合や待機を監視
* Prometheus＋Grafana ／ NewRelic ／ Datadog でメトリクス収集

## 設定ファイル管理

* Git 管理下に `postgresql.conf`／`pg_hba.conf` を置き、環境毎に分岐
* Docker／Ansible／Terraform などインフラコードで再現性を担保

---

以上のプラクティスを組み合わせ、**自動化スクリプト**や\*\*インフラ構成管理（Terraform／Ansible 等）\*\*に組み込むことで、人的ミスを減らし、可観測性と再現性を担保します。