import { db } from "..";
import { usersTable } from "../schema";
import UserSeedList from '../seeds/UserSeedList.json';

export const UserSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(usersTable);

      const res = await tx.insert(usersTable).values(UserSeedList);
      console.log('✅ Users seeded successfully');
    } catch (e) {
      console.log('❌ Error seeding Users');
      process.exit(1);
    }
  });
};