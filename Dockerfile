# 1단계: Build stage
FROM node:18-alpine AS build

# 작업 디렉토리
WORKDIR /app

# package.json, package-lock.json 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# 2단계: Production stage (Nginx 사용)
FROM nginx:alpine

# Nginx 기본 설정 제거 후 커스텀 conf 복사 가능
COPY --from=build /app/build /usr/share/nginx/html

# 기본 포트 80 오픈
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
