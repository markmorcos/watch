import * as fs from 'fs';
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

  async downloadFile(bucket: string, objectName: string, localPath: string) {
    const stream = await this.client.getObject(bucket, objectName);
    stream.pipe(fs.createWriteStream(localPath));
  }

  uploadFile(bucket: string, objectName: string, localPath: string) {
    const fileStream = fs.createReadStream(localPath);
    return this.client.putObject(bucket, objectName, fileStream);
  }
}
