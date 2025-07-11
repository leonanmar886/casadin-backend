# Configuração do Cloudinary

## 1. Criar Conta no Cloudinary

1. Acesse [https://cloudinary.com](https://cloudinary.com)
2. Clique em "Sign Up For Free"
3. Preencha os dados e confirme o email

## 2. Obter Credenciais

Após fazer login, você encontrará suas credenciais no Dashboard:

- **Cloud Name**: Nome da sua conta
- **API Key**: Chave da API
- **API Secret**: Segredo da API

## 3. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
```

## 4. Testar Upload

Use os endpoints criados:

### Upload de Fotos dos Noivos (múltiplas)
```bash
POST /weddings/upload/couple-photos
Content-Type: multipart/form-data

photos: [arquivo1.jpg, arquivo2.jpg, ...]
```

### Upload de Foto do Footer
```bash
POST /weddings/upload/footer-photo
Content-Type: multipart/form-data

photo: arquivo.jpg
```

### Upload de Foto do Padrinho
```bash
POST /weddings/upload/godparent-photo
Content-Type: multipart/form-data

photo: arquivo.jpg
```

### Upload de Foto do Presente
```bash
POST /weddings/upload/gift-photo
Content-Type: multipart/form-data

photo: arquivo.jpg
```

## 5. Limitações do Plano Gratuito

- **25GB** de armazenamento
- **25GB** de banda por mês
- **25** transformações por mês
- **25** uploads por mês

## 6. Estrutura de Pastas no Cloudinary

As imagens serão organizadas automaticamente:

```
weddings/
├── couple-photos/
│   ├── photo1.jpg
│   └── photo2.jpg
├── footer/
│   └── footer-photo.jpg
├── godparents/
│   └── godparent-photo.jpg
└── gifts/
    └── gift-photo.jpg
```

## 7. Validações Implementadas

- **Tamanho máximo**: 5MB por arquivo
- **Formatos aceitos**: JPG, JPEG, PNG, WebP
- **Máximo de fotos**: 10 fotos dos noivos por upload
- **Otimização automática**: Redimensionamento e compressão

## 8. URLs Retornadas

O Cloudinary retorna URLs seguras (HTTPS) no formato:
```
https://res.cloudinary.com/seu-cloud-name/image/upload/v1234567890/weddings/couple-photos/photo.jpg
``` 