import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get("CLOUDINARY_API_SECRET"),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = "weddings",
  ): Promise<string> {
    try {
      // Converter buffer para base64
      const base64Image = file.buffer.toString("base64");
      const dataURI = `data:${file.mimetype};base64,${base64Image}`;

      // Upload para Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder,
        transformation: [
          { width: 800, height: 600, crop: "limit" }, // Redimensionar se muito grande
          { quality: "auto" }, // Otimizar qualidade
        ],
      });

      return result.secure_url;
    } catch (error) {
      throw new Error(`Erro no upload da imagem: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = "weddings",
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file, folder),
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Erro no upload das imagens: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Erro ao deletar imagem: ${error.message}`);
    }
  }

  // Extrair public_id da URL do Cloudinary
  extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/([^/]+)\.\w+$/);
    return match ? match[1] : null;
  }
}
