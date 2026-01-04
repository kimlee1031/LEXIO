# LEXIO 배포 가이드

## Vercel 배포 (프론트엔드)

1. **GitHub에 프로젝트 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Vercel에 배포**
   - [Vercel](https://vercel.com)에 로그인
   - "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - Framework Preset: Next.js
     - Root Directory: `./` (기본값)
   - Environment Variables 추가:
     ```
     NEXT_PUBLIC_SOCKET_URL=your-socket-server-url
     ```
   - "Deploy" 클릭

## Socket.io 서버 배포

Socket.io 서버는 별도로 배포해야 합니다. 다음 중 하나를 선택하세요:

### 옵션 1: Railway (추천)

1. [Railway](https://railway.app)에 로그인
2. "New Project" → "Deploy from GitHub repo"
3. `server` 디렉토리 선택
4. Environment Variables 설정:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   PORT=3001
   ```
5. 배포 후 URL을 Vercel 환경 변수에 추가

### 옵션 2: Render

1. [Render](https://render.com)에 로그인
2. "New Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Environment Variables 추가:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   PORT=3001
   ```

### 옵션 3: DigitalOcean App Platform

1. [DigitalOcean](https://digitalocean.com)에 로그인
2. "Create App" 선택
3. GitHub 저장소 연결
4. `server` 디렉토리 선택
5. Environment Variables 설정

## 로컬 테스트

### 프론트엔드 실행
```bash
npm install
npm run dev
```

### 서버 실행
```bash
cd server
npm install
npm run dev
```

### 환경 변수 설정
`.env.local` 파일 생성:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 문제 해결

### CORS 오류
서버의 `CLIENT_URL` 환경 변수가 올바르게 설정되었는지 확인하세요.

### 연결 오류
- Socket.io 서버가 실행 중인지 확인
- 방화벽 설정 확인
- 환경 변수가 올바르게 설정되었는지 확인

