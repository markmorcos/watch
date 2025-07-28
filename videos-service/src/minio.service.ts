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

  async listObjects(bucket: string): Promise<string[]> {
    const stream = this.client.listObjectsV2(bucket, '', true);
    const files: string[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => obj.name && files.push(obj.name));
      stream.on('end', () => resolve(files));
      stream.on('error', reject);
    });
  }

  getObject(bucket: string, objectName: string) {
    return this.client.presignedUrl('GET', bucket, objectName);
  }
}
