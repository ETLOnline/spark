#!/bin/bash

# Check if name argument is provided
if [ -z "$1" ]; then
    echo "❌ Error: Migration name is required"
    echo "✅ Usage: db:create-migration <migration_name>"
    echo "✅ Example: db:create-migration add_users_table"
    exit 1
fi

# Run drizzle-kit generate with the provided name
npx drizzle-kit generate --name="$1"