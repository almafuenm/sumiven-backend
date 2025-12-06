# 1. Usar una base ligera
FROM node:18-bullseye-slim

# 2. Instalar LibreOffice "Light" (Sin extras innecesarios)
# Agregamos --no-install-recommends para evitar que colapse la memoria
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-java-common \
    default-jre-headless \
    fonts-opensymbol \
    hyphen-fr hyphen-de hyphen-en-us hyphen-it hyphen-ru \
    fonts-dejavu fonts-dejavu-core fonts-dejavu-extra \
    fonts-droid-fallback fonts-dustin fonts-f500 fonts-fanwood \
    fonts-freefont-ttf fonts-liberation fonts-lmodern fonts-lyx \
    fonts-sil-gentium fonts-texgyre fonts-tlwg-purisa && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Carpeta de trabajo
WORKDIR /app

# 4. Copiar dependencias
COPY package*.json ./

# 5. Instalar node modules
RUN npm install --production

# 6. Copiar resto del código
COPY . .

# 7. Exponer puerto
ENV PORT=3000
EXPOSE 3000

# 8. Arrancar
CMD ["node", "server.js"]