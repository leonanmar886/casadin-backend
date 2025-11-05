import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../authentication/guards/jwt-auth.guard";
import { AcceptGuestDto } from "./dto/accept-guest.dto";
import { CreateWeddingDto } from "./dto/create-wedding.dto";
import { JoinWeddingDto } from "./dto/join-wedding.dto";
import { UpdateGiftPaymentDto } from "./dto/update-gift-payment.dto";
import { UpdateWeddingDto } from "./dto/update-wedding.dto";
import { UploadService } from "./services/upload.service";
import { WeddingsService } from "./weddings.service";

@ApiTags("weddings")
@Controller("weddings")
export class WeddingsController {
  constructor(
    private readonly weddingsService: WeddingsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Criar novo casamento" })
  @ApiResponse({
    status: 201,
    description: "Casamento criado com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  create(@Body() createWeddingDto: CreateWeddingDto, @Request() req) {
    return this.weddingsService.create(createWeddingDto, req.user.id);
  }

  @Post("join")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Juntar-se a um casamento via código de convite" })
  @ApiResponse({
    status: 201,
    description: "Solicitação de participação enviada com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Código de convite inválido",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  joinWedding(@Body() joinWeddingDto: JoinWeddingDto, @Request() req) {
    return this.weddingsService.joinWedding(joinWeddingDto, req.user.id);
  }

  @Post(":id/accept-guest")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Aceitar convidado no casamento" })
  @ApiParam({ name: "id", description: "ID do casamento" })
  @ApiResponse({
    status: 200,
    description: "Convidado aceito com sucesso",
  })
  @ApiResponse({
    status: 403,
    description: "Sem permissão ou convidado não encontrado",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  acceptGuest(
    @Param("id") id: string,
    @Body() acceptGuestDto: AcceptGuestDto,
    @Request() req,
  ) {
    return this.weddingsService.acceptGuest(+id, acceptGuestDto, req.user.id);
  }

  @Post("upload/couple-photos")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("photos", 10)) // Máximo 10 fotos
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Fazer upload de fotos do casal" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photos: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
          description: "Fotos do casal (máximo 10 arquivos)",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Fotos enviadas com sucesso",
    schema: {
      type: "object",
      properties: {
        urls: {
          type: "array",
          items: { type: "string" },
          example: [
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg",
          ],
        },
      },
    },
  })
  async uploadCouplePhotos(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: ".(jpg|jpeg|png|webp)" }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const urls = await this.uploadService.uploadMultipleImages(
      files,
      "weddings/couple-photos",
    );
    return { urls };
  }

  @Post("upload/footer-photo")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("photo"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Fazer upload da foto do rodapé" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photo: {
          type: "string",
          format: "binary",
          description: "Foto do rodapé",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Foto enviada com sucesso",
    schema: {
      type: "object",
      properties: {
        url: { type: "string", example: "https://example.com/footer.jpg" },
      },
    },
  })
  async uploadFooterPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: ".(jpg|jpeg|png|webp)" }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.uploadService.uploadImage(file, "weddings/footer");
    return { url };
  }

  @Post("upload/godparent-photo")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("photo"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Fazer upload da foto do padrinho" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photo: {
          type: "string",
          format: "binary",
          description: "Foto do padrinho",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Foto enviada com sucesso",
    schema: {
      type: "object",
      properties: {
        url: { type: "string", example: "https://example.com/godparent.jpg" },
      },
    },
  })
  async uploadGodparentPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: ".(jpg|jpeg|png|webp)" }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.uploadService.uploadImage(
      file,
      "weddings/godparents",
    );
    return { url };
  }

  @Post("upload/gift-photo")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("photo"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Fazer upload da foto do presente" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photo: {
          type: "string",
          format: "binary",
          description: "Foto do presente",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Foto enviada com sucesso",
    schema: {
      type: "object",
      properties: {
        url: { type: "string", example: "https://example.com/gift.jpg" },
      },
    },
  })
  async uploadGiftPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: ".(jpg|jpeg|png|webp)" }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.uploadService.uploadImage(file, "weddings/gifts");
    return { url };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Listar todos os casamentos" })
  @ApiResponse({
    status: 200,
    description: "Lista de casamentos",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  findAll() {
    return this.weddingsService.findAll();
  }

  @Get("my-weddings")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Listar casamentos do usuário autenticado" })
  @ApiResponse({
    status: 200,
    description: "Lista de casamentos do usuário",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  findMyWeddings(@Request() req) {
    return this.weddingsService.findMyWeddings(req.user.id);
  }

  @Get("invitation/:code")
  @ApiOperation({ summary: "Buscar casamento por código de convite" })
  @ApiParam({ name: "code", description: "Código de convite do casamento" })
  @ApiResponse({
    status: 200,
    description: "Casamento encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Casamento não encontrado",
  })
  findByInvitationCode(@Param("code") code: string) {
    return this.weddingsService.findByInvitationCode(code);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar casamento por ID" })
  @ApiParam({ name: "id", description: "ID do casamento" })
  @ApiResponse({
    status: 200,
    description: "Casamento encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Casamento não encontrado",
  })
  findOne(@Param("id") id: string) {
    return this.weddingsService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Atualizar casamento" })
  @ApiParam({ name: "id", description: "ID do casamento" })
  @ApiResponse({
    status: 200,
    description: "Casamento atualizado com sucesso",
  })
  @ApiResponse({
    status: 403,
    description: "Sem permissão para atualizar",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  update(
    @Param("id") id: string,
    @Body() updateWeddingDto: UpdateWeddingDto,
    @Request() req,
  ) {
    return this.weddingsService.update(+id, updateWeddingDto, req.user.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Remover casamento" })
  @ApiParam({ name: "id", description: "ID do casamento" })
  @ApiResponse({
    status: 200,
    description: "Casamento removido com sucesso",
  })
  @ApiResponse({
    status: 403,
    description: "Sem permissão para remover",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  remove(@Param("id") id: string, @Request() req) {
    return this.weddingsService.remove(+id, req.user.id);
  }

  // Endpoints para gerenciar pagamentos de presentes
  @Post("gifts/:id/payment")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Contribuir para pagamento de presente" })
  @ApiParam({ name: "id", description: "ID do presente" })
  @ApiResponse({
    status: 200,
    description: "Contribuição registrada com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Valor inválido ou presente já pago",
  })
  @ApiResponse({
    status: 403,
    description: "Sem permissão para contribuir",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  updateGiftPayment(
    @Param("id") id: string,
    @Body() updatePaymentDto: UpdateGiftPaymentDto,
    @Request() req,
  ) {
    return this.weddingsService.updateGiftPayment(
      +id,
      updatePaymentDto,
      req.user.id,
    );
  }

  @Get("gifts/:id/payment-stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Obter estatísticas de pagamento de presente" })
  @ApiParam({ name: "id", description: "ID do presente" })
  @ApiResponse({
    status: 200,
    description: "Estatísticas do presente",
    schema: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        name: { type: "string", example: "Jogo de Panelas" },
        price: { type: "number", example: 299.99 },
        amountPaid: { type: "number", example: 150.0 },
        amountRemaining: { type: "number", example: 149.99 },
        isFullyPaid: { type: "boolean", example: false },
        progressPercentage: { type: "number", example: 50.0 },
        paymentStatus: { type: "string", example: "pending" },
        paidAt: { type: "string", format: "date-time", nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Sem permissão para visualizar",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado",
  })
  getGiftPaymentStats(@Param("id") id: string, @Request() req) {
    return this.weddingsService.getGiftPaymentStats(+id, req.user.id);
  }
}
