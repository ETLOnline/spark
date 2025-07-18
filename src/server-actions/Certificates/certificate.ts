"use server"

import { InsertCertificate } from "@/src/db/schema"
import { CreateServerAction } from ".."
import {
  CreateCertificates,
  DeleteCertificate,
  GetCertificates,
  UpdateCertificate
} from "@/src/db/data-access/certificates/query"

export const CreateCertificateAction = CreateServerAction(
  true,
  async (data: InsertCertificate) => {
    try {
      const certificate = await CreateCertificates(data)

      return { success: true, data: certificate }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetCertificatesAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      const certificates = await GetCertificates(userId)
      return { success: true, data: certificates }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateCertificateAction = CreateServerAction(
  true,
  async (certificateId: number, data: Partial<InsertCertificate>) => {
    try {
      const certificate = await UpdateCertificate(certificateId, data)

      return { success: true, data: certificate }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteCertificateAction = CreateServerAction(
  true,
  async (certificateId: number) => {
    try {
      await DeleteCertificate(certificateId)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)
