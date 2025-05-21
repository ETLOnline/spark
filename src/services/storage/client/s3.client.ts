import * as Minio from "minio";
import { S3_ACCESS_KEY, S3_ENDPOINT, S3_SECRET_KEY } from "../config";


export const s3Client = ()=>{
  return new Minio.Client({
    endPoint: S3_ENDPOINT,
    accessKey: S3_ACCESS_KEY,
    secretKey: S3_SECRET_KEY,
  });
}