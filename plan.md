# 바이브코딩 해커톤 결과물 등록 및 투표 웹페이지 계획

## Context
완전히 비어있는 저장소에 해커톤 투표 웹사이트를 처음부터 구축한다.
32명(8팀, 4인 1조) 참여자들이 결과물을 등록하고, 관리자가 투표를 개시/종료하며, 참여자들이 타 팀 결과물에 투표하는 시스템이다.

---

## Tech Stack

| 항목 | 선택 | 이유 |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Vercel 최적화, SSR/API 통합 |
| Styling | Tailwind CSS | 빠른 반응형 UI |
| ORM | Prisma + @vercel/postgres | Vercel Postgres(Neon) 연동 최적 |
| 리치 텍스트 | Tiptap (@tiptap/react) | 가볍고 확장성 좋음 |
| QR코드 | react-qr-code | 경량 |
| 비밀번호 해싱 | bcryptjs | 프로젝트 수정/삭제 비밀번호 보호 |

---

## 데이터베이스 스키마

```prisma
model Topic {
  id      Int    @id @default(1)
  content String @default("") @db.Text
}

model Project {
  id          String   @id @default(cuid())
  teamNumber  Int
  title       String
  url         String
  description String   @db.Text  // Tiptap HTML
  password    String              // bcrypt hashed
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  votes       Vote[]
}

model Vote {
  id            String   @id @default(cuid())
  voterName     String
  voterTeam     Int?     // null if not participant
  isParticipant Boolean
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())

  @@unique([voterName, voterTeam]) // 중복 투표 방지
}

model VotingState {
  id     Int    @id @default(1)
  status String @default("not_started") // "not_started" | "active" | "ended"
}
```

---

## 주요 기능 구현 상세

### 1. 오늘의 주제 영역 (TopicSection)
- 최상단에 위치
- 초기 상태: "🔒 오늘의 주제는?" 카드로 가려져 있음, "클릭하여 확인" 안내
- 클릭 시 비밀번호 모달 표시 → 비밀번호 **0417** 입력 시 주제 공개
- 공개 성공 시 localStorage에 `topicRevealed=true` 저장 → 재접속 시 자동 공개 유지
- 공개된 상태에서 **"접기"** 버튼 표시 → 클릭 시 다시 잠김 (localStorage 삭제)
- 재공개 시에도 비밀번호 재입력 필요
- 주제 내용은 어드민 페이지에서 설정, `/api/topic` GET으로 조회

### 2. 로그인 (LoginSection)
- localStorage 키: `hackathon_user` = `{ name, isParticipant, teamNumber }`
- 페이지 로드 시 localStorage에 저장된 값이 있으면 자동 로그인 (재접속 시 유지)
- 스텝 (첫 접속 또는 로그아웃 후):
  1. "해커톤에 참여하시는 조원인가요?" (예/아니오)
  2. 예 선택 시: 소속 조 선택 (1~8)
  3. 이름 입력
- 로그인 정보는 전역 상태(React Context)로 관리
- **로그아웃 버튼**: 헤더 우측에 작게 표시, 클릭 시 localStorage 삭제 + 로그인 폼으로 복귀

### 3. 결과물 등록 (ProjectForm)
- 등록 필수 항목:
  - 조 번호 (드롭다운, 1~8조)
  - Title
  - URL
  - 상세 설명 (5분 발표용) — Tiptap 리치 텍스트 에디터
    - 편집 기능: 불릿 포인트, 번호 목록, H1/H2/H3, Bold, Italic
    - 이미지 업로드 불가, 텍스트만
  - 비밀번호 (수정/삭제 시 필요, bcrypt 해싱 저장)
- 등록 후 **수정/삭제** 기능 제공
- 수정/삭제 시 등록 시 설정한 비밀번호 입력 필요

### 4. 투표 기능

**관리자 투표 제어 (AdminControls)**
- 낮은 주목도로 표시 (작은 회색 텍스트 버튼, 우측 하단)
- `not_started` 상태: **"투표 개시"** 버튼 표시
- `active` 상태: **"투표 종료"** 버튼 표시 (개시 버튼과 동일한 낮은 주목도)
- `ended` 상태: **"🏆 Winner"** 버튼 표시
- 각 버튼 클릭 시 관리자 비밀번호 **0417** 입력 모달

**투표 참여 (VoteModal)**
- `active` 상태일 때만 페이지 중앙에 크게 표시:
  - 버튼 타이틀: **"가장 마음에 드는 서비스를 선택해 주세요"**
  - 아래에 현재 페이지 URL QR코드 표시
- 버튼 클릭 시 등록된 조/타이틀 리스트 모달
- 로그인 정보 기반, **자신이 속한 조의 서비스는 선택 불가**
  - 팝업: "자신이 속한 조의 서비스는 투표할 수 없습니다."
- 1인 1표 (DB unique 제약 + 중복 체크, 비참여자 NULL 처리 포함)
- 투표 완료 후 localStorage에 기록 → "✅ 투표에 참여하셨습니다. 감사합니다!" 표시

### 5. 우승자 오버레이 (WinnerOverlay)
- `ended` 상태에서 "🏆 Winner" 버튼 클릭 시 전체 화면 풀 레이어 오버레이
- 표시 내용:
  - 🏆 트로피 아이콘 + "Winner" 타이틀
  - 우승 팀 번호 + 서비스 제목 (크게)
  - **"총 N표 중 M표 획득"** + 득표율
- canvas-confetti 애니메이션 효과
- 닫기 버튼

### 6. 어드민 페이지 (/admin)
- 메인 페이지 헤더에 낮은 주목도의 `admin` 링크로 접근
- 접속 시 비밀번호 입력 모달 (비밀번호: **0417**)
- 탭 구성:
  - **📊 투표 결과**: 프로젝트별 득표수 + 투표 막대 그래프 + 투표자 목록 (이름/조), 1~3등 메달 표시
  - **👥 참여자 현황**: 1~8조별 그룹핑, 투표 완료자 표시
  - **📝 주제 설정**: 오늘의 주제 텍스트 입력/저장
- **투표 초기화** 버튼: VotingState → `not_started`, 모든 Vote 삭제 (프로젝트는 유지), 이중 확인 후 실행

---

## API 설계

| Method | Path | 기능 | 인증 |
|---|---|---|---|
| GET | /api/topic | 주제 조회 | 없음 |
| PUT | /api/topic | 주제 수정 | 없음 (어드민 페이지에서만 접근) |
| GET | /api/projects | 전체 프로젝트 | 없음 |
| POST | /api/projects | 프로젝트 등록 | 없음 |
| PUT | /api/projects/[id] | 프로젝트 수정 | body.password 검증 |
| DELETE | /api/projects/[id] | 프로젝트 삭제 | body.password 검증 |
| GET | /api/votes | 집계 결과 | 없음 |
| POST | /api/votes | 투표 | body 검증 |
| GET | /api/voting-state | 투표 상태 | 없음 |
| PUT | /api/voting-state | 상태 변경 | body.adminPassword === "0417" |
| POST | /api/admin/reset | 초기화 | body.adminPassword === "0417" |
| GET | /api/admin/stats | 상세 통계 | query.adminPassword === "0417" |

---

## 확정된 설계 결정사항

| 항목 | 결정 |
|---|---|
| 주제 설정 | 어드민 페이지(/admin)에서 입력/수정 |
| DB | Vercel Postgres (Neon), @vercel/postgres + Prisma |
| 모든 비밀번호 | **0417** 통일 (주제 공개, 투표 관리, 어드민 접속) |
| 로그인 유지 | localStorage 기반, 재접속 시 자동 로그인 |
| 투표 실시간성 | 30초 간격 polling |

---

## 파일 구조

```
/
├── app/
│   ├── layout.tsx              # 전체 레이아웃, 폰트, 메타데이터
│   ├── page.tsx                # 메인 페이지 (모든 주요 기능)
│   ├── admin/
│   │   └── page.tsx            # 어드민 페이지
│   └── api/
│       ├── topic/route.ts          # GET, PUT
│       ├── projects/route.ts       # GET (전체), POST (등록)
│       ├── projects/[id]/route.ts  # PUT (수정), DELETE (삭제)
│       ├── votes/route.ts          # GET (집계), POST (투표)
│       ├── voting-state/route.ts   # GET, PUT
│       ├── admin/reset/route.ts    # POST (초기화)
│       └── admin/stats/route.ts    # GET (상세 통계)
├── components/
│   ├── TopicSection.tsx        # 비밀번호로 주제 공개/접기
│   ├── LoginSection.tsx        # 로컬스토리지 기반 로그인
│   ├── ProjectCard.tsx         # 프로젝트 카드 (수정/삭제)
│   ├── ProjectForm.tsx         # 등록/수정 폼 + Tiptap 에디터
│   ├── VoteModal.tsx           # 투표 선택 모달
│   ├── WinnerOverlay.tsx       # 전체 화면 우승자 오버레이
│   ├── AdminControls.tsx       # 투표 개시/종료/위너 버튼
│   └── QRCodeDisplay.tsx       # URL QR코드
├── contexts/
│   └── UserContext.tsx         # 전역 로그인 상태
├── lib/
│   ├── db.ts                   # Prisma 싱글톤
│   └── passwords.ts            # bcrypt 유틸리티
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── plan.html               # 기획서 (브라우저에서 PDF 저장)
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── vercel.json                 # API 타임아웃 30초 설정
└── package.json
```

---

## 주요 고려사항

- **Prisma 싱글톤**: `lib/db.ts`에서 globalThis 패턴 (hot reload 문제 방지)
- **모바일 최적화**: Tailwind 반응형 클래스 (`sm:`, `md:`) 전체 적용
- **비참여자 중복 투표 방지**: voterTeam=null 시 NULL unique 제약 우회 → `isParticipant=false` 조건으로 별도 체크
- **레이스 컨디션 방어**: Prisma P2002 오류 캐치
- **Tiptap SSR**: `dynamic(() => import('./ProjectForm'), { ssr: false })`로 클라이언트 전용 렌더링
- **Vercel 타임아웃**: `vercel.json`에서 API 함수 maxDuration 30초 설정

---

## 배포 방법 (터미널 불필요)

1. GitHub `main` 브랜치 확인
2. [vercel.com](https://vercel.com) → Add New Project → 저장소 선택 → Deploy
3. Storage 탭 → Create Database → **Neon Postgres** 생성
4. Connect to Project → 환경변수 자동 설정
5. Deployments 탭 → Redeploy → 빌드 완료 후 접속 가능

> 빌드 스크립트(`prisma generate && prisma db push && next build`)가 DB 테이블 생성까지 자동 처리
