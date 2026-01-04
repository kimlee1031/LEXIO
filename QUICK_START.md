# 빠른 시작 가이드

## 포트 설정
- **프론트엔드 (Next.js)**: `http://localhost:3000`
- **서버 (Socket.io)**: `http://localhost:3001`

## 실행 방법

### 방법 1: 두 개의 터미널 사용 (권장)

**터미널 1 - 프론트엔드:**
```bash
npm run dev
```
→ `http://localhost:3000`에서 실행됩니다

**터미널 2 - 서버:**
```bash
cd server
npm run dev
```
→ `http://localhost:3001`에서 실행됩니다

### 방법 2: 동시 실행 (Windows)

**PowerShell에서:**
```powershell
# 프론트엔드 (백그라운드)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

# 서버 (백그라운드)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev"
```

## 확인 사항

1. **프론트엔드가 정상 실행되면:**
   - 브라우저에서 `http://localhost:3000` 접속
   - "LEXIO" 화면이 보여야 합니다

2. **서버가 정상 실행되면:**
   - 터미널에 "Socket.io server running on port 3001" 메시지가 보여야 합니다

3. **환경 변수 확인:**
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인
   - 내용: `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`

## 문제 해결

### 포트가 이미 사용 중인 경우

**3000 포트가 사용 중:**
```bash
# 다른 포트로 실행
npm run dev -- -p 3002
```

**3001 포트가 사용 중:**
```bash
# 서버의 .env 파일에 다른 포트 지정
cd server
echo PORT=3002 > .env
npm run dev
```

그리고 `.env.local`도 수정:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
```

