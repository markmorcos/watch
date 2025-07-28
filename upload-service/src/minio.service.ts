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

  async uploadVideo(bucket: string, objectName: string, filePath: string) {
    await this.client.fPutObject(bucket, objectName, filePath);
  }
}
