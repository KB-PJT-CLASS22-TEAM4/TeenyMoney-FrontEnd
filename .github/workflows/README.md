# GitHub Actions

이 폴더는 프로젝트 자동 검증 workflow를 관리합니다.

초기 프로젝트 단계에서는 Pull Request와 `dev`, `main` 브랜치 push 시 다음 항목만 검사합니다.

## CI 구성

### repo-policy

공통 저장소 규칙을 검사합니다.

- `README.md` 존재 확인
- `.gitignore` 존재 확인
- `.env.example` 존재 확인
- Pull Request 템플릿 존재 확인
- Issue 템플릿 폴더 존재 확인
- 실제 `.env` 파일 커밋 방지

### frontend

`frontend/package.json`이 있을 때만 실행합니다.

- Node.js 22 설정
- `npm ci`
- `npm run build`

## Backend CI 운영 방침

현재 백엔드 테스트는 로컬 MySQL 환경에 의존하는 항목이 포함되어 있어 PR 단계 CI에서는 제외합니다.

백엔드 검증은 다음 시점에 별도 workflow로 추가합니다.

- dev/prod DB 전략 확정
- GitHub Actions MySQL service 또는 AWS dev DB 준비
- 배포 전용 workflow 구성

## Ruleset 연결 기준

초기에는 다음 check만 required check로 설정합니다.

- `repo-policy`
- `frontend`

백엔드 CI가 안정화되면 별도 `backend` 또는 `deploy-main` workflow를 required check로 추가합니다.

## 운영 순서

1. `.github/workflows/ci.yml`을 `dev` 브랜치에 반영합니다.
2. GitHub Actions 탭에서 CI가 한 번 성공하는지 확인합니다.
3. Repository ruleset 또는 branch protection에서 `repo-policy`, `frontend`를 required check로 설정합니다.
4. 백엔드 DB 테스트 전략이 정해지면 backend CI/CD workflow를 추가합니다.
