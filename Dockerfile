# 1단계: Build stage (Node.js로 React 빌드)
FROM node:18-alpine AS build

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 복사
COPY . .

# GitHub Actions에서 전달받은 API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# React 빌드 (빌드 타임에 API URL이 반영됨)
RUN npm run build

# 2단계: Production stage (Nginx)
FROM nginx:alpine

# 빌드 결과물을 Nginx 기본 경로에 복사
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
