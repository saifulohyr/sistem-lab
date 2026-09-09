import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  await client.connect();
  console.log("Connected to PostgreSQL direct connection");

  // Check existing policies
  const res = await client.query(
    "SELECT policyname, permissive, roles, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';"
  );
  console.log("Existing storage.objects policies:", res.rows);

  // Drop old if exists and create policy for bucket 'lab'
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public lab bucket access'
      ) THEN
        CREATE POLICY "Public lab bucket access"
        ON storage.objects
        FOR ALL
        TO public
        USING (bucket_id = 'lab')
        WITH CHECK (bucket_id = 'lab');
      END IF;
    END $$;
  `);

  console.log("Storage policy ensured for bucket 'lab'");
  await client.end();
}

main().catch(console.error);
