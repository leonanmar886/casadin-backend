import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName = "casadin-images";
  private folder = "original";

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>("AWS_REGION") || "us-east-1",
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID") || "",
        secretAccessKey:
          this.configService.get<string>("AWS_SECRET_ACCESS_KEY") || "",
        sessionToken: this.configService.get<string>("AWS_SESSION_TOKEN"),
      },
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const fileId = uuidv4();
      const fileExtension = this.getFileExtension(file.originalname);
      const key = `${this.folder}/${fileId}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
        },
      });

      await this.s3Client.send(command);
      return this.getImageUrl(key);
    } catch (error) {
      throw new Error(`Erro no upload da imagem: ${error.message}`);
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Erro no upload das imagens: ${error.message}`);
    }
  }

  async deleteImage(fileId: string): Promise<void> {
    try {
      const key = `${this.folder}/${fileId}`;

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Erro ao deletar imagem: ${error.message}`);
    }
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? "" : filename.substring(lastDot);
  }

  private getImageUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.configService.get<string>("AWS_REGION") || "us-east-1"}.amazonaws.com/${key}`;
  }
}
