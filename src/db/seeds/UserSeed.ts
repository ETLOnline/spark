import { sql } from "drizzle-orm";
import { db } from "..";
import { usersTable } from "../schema";
import UserSeedList from '../seeds/UserSeedList.json'


export const UserSeed = async()=>{
  return await db.transaction(async(tx)=>{
    try{

      await tx.delete(usersTable)
      // await tx.execute(sql`ALTER SEQUENCE users_id_seq RESTART; UPDATE tablename SET id = DEFAULT;`);
      const res = await tx.insert(usersTable).values(UserSeedList)

      if(res.count === UserSeedList.length){
        console.log('✅ Users seeded successfully')
      }
    }catch(e){
      console.error(e)
      tx.rollback()
      console.log('❌ Error seeding Users')
      process.exit(1)
    }
  })
}