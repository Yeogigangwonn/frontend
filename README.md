# 백엔드 통신 테스트 프론트엔드

백엔드와의 통신 상태를 확인하기 위한 간단한 웹 페이지입니다.

## 기능

- 백엔드 서버 연결 상태 실시간 확인
- API 엔드포인트 테스트 (/, /health, /api/health 등)
- 응답 시간, 상태 코드, 응답 데이터 표시
- 연결 로그 기록 및 확인
- 사용자 정의 백엔드 URL 설정

## 사용 방법

### 1. 프론트엔드 서버 실행

```bash
# Python을 이용한 간단한 HTTP 서버 실행
python3 server.py

# 또는 다른 포트 사용 (예: 3000번 포트)
python3 server.py 3000
```

### 2. 브라우저에서 접속

```
http://localhost:8080
```

### 3. 백엔드 서버 설정

- 페이지의 "백엔드 URL" 입력 필드에 테스트할 백엔드 서버 주소를 입력
- 기본값: `http://localhost:8000`

### 4. 테스트 실행

- **연결 테스트**: 기본 루트 경로(/)로 요청을 보내 연결 상태 확인
- **Health Check**: /health 엔드포인트를 테스트하고, 없을 경우 다른 일반적인 엔드포인트들도 자동으로 시도

## 파일 구조

```
frontendRestart/
├── index.html      # 메인 HTML 페이지
├── script.js       # JavaScript 로직
├── style.css       # 스타일시트
├── server.py       # 로컬 HTTP 서버 (선택사항)
└── README.md       # 이 파일
```

## 주요 기능 설명

### 연결 상태 표시
- 🟢 **연결 성공**: 백엔드 서버와 정상 통신
- 🟡 **연결 중**: 요청 처리 중
- 🔴 **연결 실패**: 서버 오류 또는 네트워크 문제
- ⚪ **연결되지 않음**: 아직 테스트하지 않음

### API 테스트
- 다양한 HTTP 메서드 지원
- CORS 설정 자동 처리
- 응답 시간 측정
- JSON 및 텍스트 응답 모두 지원

### 로그 시스템
- 실시간 연결 로그 기록
- 시간별 요청/응답 추적
- 색상별 로그 레벨 (성공/오류/경고/정보)

## 백엔드 요구사항

이 프론트엔드와 통신하려면 백엔드 서버에서 CORS를 허용해야 합니다:

```python
# FastAPI 예시
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```
