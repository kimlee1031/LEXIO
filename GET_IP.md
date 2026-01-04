# 내 IP 주소 확인하기

## Windows

**명령 프롬프트 또는 PowerShell에서:**
```bash
ipconfig
```

출력에서 `IPv4 주소`를 찾으세요:
```
IPv4 주소 . . . . . . . . . : 192.168.55.33
```

## Mac

**터미널에서:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

또는:
```bash
ipconfig getifaddr en0
```

## Linux

**터미널에서:**
```bash
hostname -I
```

또는:
```bash
ip addr show | grep "inet "
```

## 빠른 확인

**브라우저에서:**
- https://whatismyipaddress.com 접속
- 또는 https://ipinfo.io 접속

⚠️ 주의: 이 방법은 공인 IP를 보여줍니다. 같은 네트워크 내에서는 사설 IP(192.168.x.x 등)를 사용하세요.

