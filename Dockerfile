# Base image
 # Altere para o compilador da linguagem que você está usando.
FROM node:18

# Cria o diretório de trabalho app
WORKDIR /app
# Copias ambos os arquivos package.json
COPY package.json ./

# Instala as dependencias
RUN npm install

# Copia os arquivos de código fonte para o diretorio de trabalho
COPY . .

# Expoê a porta 3000 para o protocolo TCP/IP
EXPOSE 3000/tcp

# Faz a build do código fonte
# CMD ["npm", "run", "build"]
