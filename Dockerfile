# Use uma imagem oficial do Node.js para construir a aplicação
FROM node:18-alpine AS build

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de dependências para a imagem
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar todo o código fonte para a imagem
COPY . .

# Build da aplicação para produção
RUN npm run build

# Segundo estágio - serve o build usando um servidor web leve (nginx)
FROM nginx:alpine

# Copiar build gerado para o diretório padrão do nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expor porta 80 para acesso externo
EXPOSE 80

# Comando para rodar o nginx no foreground (default)
CMD ["nginx", "-g", "daemon off;"]
