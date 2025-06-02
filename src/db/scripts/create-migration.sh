#!/bin/bash

# Check if name argument is provided
if [ -z "$1" ]; then
    echo "❌ Error: Migration name is required"
    echo "✅ Usage: db:create-migration <migration_name>"
    echo "✅ Example: db:create-migration add_users_table"
    exit 1
fi

# Generate timestamp in Laravel format (YYYY_MM_DD_HHMMSS)
TIMESTAMP=$(date +"%Y_%m_%d_%H%M%S")

# Combine timestamp with migration name
MIGRATION_NAME="${TIMESTAMP}_$1"

echo "🕒 Generating migration: $MIGRATION_NAME"

# Run drizzle-kit generate with the timestamped name
npx drizzle-kit generate --name="$MIGRATION_NAME"