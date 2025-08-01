import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BucketItem, Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly client: Client;

  constructor(private readonly config: ConfigService) {
    const endPoint = this.config.getOrThrow<string>('MINIO_ENDPOINT');
    const accessKey = this.config.getOrThrow<string>('MINIO_ACCESS_KEY');
    const secretKey = this.config.getOrThrow<string>('MINIO_SECRET_KEY');

    this.client = new Client({
      endPoint,
      port: 443,
      useSSL: true,
      accessKey,
      secretKey,
      region: 'eu-central-1',
      pathStyle: true,
    });
  }

  async listChunks(bucket: string, prefix: string) {
    const stream = this.client.listObjects(bucket, prefix);
    const chunks: string[] = [];
    stream.on('data', (obj) => obj.name && chunks.push(obj.name));
    await new Promise((resolve) => stream.on('end', resolve));
    return chunks;
  }

  getChunkStream(bucket: string, objectName: string) {
    return this.client.getObject(bucket, objectName);
  }

  uploadFile(bucket: string, objectName: string, localPath: string) {
    const fileStream = fs.createReadStream(localPath);
    return this.client.putObject(bucket, objectName, fileStream);
  }

  async deleteFolder(bucket: string, prefix: string) {
    const objectsToDelete: string[] = [];

    const stream = this.client.listObjectsV2(bucket, prefix, true);
    for await (const obj of stream as AsyncIterable<BucketItem>) {
      if (obj.name) objectsToDelete.push(obj.name);
    }

    if (objectsToDelete.length > 0) {
      await this.client.removeObjects(bucket, objectsToDelete);
    }
  }
}
