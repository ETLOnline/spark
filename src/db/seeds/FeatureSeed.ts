
// Feature seed

import { sql } from "drizzle-orm";
import { db } from "..";
import { featuresTable, InsertFeature } from "../schema";

export const FeatureSeedList : InsertFeature[] = [
  {
    feature_name: "Chat",
    feature_slug: "chat",
    feature_type: "space",
    feature_description: "Chat with other users",
    feature_icon: 'chat',
    feature_status: 1,
    feature_url: '/chat'
  },
  {
    feature_name: "Posts",
    feature_slug: "posts",
    feature_type: "space",
    feature_description: "Create and share posts",
    feature_icon: 'posts',
    feature_status: 1,
    feature_url: '/posts'
  },
  {
    feature_name: "Project Management",
    feature_slug: "project-management",
    feature_type: "space",
    feature_description: "Enable project tracking and management tools",
    feature_icon: 'project-management',
    feature_status: 1,
    feature_url: '/project-management'
  }
]

export const FeatureSeed = async()=>{
  return await db.transaction(async(tx)=>{
    try{

      await tx.delete(featuresTable).run()
      await tx.run(sql`DELETE FROM sqlite_sequence WHERE name = 'features';`);
      const features = await tx.insert(featuresTable).values(FeatureSeedList)

      if(features.rowsAffected === FeatureSeedList.length){
        console.log('✅ Features seeded successfully')
      }
    }catch(e){
      console.error(e)
      tx.rollback()
      console.log('❌ Error seeding features')
      process.exit(1)
    }
  })
}