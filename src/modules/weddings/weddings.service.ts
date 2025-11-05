import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes } from "crypto";
import { Repository } from "typeorm";
import { AcceptGuestDto } from "./dto/accept-guest.dto";
import { CreateWeddingDto } from "./dto/create-wedding.dto";
import { JoinWeddingDto } from "./dto/join-wedding.dto";
import { UpdateGiftPaymentDto } from "./dto/update-gift-payment.dto";
import { UpdateWeddingDto } from "./dto/update-wedding.dto";
import { Gift } from "./models/gift.entity";
import { Godparent } from "./models/godparent.entity";
import {
  WeddingUserRelation,
  WeddingUserRole,
} from "./models/wedding-user-relation.entity";
import { Wedding } from "./models/wedding.entity";

@Injectable()
export class WeddingsService {
  constructor(
    @InjectRepository(Wedding)
    private weddingsRepository: Repository<Wedding>,
    @InjectRepository(Godparent)
    private godparentsRepository: Repository<Godparent>,
    @InjectRepository(Gift)
    private giftsRepository: Repository<Gift>,
    @InjectRepository(WeddingUserRelation)
    private userRelationsRepository: Repository<WeddingUserRelation>,
  ) { }

  private generateInvitationCode(): string {
    return randomBytes(8).toString("hex").toUpperCase();
  }

  async create(
    createWeddingDto: CreateWeddingDto,
    userId: number,
  ): Promise<Wedding> {
    const invitationCode = this.generateInvitationCode();

    // Remove godparents e gifts do objeto para não duplicar via cascade
    const { godparents, gifts, ...weddingData } = createWeddingDto;

    const wedding = this.weddingsRepository.create({
      ...weddingData,
      weddingDate: new Date(createWeddingDto.weddingDate),
      invitationCode,
    });

    const savedWedding = await this.weddingsRepository.save(wedding);

    // Criar relação do usuário como noivo
    const userRelation = this.userRelationsRepository.create({
      weddingId: savedWedding.id,
      userId,
      role: WeddingUserRole.FIANCE,
      isAccepted: true, // Noivos são automaticamente aceitos
      acceptedAt: new Date(),
    });
    await this.userRelationsRepository.save(userRelation);

    // Criar padrinhos
    if (godparents && godparents.length > 0) {
      const godparentEntities = godparents.map((godparentDto) =>
        this.godparentsRepository.create({
          ...godparentDto,
          weddingId: savedWedding.id,
        }),
      );
      await this.godparentsRepository.save(godparentEntities);
    }

    // Criar presentes
    if (gifts && gifts.length > 0) {
      const giftEntities = gifts.map((giftDto) => {
        const gift = this.giftsRepository.create({
          ...giftDto,
          weddingId: savedWedding.id,
        });

        // Calcular valor restante
        if (gift.price) {
          gift.amountRemaining = gift.price;
        }

        return gift;
      });
      await this.giftsRepository.save(giftEntities);
    }

    return this.findOne(savedWedding.id);
  }

  async findAll(): Promise<Wedding[]> {
    return this.weddingsRepository.find({
      relations: ["userRelations", "userRelations.user", "godparents", "gifts"],
      where: { isActive: true },
    });
  }

  async findOne(id: number): Promise<Wedding> {
    const wedding = await this.weddingsRepository.findOne({
      where: { id, isActive: true },
      relations: ["userRelations", "userRelations.user", "godparents", "gifts"],
    });

    if (!wedding) {
      throw new NotFoundException(`Casamento com ID ${id} não encontrado`);
    }

    return wedding;
  }

  async findByInvitationCode(invitationCode: string): Promise<Wedding> {
    const wedding = await this.weddingsRepository.findOne({
      where: { invitationCode, isActive: true },
      relations: ["userRelations", "userRelations.user", "godparents", "gifts"],
    });

    if (!wedding) {
      throw new NotFoundException(
        `Casamento com código ${invitationCode} não encontrado`,
      );
    }

    return wedding;
  }

  async findMyWeddings(userId: number): Promise<Wedding[]> {
    const userRelations = await this.userRelationsRepository.find({
      where: { userId, isActive: true },
      relations: [
        "wedding",
        "wedding.userRelations",
        "wedding.userRelations.user",
        "wedding.godparents",
        "wedding.gifts",
      ],
    });

    return userRelations.map((relation) => relation.wedding);
  }

  async update(
    id: number,
    updateWeddingDto: UpdateWeddingDto,
    userId: number,
  ): Promise<Wedding> {
    console.log("🔧 Atualizando casamento:", { id, userId, updateWeddingDto });

    await this.checkUserPermission(id, userId, [WeddingUserRole.FIANCE]);

    const updateData = { ...updateWeddingDto };
    const { godparents, gifts, ...weddingData } = updateData;

        // Atualizar dados básicos do casamento
    if (Object.keys(weddingData).length > 0) {
      console.log("📝 Atualizando dados básicos:", weddingData);
      await this.weddingsRepository.update(id, {
        ...weddingData,
        updatedAt: new Date(),
      });
    }

    // Atualizar padrinhos se fornecidos
    if (godparents) {
      console.log("👥 Atualizando padrinhos:", godparents);
      // Remover padrinhos existentes
      await this.godparentsRepository.delete({ weddingId: id });

      // Criar novos padrinhos
      if (godparents.length > 0) {
        const newGodparents = godparents.map((godparentDto) =>
          this.godparentsRepository.create({
            ...godparentDto,
            weddingId: id,
          }),
        );
        await this.godparentsRepository.save(newGodparents);
      }
    }

        // Atualizar presentes se fornecidos
    if (gifts) {
      console.log("🎁 Atualizando presentes:", gifts);
      // Remover presentes existentes
      await this.giftsRepository.delete({ weddingId: id });

      // Criar novos presentes
      if (gifts.length > 0) {
        const newGifts = gifts.map((giftDto) => {
          const gift = this.giftsRepository.create({
            ...giftDto,
            weddingId: id,
          });

          // Calcular valor restante
          if (gift.price) {
            gift.amountRemaining = gift.price;
          }

          return gift;
        });
        await this.giftsRepository.save(newGifts);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.checkUserPermission(id, userId, [WeddingUserRole.FIANCE]);


    await this.weddingsRepository.update(id, { isActive: false });
  }

  // Método para usuários se juntarem a um casamento
  async joinWedding(
    joinWeddingDto: JoinWeddingDto,
    userId: number,
  ): Promise<WeddingUserRelation> {
    const wedding = await this.findByInvitationCode(
      joinWeddingDto.invitationCode,
    );

    // Verificar se o usuário já tem relação com este casamento
    const existingRelation = await this.userRelationsRepository.findOne({
      where: { weddingId: wedding.id, userId, isActive: true },
    });

    if (existingRelation) {
      throw new Error("Você já tem uma relação com este casamento");
    }

    // Criar relação como convidado (não aceito ainda)
    const userRelation = this.userRelationsRepository.create({
      weddingId: wedding.id,
      userId,
      role: WeddingUserRole.GUEST,
      isAccepted: false,
    });

    return this.userRelationsRepository.save(userRelation);
  }

  // Método para noivos aceitarem convidados
  async acceptGuest(
    weddingId: number,
    acceptGuestDto: AcceptGuestDto,
    userId: number,
  ): Promise<WeddingUserRelation> {
    // Verificar se o usuário é noivo deste casamento
    await this.checkUserPermission(weddingId, userId, [WeddingUserRole.FIANCE]);

    const userRelation = await this.userRelationsRepository.findOne({
      where: {
        weddingId,
        userId: acceptGuestDto.userId,
        role: WeddingUserRole.GUEST,
        isActive: true
      },
    });

    if (!userRelation) {
      throw new NotFoundException("Relação de convidado não encontrada");
    }

    if (userRelation.isAccepted) {
      throw new Error("Este convidado já foi aceito");
    }

    await this.userRelationsRepository.update(userRelation.id, {
      isAccepted: true,
      acceptedAt: new Date(),
      acceptedBy: userId,
      updatedAt: new Date(),
    });

    const updatedRelation = await this.userRelationsRepository.findOne({
      where: { id: userRelation.id },
    });
    if (!updatedRelation) {
      throw new NotFoundException("Relação não encontrada após atualização");
    }
    return updatedRelation;
  }

  // Método para verificar permissões do usuário
  async checkUserPermission(
    weddingId: number,
    userId: number,
    requiredRoles: WeddingUserRole[],
  ): Promise<void> {
    const userRelation = await this.userRelationsRepository.findOne({
      where: { weddingId, userId, isActive: true },
    });

    if (!userRelation) {
      throw new ForbiddenException("Você não tem acesso a este casamento");
    }

    if (!requiredRoles.includes(userRelation.role)) {
      throw new ForbiddenException(
        "Você não tem permissão para realizar esta ação",
      );
    }

    if (
      userRelation.role === WeddingUserRole.GUEST &&
      !userRelation.isAccepted
    ) {
      throw new ForbiddenException(
        "Seu convite ainda não foi aceito pelos noivos",
      );
    }
  }

  // Método para atualizar pagamento de um presente
  async updateGiftPayment(
    giftId: number,
    updatePaymentDto: UpdateGiftPaymentDto,
    userId: number,
  ): Promise<Gift> {
    const gift = await this.giftsRepository.findOne({
      where: { id: giftId, isActive: true },
      relations: ["wedding"],
    });

    if (!gift) {
      throw new NotFoundException(`Presente com ID ${giftId} não encontrado`);
    }

    // Verificar se o usuário tem acesso ao casamento
    await this.checkUserPermission(gift.weddingId, userId, [
      WeddingUserRole.FIANCE,
      WeddingUserRole.GUEST,
    ]);

    if (gift.isFullyPaid) {
      throw new Error("Este presente já foi totalmente pago");
    }

    if (gift.price && updatePaymentDto.amount > gift.amountRemaining) {
      throw new Error(
        "Valor da contribuição excede o valor restante do presente",
      );
    }

    // Atualizar valores do presente
    const newAmountPaid = gift.amountPaid + updatePaymentDto.amount;
    const newAmountRemaining = gift.price ? gift.price - newAmountPaid : 0;
    const isFullyPaid = gift.price ? newAmountPaid >= gift.price : false;

    const updateData: Partial<Gift> = {
      amountPaid: newAmountPaid,
      amountRemaining: newAmountRemaining,
      isFullyPaid,
      updatedAt: new Date(),
    };

    // Atualizar status do pagamento se fornecido
    if (updatePaymentDto.paymentStatus) {
      updateData.paymentStatus = updatePaymentDto.paymentStatus;
    }

    // Marcar como pago se foi totalmente pago
    if (isFullyPaid) {
      updateData.paidAt = new Date();
      updateData.paymentStatus = "completed";
    }

    await this.giftsRepository.update(giftId, updateData);

    const updatedGift = await this.giftsRepository.findOne({
      where: { id: giftId },
    });
    if (!updatedGift) {
      throw new NotFoundException(
        `Presente com ID ${giftId} não encontrado após atualização`,
      );
    }
    return updatedGift;
  }

  // Método para obter estatísticas de pagamento de um presente
  async getGiftPaymentStats(giftId: number, userId: number) {
    const gift = await this.giftsRepository.findOne({
      where: { id: giftId, isActive: true },
      relations: ["wedding"],
    });

    if (!gift) {
      throw new NotFoundException(`Presente com ID ${giftId} não encontrado`);
    }

    // Verificar se o usuário tem acesso ao casamento
    await this.checkUserPermission(gift.weddingId, userId, [
      WeddingUserRole.FIANCE,
      WeddingUserRole.GUEST,
    ]);

    const progressPercentage = gift.price
      ? (gift.amountPaid / gift.price) * 100
      : 0;

    return {
      id: gift.id,
      name: gift.name,
      price: gift.price,
      amountPaid: gift.amountPaid,
      amountRemaining: gift.amountRemaining,
      isFullyPaid: gift.isFullyPaid,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      paymentStatus: gift.paymentStatus,
      paidAt: gift.paidAt,
    };
  }
}
