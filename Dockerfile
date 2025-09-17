# Nginx 베이스 이미지 사용
FROM nginx:alpine

# 작업 디렉토리
WORKDIR /usr/share/nginx/html

# 기존 파일 제거 후 정적 파일 복사
RUN rm -rf ./*
COPY . .

# 기본 Nginx 포트
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
