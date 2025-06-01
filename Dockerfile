# Etapa base: imagem Node.js
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia package.json e instala as dependências primeiro (para cache)
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta padrão do NestJS
EXPOSE 3001

# Comando padrão (pode ser sobrescrito pelo docker-compose)
CMD ["npm", "run", "start:dev"]
