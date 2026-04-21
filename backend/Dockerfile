FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN chmod +x entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
CMD ["node", "server.js"]
