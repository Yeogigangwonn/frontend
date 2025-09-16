# Python 3.10 slim 이미지 사용
FROM python:3.10-slim

# 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 필요한 의존성 설치 (Flask 같은거 필요없음, 기본 내장 http.server 대신 server.py 사용 가능)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 프론트엔드 파일 복사
COPY . .

# 기본 포트 8080 사용 (원하는 경우 변경 가능)
EXPOSE 8080

# server.py 실행 (기본 포트: 8080)
CMD ["python3", "server.py", "8080"]
