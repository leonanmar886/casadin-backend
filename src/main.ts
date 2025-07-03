import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  app.enableCors({
    origin: "http://localhost:3000",
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle("CasaDin API")
    .setDescription("API para gerenciamento de casamentos e presentes")
    .setVersion("1.0")
    .addTag("auth", "Autenticação e autorização")
    .addTag("users", "Gerenciamento de usuários")
    .addTag("weddings", "Gerenciamento de casamentos")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
