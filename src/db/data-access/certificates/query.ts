import { eq } from "drizzle-orm"
import { db } from "../.."
import { certificatesTable, InsertCertificate } from "../../schema"

export async function CreateCertificates(data: InsertCertificate) {
  try {
    const certificate = await db
      .insert(certificatesTable)
      .values(data)
      .returning()

    return certificate[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetCertificates(userId: string) {
  try {
    const certificates = await db
      .select()
      .from(certificatesTable)
      .where(eq(certificatesTable.user_id, userId))

    return certificates
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateCertificate(
  certificateId: number,
  data: Partial<InsertCertificate>
) {
  try {
    const certificate = await db
      .update(certificatesTable)
      .set(data)
      .where(eq(certificatesTable.id, certificateId))
      .returning()

    return certificate[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function DeleteCertificate(certificateId: number) {
  try {
    await db
      .delete(certificatesTable)
      .where(eq(certificatesTable.id, certificateId))
  } catch (e: any) {
    throw new Error(e.message)
  }
}
