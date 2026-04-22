# Use a imagem oficial do Bun baseada no Alpine
FROM oven/bun:1-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e package-lock.json (se existir)
COPY package*.json ./

# Instale as dependências usando Bun
RUN bun install

# Copie o resto do código da aplicação
COPY . .

# Exponha a porta que a aplicação usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["bun", "run", "start"]