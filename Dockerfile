# 1. Usar Linux con Node.js v18
FROM node:18-bullseye-slim

# 2. Instalar LibreOffice y las fuentes necesarias (Esto es lo vital)
RUN apt-get update && \
    apt-get install -y libreoffice \
    fonts-opensymbol \
    hyphen-fr hyphen-de hyphen-en-us hyphen-it hyphen-ru \
    fonts-dejavu fonts-dejavu-core fonts-dejavu-extra \
    fonts-droid-fallback fonts-dustin fonts-f500 fonts-fanwood \
    fonts-freefont-ttf fonts-liberation fonts-lmodern fonts-lyx \
    fonts-sil-gentium fonts-texgyre fonts-tlwg-purisa && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Crear carpeta de trabajo
WORKDIR /app

# 4. Copiar archivos de configuración
COPY package*.json ./

# 5. Instalar dependencias del proyecto
RUN npm install --production

# 6. Copiar el resto del código
COPY . .

# 7. Exponer el puerto (Railway usa la variable PORT automáticamente)
ENV PORT=3000
EXPOSE 3000

# 8. Iniciar el servidor
CMD ["node", "server.js"]