"use server"

import * as Minio from "minio"
import { promises as fs } from "fs"
import * as path from "path"
import { randomUUID } from "crypto"
import { AddFile } from "../db/data-access/file/query"
import { GetSpaceById } from "../db/data-access/spaces/query"
import { createAbsoluteUrl } from "./clientHelper"
import { getEmailTemplateByName } from "../db/data-access/emails/query"
import Handlebars from "handlebars"
import { MailService } from "../services/mail/sendMail"

const mailer = new MailService()

async function sendEmailToRecipient({
  to,
  subject,
  body
}: {
  to: string
  subject: string
  body: string
}) {
  await mailer.sendEmail({
    to,
    from: process.env.EMAIL_FROM_ADDRESS!,
    subject,
    body
  })
}

export async function sendEmailFromTemplate({
  templateName,
  payload,
  sendingTo
}: {
  templateName: string
  payload: any
  sendingTo: string[]
}) {
  const template = await getEmailTemplateByName(templateName)
  if (!template) throw new Error(`Template not found: ${templateName}`)

  const compiledBody = Handlebars.compile(template.body)
  const renderedBody = compiledBody(payload)

  const compiledSubject = Handlebars.compile(template.subject)
  const renderedSubject = compiledSubject(payload)

  for (const to of sendingTo) {
    await sendEmailToRecipient({
      to,
      subject: renderedSubject,
      body: renderedBody
    })
  }
}

export const uploadFileToBucket = async (
  fileName: string,
  fileBase64: string,
  bucket: string,
  folderPath: string,
  tempFolderPath = "/tmp"
) => {
  if (!process.env.S3_ENDPOINT) {
    throw new Error("S3_ENDPOINT not set")
  }
  try {
    const s3Client = new Minio.Client({
      endPoint: process.env.S3_ENDPOINT,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY
    })
    // Create temporary file with unique name
    const bucketFileName = `${randomUUID()}-${fileName}`
    const tempFilePath = path.join(tempFolderPath, bucketFileName)
    const filePath = path.join(folderPath, bucketFileName)
    // Convert base64 to Buffer
    const fileBuffer = Buffer.from(fileBase64.split(",")[1], "base64")
    // Write buffer to temporary file
    await fs.writeFile(tempFilePath, fileBuffer)
    // Check/create bucket
    const exists = await s3Client.bucketExists(bucket)
    if (!exists) {
      await s3Client.makeBucket(bucket, process.env.S3_REGION)
    }
    // Upload file
    await s3Client.fPutObject(bucket, filePath, tempFilePath)
    const signedUrl = await s3Client.presignedGetObject(bucket, filePath)
    const delTempFile = () => {
      fs.unlink(tempFilePath)
    }
    return { url: signedUrl, delTempFile }
  } catch (error: any) {
    throw new Error(error)
  }
}

export const addFileToDb = async (
  fileName: string,
  fileBase64: string,
  bucket: string,
  fileSize: number,
  fileType: string,
  folderPath: string,
  tempFolderPath = "/tmp"
) => {
  let delFile = () => {}
  try {
    const { url: signedUrl, delTempFile } = await uploadFileToBucket(
      fileName,
      fileBase64,
      bucket,
      folderPath,
      tempFolderPath
    )
    delFile = delTempFile
    const fileData = await AddFile({
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      file_path: signedUrl
    })
    return { ...fileData }
  } catch (error: any) {
    throw new Error(error)
  } finally {
    delFile()
  }
}

export const getPostUrl = async (postId: string, spaceId?: string) => {
  const space = spaceId ? await GetSpaceById(spaceId) : null
  let communityId = null
  let proof_url = createAbsoluteUrl(`/posts/${postId}`)
  if (space) {
    communityId = space?.channel?.community_id
    proof_url = createAbsoluteUrl(
      `/channels/${space?.channel?.channel_slug}/spaces/${space?.space_slug}?page-type=posts&post-id=${postId}`
    )
  }
  return { proof_url, communityId }
}
