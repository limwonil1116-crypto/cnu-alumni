# 충남대학교 동문 디렉터리 앱

충남대학교 졸업생 전용 폐쇄형 동문 네트워크 서비스입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **패키지**: lucide-react, clsx, tailwind-merge

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 확인
# http://localhost:3000
```

## 배포 (Vercel 권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

## 페이지 구조

```
/                     시작 화면
/verify               본인 인증
/verify/success       인증 성공
/verify/fail          인증 실패
/login                로그인
/directory            동문 검색 홈
/directory/[id]       동문 프로필 상세
/mypage               마이페이지
/mypage/edit          프로필 수정
/policy               개인정보 처리 안내
/admin/login          관리자 로그인
/admin/dashboard      관리자 대시보드
/admin/alumni         졸업생 목록 관리
/admin/uploads        리스트 업로드
/admin/uploads/result 업로드 검증 결과
/admin/approvals      승인 대기 관리
```

## 데모 계정

| 화면 | 입력값 |
|------|--------|
| 본인 인증 | 이름: **홍길동** 입력 시 인증 성공 |
| 로그인 | 아무 이메일/비밀번호 입력 |
| 관리자 로그인 | 아무 ID/비밀번호 입력 |

## 디자인 시스템

충남대학교 공식 교색(군청색) 기반

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--cnu-primary` | `#1B3F7B` | 군청색 메인 |
| `--cnu-primary-dark` | `#112B55` | 진한 군청 (관리자) |
| `--cnu-primary-mid` | `#2A5BA8` | 중간 파랑 |
| `--cnu-accent` | `#C8941A` | 금색 포인트 |

## 다음 단계 (실제 서비스 구현)

1. **DB 연결**: Supabase 또는 Prisma + PostgreSQL
2. **인증**: NextAuth.js 또는 Supabase Auth
3. **파일 업로드**: AWS S3 또는 Vercel Blob
4. **API 라우트**: `/app/api/` 하위 실제 구현
5. **미들웨어**: `src/middleware.ts` 인증 보호 라우트 설정
