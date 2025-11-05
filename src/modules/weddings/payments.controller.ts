import { Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../authentication/guards/jwt-auth.guard";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { Gift } from "./models/gift.entity";
import { PaymentsService } from "./services/payments.service";

@ApiTags("weddings")
@Controller("weddings/payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    @InjectRepository(Gift)
    private readonly giftsRepository: Repository<Gift>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Realizar pagamento de presente (Pix ou Cartão) via Mercado Pago",
  })
  @ApiBody({
    type: CreatePaymentDto,
    examples: {
      pix: {
        summary: "Pagamento via Pix",
        value: {
          giftId: 1,
          amount: 50.0,
          method: "pix",
          payerEmail: "convidado@email.com",
        },
      },
      card: {
        summary: "Pagamento via Cartão",
        value: {
          giftId: 1,
          amount: 100.0,
          method: "card",
          cardToken: "token_gerado_no_front",
          payerEmail: "convidado@email.com",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      "Pagamento criado com sucesso. Para Pix, retorna QR Code e código copia e cola. Para cartão, retorna status do pagamento.",
    schema: {
      example: {
        id: 123456789,
        status: "pending",
        payment_method_id: "pix",
        point_of_interaction: {
          transaction_data: {
            qr_code:
              "00020126360014BR.GOV.BCB.PIX0114+55119999999952040000530398654041.005802BR5920NOME DO RECEBEDOR6009Sao Paulo62070503***6304B14F",
            qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAA...",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos ou valor excede o restante do presente",
  })
  @ApiResponse({ status: 401, description: "Não autorizado" })
  async payGift(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.payGift(dto);
  }

  @Post("webhook")
  @ApiOperation({ summary: "Webhook do Mercado Pago para notificações de pagamento" })
  @ApiResponse({
    status: 200,
    description: "Webhook processado com sucesso",
    schema: {
      example: {
        received: true,
        status: "approved",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos ou pagamento não encontrado",
  })
  async mercadoPagoWebhook(@Req() req: Request) {
    // Validação básica de segurança
    const userAgent = req.headers['user-agent'];
    if (!userAgent || !userAgent.includes('MercadoPago')) {
      console.warn('Webhook received from unknown source:', userAgent);
      return { received: false, reason: "Unauthorized source" };
    }

    const paymentId = req.body?.data?.id;
    if (!paymentId) {
      console.log("Webhook received without payment ID");
      return { received: false, reason: "No payment id" };
    }

    console.log(`Webhook received for payment ${paymentId}`);

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: { timeout: 5000 },
    });
    const paymentApi = new Payment(client);
    let payment;
    try {
      payment = await paymentApi.get({ id: paymentId });
      console.log(`Payment ${paymentId} status: ${payment.status}`);
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      return { received: false, reason: "Payment not found in Mercado Pago" };
    }

    if (payment.status === "approved") {
      const externalRef = payment.external_reference;
      if (externalRef && externalRef.startsWith("gift_")) {
        const giftId = parseInt(externalRef.replace("gift_", ""));
        const gift = await this.giftsRepository.findOne({
          where: { id: giftId, isActive: true },
        });

        if (gift) {
          console.log(`Updating gift ${giftId} with payment ${paymentId}`);
          const paymentAmountInReais = Number(payment.transaction_amount);
          const newAmountPaid = Number(gift.amountPaid) + paymentAmountInReais;
          const newAmountRemaining = Math.max(0, Number(gift.price) - newAmountPaid);
          
          gift.amountPaid = newAmountPaid;
          gift.amountRemaining = newAmountRemaining;

          if (gift.amountRemaining <= 0) {
            gift.isFullyPaid = true;
            gift.paymentStatus = "completed";
            gift.paidAt = new Date();
            console.log(`Gift ${giftId} fully paid`);
          } else {
            gift.paymentStatus = "pending";
            console.log(`Gift ${giftId} partially paid: ${gift.amountPaid}/${gift.price}`);
          }

          await this.giftsRepository.save(gift);
          console.log(`Gift ${giftId} updated successfully`);
        }
      } else {
        console.warn(`Invalid external reference for payment ${paymentId}: ${externalRef}`);
      }
    } else if (
      payment.status === "rejected" ||
      payment.status === "cancelled"
    ) {
      console.log(`Payment ${paymentId} was ${payment.status}`);
    }

    return { received: true, status: payment.status };
  }

  @Get("status/:paymentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Consultar status de um pagamento" })
  @ApiParam({ name: "paymentId", description: "ID do pagamento no Mercado Pago" })
  @ApiResponse({
    status: 200,
    description: "Status do pagamento",
    schema: {
      example: {
        id: 123456789,
        status: "approved",
        transaction_amount: 100,
        external_reference: "gift_2",
        date_created: "2025-07-31T12:58:46.433-04:00",
      },
    },
  })
  async getPaymentStatus(@Param("paymentId") paymentId: string) {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: { timeout: 5000 },
    });
    const paymentApi = new Payment(client);
    
    try {
      const payment = await paymentApi.get({ id: paymentId });
      return {
        id: payment.id,
        status: payment.status,
        transaction_amount: payment.transaction_amount,
        external_reference: payment.external_reference,
        date_created: payment.date_created,
      };
    } catch (error) {
      throw new NotFoundException("Pagamento não encontrado");
    }
  }
}
