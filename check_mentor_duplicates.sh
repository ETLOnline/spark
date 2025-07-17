#!/bin/bash

# Script to run mentor seed and check for duplicates
echo "🔄 Running mentor seed..."

# Run the seed
npx drizzle-kit seed:mentor

echo "✅ Mentor seed completed!"
echo "📊 Checking for potential duplicate issues..."

# You can add database queries here to check for duplicates
# For now, just a placeholder message
echo "💡 To check for duplicates in the database, run:"
echo "   SELECT user_id, tag_id, COUNT(*) as count FROM user_tags GROUP BY user_id, tag_id HAVING COUNT(*) > 1;"

echo "✅ All done! Check the console for any seed issues."
