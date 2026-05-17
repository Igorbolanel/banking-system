FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_CORE_API_URL
ARG VITE_CURRENCIES_API_URL
ARG VITE_INFO_API_URL
ARG VITE_ASSISTANT_API_URL

ENV VITE_CORE_API_URL=$VITE_CORE_API_URL
ENV VITE_CURRENCIES_API_URL=$VITE_CURRENCIES_API_URL
ENV VITE_INFO_API_URL=$VITE_INFO_API_URL
ENV VITE_ASSISTANT_API_URL=$VITE_ASSISTANT_API_URL
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
