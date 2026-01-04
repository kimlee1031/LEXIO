# LEXIO - 온라인 보드게임

LEXIO를 온라인에서 친구들과 함께 플레이할 수 있는 웹 애플리케이션입니다.

## 기능

- 🎮 실시간 멀티플레이어 게임
- 🎴 LEXIO 게임 규칙 구현
- 🎨 아름다운 UI/UX
- 🌐 온라인 플레이 지원

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Socket.io (실시간 통신)
- **배포**: Vercel

## 설치 및 실행

### 클라이언트 (Next.js)

```bash
npm install
npm run dev
```

### 서버 (Socket.io)

```bash
cd server
npm install
npm run dev
```

## 배포

### Vercel에 배포

1. GitHub에 프로젝트를 푸시합니다
2. [Vercel](https://vercel.com)에 로그인합니다
3. "New Project"를 클릭하고 GitHub 저장소를 선택합니다
4. 자동으로 빌드 및 배포됩니다

### Socket.io 서버 배포

Socket.io 서버는 별도로 배포해야 합니다. 다음 옵션을 고려하세요:

- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com

서버 URL을 환경 변수로 설정하세요:
```
NEXT_PUBLIC_SOCKET_URL=your-socket-server-url
```

## 게임 규칙

LEXIO는 마작과 유사한 타일 게임입니다:

- **싱글**: 단일 타일
- **페어**: 같은 랭크 2장
- **트리플**: 같은 랭크 3장
- **스트레이트**: 연속된 숫자 5장
- **플러시**: 같은 슈트 5장
- **풀하우스**: 트리플 + 페어
- **포카드**: 같은 랭크 4장
- **스트레이트 플러시**: 연속된 숫자 + 같은 슈트 5장

## 라이선스

MIT

