# PROJECT-A

[KB] IT's Your Life 7기 최종 프로젝트

> 프로젝트 주제, 서비스명, 한 줄 소개를 확정한 뒤 이 영역을 먼저 업데이트합니다.

## 프로젝트 소개

본 프로젝트는 [KB] IT's Your Life 7기 최종 프로젝트로, 팀 단위로 기획, 설계, 개발, 발표, 시연 영상을 제작합니다.

### 목표

- 사용자 문제를 정의하고 실제 서비스 형태로 해결합니다.
- 금융 IT 관점에서 보안, 데이터 관리, 인증/인가, 안정성을 고려합니다.
- GitHub 기반 협업, 코드 리뷰, 이슈 관리, 문서화를 통해 팀 개발 프로세스를 경험합니다.
- 최종 발표와 시연 영상을 통해 프로젝트 결과물을 명확하게 전달합니다.

### 핵심 기능

| 구분 | 기능 | 설명 | 담당 |
| --- | --- | --- | --- |
| MVP | 기능명 | 기능 설명 | 담당자 |
| MVP | 기능명 | 기능 설명 | 담당자 |
| 추가 | 기능명 | 기능 설명 | 담당자 |

## 팀원

| 이름 | 역할 | 담당 영역 | GitHub |
| --- | --- | --- | --- |
| 이름 | 팀장 | 기획, 일정 관리, 통합 관리 | [@github-id](https://github.com/github-id) |
| 이름 | Frontend | 화면 구현, UI/UX | [@github-id](https://github.com/github-id) |
| 이름 | Backend | API, DB, 인증/인가 | [@github-id](https://github.com/github-id) |
| 이름 | Fullstack | 기능 개발, 테스트 | [@github-id](https://github.com/github-id) |

## 일정

| 날짜 | 구분 | 내용 |
| --- | --- | --- |
| 2026-07-11 | 1차 멘토링 | 주제, 기획, 방향성 피드백 |
| 2026-07-16 | 수행일지 제출 | 1주차 진행 상황 정리 |
| 2026-07-24 | 수행일지 제출 | 2주차 진행 상황 정리 |
| 2026-07-25 | 2차 멘토링 | 설계, 기능 범위, 구현 방향 피드백 |
| 2026-07-31 | 수행일지 제출 | 3주차 진행 상황 정리 |
| 2026-08-07 | 수행일지 제출 | 4주차 진행 상황 정리 |
| 2026-08-08 | 3차 멘토링 | 완성도, 발표, 시연 흐름 피드백 |
| 2026-08-14 | 수행일지 제출 | 5주차 진행 상황 정리 |
| 2026-08-21 | 수행일지 제출 | 최종 진행 상황 정리 |
| 미정 | 최종 발표 | 발표 자료, 시연 영상, 질의응답 |

## 기술 스택

아직 확정되지 않은 항목은 `TBD`로 둡니다.

| 영역 | 기술 |
| --- | --- |
| Frontend | TBD |
| Backend | TBD |
| Database | TBD |
| Auth | TBD |
| Infra / Deploy | TBD |
| Collaboration | GitHub, Notion, Google Drive |

## 시스템 구조

```text
사용자
  |
  v
Frontend
  |
  v
Backend API
  |
  v
Database
```

상세 아키텍처는 `docs/architecture/` 또는 Notion 설계 문서에 정리합니다.

## 디렉터리 구조

```text
.
├── frontend/              # 프론트엔드 애플리케이션
├── backend/               # 백엔드 애플리케이션
├── docs/                  # GitHub에 남길 기술 문서
│   ├── api/               # API 명세
│   ├── architecture/      # 시스템 설계
│   ├── db/                # ERD, 테이블 설계
│   └── weekly/            # 수행일지 백업
├── infra/                 # 배포, Docker, CI/CD 설정
├── scripts/               # 개발 보조 스크립트
├── .github/               # Issue, PR 템플릿
├── .env.example           # 환경변수 예시
├── .gitignore
└── README.md
```

## 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/KB-PJT-CLASS22-TEAM4/PROJECT-A.git
cd PROJECT-A
```

### 2. 환경변수 설정

`.env.example` 파일을 참고해 각자 로컬 환경에 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

실제 `.env` 파일은 GitHub에 커밋하지 않습니다.

### 3. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

### 4. Backend 실행

```bash
cd backend
# 프로젝트 기술 스택 확정 후 실행 명령어 작성
```

## 협업 규칙

### 브랜치 전략

```text
main                  최종 제출 및 발표 가능한 안정 버전
develop               개발 통합 브랜치
feature/#이슈번호-내용  기능 개발
fix/#이슈번호-내용      버그 수정
docs/#이슈번호-내용     문서 수정
```

예시:

```text
feature/#12-login-api
fix/#25-token-refresh
docs/#30-readme-update
```

### 작업 흐름

1. GitHub Issue를 생성합니다.
2. Issue 번호를 포함해 브랜치를 생성합니다.
3. 작업 후 Pull Request를 생성합니다.
4. 최소 1명 이상 코드 리뷰를 받습니다.
5. 리뷰 반영 후 `develop` 브랜치에 병합합니다.
6. 멘토링, 수행일지, 최종 제출 전에는 `main`에 안정 버전을 병합합니다.

### 커밋 메시지

```text
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가 또는 수정
chore: 설정, 빌드, 기타 작업
```

예시:

```text
feat(auth): 로그인 API 추가
fix(frontend): 회원가입 유효성 검사 오류 수정
docs(api): 인증 API 명세 업데이트
```

### Pull Request 체크리스트

- [ ] 연결된 Issue가 있습니다.
- [ ] 로컬에서 실행 확인했습니다.
- [ ] 빌드 또는 테스트를 통과했습니다.
- [ ] UI 변경 시 스크린샷을 첨부했습니다.
- [ ] API 변경 시 문서를 수정했습니다.
- [ ] 민감정보가 포함되지 않았습니다.

## 문서 및 자료 관리

| 도구 | 사용 목적 |
| --- | --- |
| GitHub | 소스코드, Issue, PR, 기술 문서, 변경 이력 |
| Notion | 일정, 회의록, 역할 분담, 멘토링 기록, 의사결정 기록 |
| Google Drive | 발표자료, 시연영상, 이미지, PDF, 최종 제출 파일 |

GitHub에는 대용량 파일을 올리지 않습니다. 발표 영상, PPT, 디자인 원본, 참고 PDF, 회의 녹화는 Google Drive에 저장하고 Notion에 링크를 연결합니다.

## 보안 규칙

다음 항목은 GitHub, Notion, Google Drive에 공개적으로 업로드하지 않습니다.

- 실제 `.env` 파일
- DB 비밀번호
- JWT secret
- API key
- 클라우드 접근 키
- 개인정보가 포함된 실제 데이터
- 실제 금융 정보 또는 계좌 정보

환경변수가 필요한 경우 `.env.example`에 키 이름만 작성합니다.

```env
DATABASE_URL=
JWT_SECRET=
API_BASE_URL=
```

## 산출물

| 산출물 | 위치 | 상태 |
| --- | --- | --- |
| 요구사항 정의서 | Notion / Google Drive | 작성 전 |
| 화면 설계서 | Notion / Google Drive | 작성 전 |
| ERD | docs/db 또는 Google Drive | 작성 전 |
| API 명세 | docs/api 또는 Notion | 작성 전 |
| 수행일지 | Notion / docs/weekly | 작성 전 |
| 발표자료 | Google Drive | 작성 전 |
| 시연영상 | Google Drive | 작성 전 |

## 주요 링크

| 구분 | 링크 |
| --- | --- |
| Notion | 링크 추가 |
| Google Drive | 링크 추가 |
| 배포 URL | 링크 추가 |
| API 문서 | 링크 추가 |

## 라이선스

본 프로젝트는 교육 목적의 팀 프로젝트입니다.
