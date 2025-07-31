import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Repository } from "typeorm";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { MercadoPagoPaymentResponse } from "../dto/mercadopago-payment-response.dto";
import { Gift } from "../models/gift.entity";

@Injectable()
export class PaymentsService {
  private payment: Payment;

  constructor(
    @InjectRepository(Gift)
    private giftsRepository: Repository<Gift>,
  ) {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: { timeout: 5000 },
    });
    this.payment = new Payment(client);
  }

  async payGift(dto: CreatePaymentDto): Promise<MercadoPagoPaymentResponse> {
    const gift = await this.giftsRepository.findOne({
      where: { id: dto.giftId, isActive: true },
    });
    if (!gift) throw new BadRequestException("Presente não encontrado");
    if (gift.isFullyPaid) throw new BadRequestException("Presente já pago");
    if (dto.amount > gift.amountRemaining)
      throw new BadRequestException("Valor excede o restante do presente");

    console.log(`Creating payment for gift ${dto.giftId}, amount: ${dto.amount}, method: ${dto.method}`);

    const paymentData: Record<string, any> = {
      transaction_amount: Math.round(dto.amount * 100), // Converter reais para centavos
      description: `Contribuição para presente: ${gift.name}`,
      payment_method_id: dto.method,
      payer: { email: dto.payerEmail },
      external_reference: `gift_${dto.giftId}`,
    };

    if (dto.method === "card") {
      paymentData.token = dto.cardToken;
      paymentData.installments = 1;
      paymentData.payment_method_id = "credit_card";
    }

    const result = (await this.payment.create({
      body: paymentData,
    })) as unknown as MercadoPagoPaymentResponse;

    console.log(`Payment created with ID: ${result.id}, status: ${result.status}`);

    if (
      String(result.status) === "201" &&
      (result.status === "approved" ||
        (dto.method === "pix" && result.status === "pending"))
    ) {
      const paymentAmountInReais = result.transaction_amount / 100; // Converter centavos para reais
      gift.amountPaid += paymentAmountInReais;
      gift.amountRemaining -= paymentAmountInReais;
      if (gift.amountRemaining <= 0) {
        gift.isFullyPaid = true;
        gift.paymentStatus = "completed";
        gift.paidAt = new Date();
        console.log(`Gift ${dto.giftId} fully paid after payment`);
      }
      await this.giftsRepository.save(gift);
      console.log(`Gift ${dto.giftId} updated in database`);
    }

    return result;
  }
}
