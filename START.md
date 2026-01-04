# LEXIO 실행 가이드

## 로컬 개발 환경 실행

### 1. 프론트엔드 실행 (터미널 1)

```bash
npm install
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 2. 서버 실행 (터미널 2)

```bash
cd server
npm install
npm run dev
```

서버는 `http://localhost:3001`에서 실행됩니다.

### 3. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음을 추가하세요:

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 문제 해결

### WebSocket 연결 오류

만약 "WebSocket connection failed" 오류가 발생하면:

1. **서버가 실행 중인지 확인**
   - 서버 터미널에서 "Socket.io server running on port 3001" 메시지가 보여야 합니다
   - 브라우저에서 `http://localhost:3001`에 접속해보세요 (연결 오류가 나면 정상입니다)

2. **포트 충돌 확인**
   - 다른 프로그램이 3001 포트를 사용 중일 수 있습니다
   - `netstat -ano | findstr :3001` 명령어로 확인

3. **서버 재시작**
   - 서버 터미널에서 `Ctrl+C`로 중지 후 다시 `npm run dev` 실행

### 서버가 시작되지 않는 경우

```bash
cd server
npm install
npm run dev
```

`tsx`가 없다는 오류가 나면:
```bash
npm install -g tsx
```

또는:
```bash
npm install --save-dev tsx
```

