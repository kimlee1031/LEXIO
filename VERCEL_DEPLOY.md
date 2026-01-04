# Vercel 배포 가이드

## 중요 사항

⚠️ **Socket.io 서버는 Vercel에서 실행할 수 없습니다!**
- Vercel은 서버리스 함수만 지원하며, 지속적인 WebSocket 연결을 지원하지 않습니다
- Socket.io 서버는 별도로 배포해야 합니다 (Railway, Render, DigitalOcean 등)

## 배포 단계

### 1. GitHub에 코드 푸시

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Vercel에 프로젝트 연결

1. [Vercel](https://vercel.com)에 로그인
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택: `kimlee1031/LEXIO`
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)

### 3. 환경 변수 설정

Vercel 대시보드에서 **Environment Variables** 추가:

```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server-url.railway.app
```

⚠️ **중요**: Socket.io 서버를 먼저 배포하고 URL을 얻어야 합니다!

### 4. Socket.io 서버 배포 (Railway 추천)

#### Railway 배포:

1. [Railway](https://railway.app)에 로그인
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택 후 `server` 디렉토리 지정
4. Environment Variables 설정:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   PORT=3001
   ```
5. 배포 후 URL 복사 (예: `https://lexio-server.railway.app`)
6. 이 URL을 Vercel의 `NEXT_PUBLIC_SOCKET_URL`에 설정

### 5. 배포 확인

1. Vercel에서 배포 완료 대기
2. 배포된 URL로 접속
3. Socket.io 서버 URL이 올바르게 설정되었는지 확인

## 문제 해결

### 빌드 실패

- **TypeScript 오류**: `tsconfig.json` 확인
- **의존성 오류**: `package.json` 확인
- **빌드 타임아웃**: Vercel 대시보드에서 타임아웃 시간 증가

### Socket 연결 오류

- Socket.io 서버가 실행 중인지 확인
- `NEXT_PUBLIC_SOCKET_URL` 환경 변수가 올바른지 확인
- CORS 설정 확인 (서버의 `CLIENT_URL`이 Vercel URL과 일치하는지)

### 로컬과 다른 동작

- 환경 변수가 제대로 설정되었는지 확인
- 브라우저 콘솔에서 연결 오류 확인

## 현재 상태

현재 로그는 경고(warn) 메시지이며, 빌드는 계속 진행 중일 수 있습니다.
- `npm warn deprecated`: 의존성 경고 (빌드에는 영향 없음)
- 빌드가 완료될 때까지 기다려보세요

## 다음 단계

1. Socket.io 서버를 Railway/Render에 배포
2. Vercel 환경 변수에 Socket 서버 URL 설정
3. 재배포

