#!/bin/bash

read -p "Enter migration name: " migration_name

if [ -z "$migration_name" ]; then
    echo "❌ Migration name cannot be empty"
    exit 1
fi

# Replace spaces with underscores
migration_name=$(echo "$migration_name" | tr ' ' '_')

TIMESTAMP=$(date +"%Y_%m_%d_%H%M%S")
MIGRATION_NAME="${TIMESTAMP}__$migration_name"

echo "🔄 Generating migration: $MIGRATION_NAME"
npx drizzle-kit generate --name="$MIGRATION_NAME"

# Find the latest snapshot file
latest_snapshot=$(ls src/db/migrations/meta/*_snapshot.json 2>/dev/null | sort -V | tail -n 1)

if [ -n "$latest_snapshot" ]; then
    new_name="src/db/migrations/meta/${MIGRATION_NAME}.json"
   
    if mv "$latest_snapshot" "$new_name"; then
        echo "✅ Migration generated successfully"
        echo "📁 SQL: $(ls src/db/migrations/*${MIGRATION_NAME}*.sql 2>/dev/null | tail -n 1)"
        echo "📄 Snapshot: $new_name"
    else
        echo "❌ Failed to rename snapshot file"
        exit 1
    fi
else
    echo "⚠️ No snapshot file found to rename"
fi