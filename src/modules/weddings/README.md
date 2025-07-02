# Módulo de Casamentos

Este módulo gerencia casamentos, padrinhos e presentes no sistema CasaDin.

## Estrutura de Dados

### Wedding (Casamento)
- **id**: Identificador único
- **coupleName**: Nome dos noivos
- **primaryColor**: Cor principal do tema
- **weddingDate**: Data do casamento
- **weddingLocation**: Local do casamento
- **couplePhotos**: Array de URLs das fotos dos noivos
- **description**: Descrição do casamento
- **godparents**: Lista de padrinhos
- **gifts**: Lista de presentes
- **footerPhoto**: URL da foto do footer
- **invitationCode**: Código único de convite
- **userRelations**: Relações com usuários (noivos e convidados)

### WeddingUserRelation (Relação Usuário-Casamento)
- **id**: Identificador único
- **weddingId**: ID do casamento
- **userId**: ID do usuário
- **role**: Papel no casamento (fiance/guest)
- **isAccepted**: Se o convidado foi aceito pelos noivos
- **acceptedAt**: Data quando foi aceito
- **acceptedBy**: ID do noivo que aceitou

### Godparent (Padrinho)
- **id**: Identificador único
- **name**: Nome do padrinho
- **photo**: URL da foto (opcional)
- **relationship**: Relacionamento com os noivos
- **description**: Descrição adicional
- **weddingId**: ID do casamento

### Gift (Presente)
- **id**: Identificador único
- **name**: Nome do presente
- **description**: Descrição do presente
- **photo**: URL da foto do presente
- **price**: Preço do presente
- **store**: Loja onde o presente pode ser encontrado
- **amountPaid**: Valor total já pago pelos convidados
- **amountRemaining**: Valor restante para completar o presente
- **isFullyPaid**: Se o presente foi totalmente pago
- **paidAt**: Data quando o presente foi totalmente pago
- **paymentStatus**: Status do pagamento (pending/completed/failed)
- **weddingId**: ID do casamento

## Sistema de Permissões

O sistema usa permissões baseadas na relação do usuário com cada casamento específico:

### Roles Disponíveis:
- **fiance**: Noivo (pode criar, editar, deletar casamento, aceitar convidados)
- **guest**: Convidado (pode ver casamento e contribuir para presentes após ser aceito)

### Fluxo de Permissões:
1. **Criar Casamento**: Qualquer usuário autenticado pode criar um casamento e se torna automaticamente noivo
2. **Juntar-se ao Casamento**: Usuários podem se juntar usando o código de convite
3. **Aceitar Convidados**: Apenas noivos podem aceitar convidados
4. **Editar Casamento**: Apenas noivos podem editar
5. **Contribuir para Presentes**: Noivos e convidados aceitos podem contribuir

## Upload de Imagens

O sistema usa **Cloudinary** para armazenamento de imagens. Veja [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) para configuração.

### Endpoints de Upload

#### Fotos dos Noivos (múltiplas)
```bash
POST /weddings/upload/couple-photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

photos: [arquivo1.jpg, arquivo2.jpg, ...]
```

#### Foto do Footer
```bash
POST /weddings/upload/footer-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: arquivo.jpg
```

#### Foto do Padrinho
```bash
POST /weddings/upload/godparent-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: arquivo.jpg
```

#### Foto do Presente
```bash
POST /weddings/upload/gift-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: arquivo.jpg
```

### Validações de Upload
- **Tamanho máximo**: 5MB por arquivo
- **Formatos aceitos**: JPG, JPEG, PNG, WebP
- **Máximo de fotos**: 10 fotos dos noivos por upload
- **Otimização automática**: Redimensionamento e compressão

## Endpoints Disponíveis

### Casamentos
- `POST /weddings` - Criar casamento (qualquer usuário autenticado)
- `GET /weddings` - Listar todos os casamentos
- `GET /weddings/my-weddings` - Meus casamentos (onde sou noivo ou convidado)
- `GET /weddings/invitation/:code` - Buscar por código de convite
- `GET /weddings/:id` - Buscar casamento por ID
- `PATCH /weddings/:id` - Atualizar casamento (apenas noivos)
- `DELETE /weddings/:id` - Deletar casamento (apenas noivos)

### Relações de Usuários
- `POST /weddings/join` - Juntar-se a um casamento usando código de convite
- `POST /weddings/:id/accept-guest` - Aceitar convidado (apenas noivos)

### Upload de Imagens
- `POST /weddings/upload/couple-photos` - Upload fotos dos noivos
- `POST /weddings/upload/footer-photo` - Upload foto do footer
- `POST /weddings/upload/godparent-photo` - Upload foto do padrinho
- `POST /weddings/upload/gift-photo` - Upload foto do presente

### Pagamentos de Presentes
- `POST /weddings/gifts/:id/payment` - Contribuir para um presente
- `GET /weddings/gifts/:id/payment-stats` - Ver estatísticas de pagamento

## Sistema de Pagamento

O sistema permite que convidados contribuam com valores para os presentes:

### Contribuir para um Presente
```bash
POST /weddings/gifts/1/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "paymentStatus": "completed"
}
```

### Ver Estatísticas de Pagamento
```bash
GET /weddings/gifts/1/payment-stats
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Jogo de Panelas",
  "price": 299.99,
  "amountPaid": 150.00,
  "amountRemaining": 149.99,
  "isFullyPaid": false,
  "progressPercentage": 50.0,
  "paymentStatus": "completed",
  "paidAt": null
}
```

## Fluxo de Trabalho Recomendado

### 1. Criar Casamento
```javascript
// Qualquer usuário autenticado pode criar um casamento
const wedding = await fetch('/weddings', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    coupleName: "João e Maria",
    primaryColor: "#FF6B6B",
    weddingDate: "2024-12-25",
    weddingLocation: "Igreja Nossa Senhora",
    couplePhotos: [...],
    description: "Nosso casamento será um momento especial...",
    godparents: [...],
    gifts: [...],
    footerPhoto: "..."
  })
});
```

### 2. Juntar-se a um Casamento
```javascript
// Usuário se junta usando código de convite
const joinResponse = await fetch('/weddings/join', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invitationCode: "ABC123DEF"
  })
});
```

### 3. Aceitar Convidado (apenas noivos)
```javascript
// Noivo aceita um convidado
const acceptResponse = await fetch('/weddings/1/accept-guest', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 123
  })
});
```

### 4. Contribuir para Presentes
```javascript
// Convidado aceito ou noivo contribui para um presente
const contribution = await fetch('/weddings/gifts/1/payment', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 50.00,
    paymentStatus: "completed"
  })
});
```

## Exemplo de Uso

### Criar Casamento
```json
{
  "coupleName": "João e Maria",
  "primaryColor": "#FF6B6B",
  "weddingDate": "2024-12-25",
  "weddingLocation": "Igreja Nossa Senhora",
  "couplePhotos": [
    "https://res.cloudinary.com/.../photo1.jpg",
    "https://res.cloudinary.com/.../photo2.jpg"
  ],
  "description": "Nosso casamento será um momento especial...",
  "godparents": [
    {
      "name": "Pedro Silva",
      "relationship": "Padrinho",
      "description": "Melhor amigo do noivo"
    }
  ],
  "gifts": [
    {
      "name": "Jogo de Panelas",
      "description": "Jogo de panelas Tramontina",
      "price": 299.99,
      "store": "Magazine Luiza"
    }
  ],
  "footerPhoto": "https://res.cloudinary.com/.../footer.jpg"
}
```

### Juntar-se a um Casamento
```json
{
  "invitationCode": "ABC123DEF"
}
```

### Aceitar Convidado
```json
{
  "userId": 123
}
```

### Contribuir para Presente
```json
{
  "amount": 50.00,
  "paymentStatus": "completed"
}
```

## Segurança

- Autenticação JWT obrigatória para todas as operações
- Permissões baseadas na relação com cada casamento específico
- Códigos de convite são únicos e gerados automaticamente
- Validação de dados com class-validator
- Soft delete para manter histórico
- Validação de arquivos de upload
- Controle de valores de contribuição (não pode exceder valor restante)
- Convidados só podem contribuir após serem aceitos pelos noivos 