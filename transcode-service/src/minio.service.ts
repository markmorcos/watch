import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly client: Client;

  constructor(private readonly config: ConfigService) {
    const endPoint = this.config.getOrThrow<string>('MINIO_ENDPOINT');
    const accessKey = this.config.getOrThrow<string>('MINIO_ACCESS_KEY');
    const secretKey = this.config.getOrThrow<string>('MINIO_SECRET_KEY');

    this.client = new Client({ endPoint, accessKey, secretKey });
  }

  downloadFile(bucket: string, objectName: string, localPath: string) {
    return this.client.fGetObject(bucket, objectName, localPath);
  }

  uploadFile(bucket: string, objectName: string, localPath: string) {
    return this.client.fPutObject(bucket, objectName, localPath);
  }
}
