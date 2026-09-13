# GitHub Actions

TeenyMoney FrontEnd의 검증과 개발 서버 배포 workflow를 관리합니다.

| 파일 | 이름 | 실행 시점 |
| --- | --- | --- |
| `ci.yml` | CI | `dev`, `main` 대상 Pull Request, `main` push, 수동 실행 |
| `deploy-dev.yml` | Deploy development | `dev` push, `dev` 브랜치 수동 실행 |

## CI (`ci.yml`)

같은 브랜치에서 새 실행이 시작되면 이전 실행은 취소됩니다.

### repo-policy

- `README.md`, `.gitignore`, `.env.example` 존재 확인
- Pull Request 템플릿(비어 있지 않을 것)과 Issue 템플릿 폴더 존재 확인
- 실제 `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test` 커밋 차단

### frontend

`frontend` 디렉터리에서 실행합니다.

- Node.js 22 설정과 npm 캐시
- `npm ci`
- `npm run build`

단위 테스트(`npm test`)는 아직 CI에 포함하지 않았습니다. PR 전에 로컬에서 실행합니다.

### Required Check

Repository ruleset 또는 branch protection에서 `repo-policy`, `frontend`를 필수 check로 지정합니다.

## 개발 서버 배포 (`deploy-dev.yml`)

`dev`에 병합되면 빌드 결과물을 `development` Environment로 배포합니다.

1. `VITE_API_BASE_URL`, `VITE_LOGIN_VIDEO_BASE`를 주입해 `npm ci`, `npm run build`를 실행합니다.
2. `dist/index.html`과 `dist/assets`를 확인하고 압축 파일의 SHA-256 값을 기록합니다.
3. GitHub OIDC로 `AWS_DEPLOY_ROLE_ARN` 역할을 받아 러너 IP를 보안 그룹에 임시로 허용합니다.
4. 압축 파일을 EC2로 보내 Git SHA와 SHA-256 값을 다시 검증하고 staging 디렉터리에 풉니다.
5. 현재 버전을 `/var/backups/teenymoney`에 백업한 뒤 staging을 `/var/www/teenymoney`로 교체하고 `nginx -t`, reload, 공개 URL 확인을 거칩니다.
6. 중간에 실패하면 이전 디렉터리로 자동 복원합니다. 백업은 최근 5개만 남깁니다.
7. 결과와 관계없이 임시 SSH 키, 전송 파일, 보안 그룹 규칙을 정리합니다.

### 필요한 설정

`development` Environment에 다음 값을 등록합니다.

| 종류 | 이름 | 용도 |
| --- | --- | --- |
| Variables | `VITE_API_BASE_URL`, `VITE_LOGIN_VIDEO_BASE` | 빌드 시점 환경변수 |
| Variables | `EC2_HOST`, `EC2_PORT`, `EC2_USER` | SSH 접속 대상 |
| Variables | `EC2_SECURITY_GROUP_ID` | 러너 IP를 임시로 허용할 보안 그룹 |
| Variables | `AWS_DEPLOY_ROLE_ARN` | OIDC로 맡을 배포용 IAM 역할 |
| Secrets | `DEPLOY_SSH_PRIVATE_KEY` | 배포용 SSH 개인 키 |
| Secrets | `EC2_KNOWN_HOSTS` | 호스트 키 검증용 known_hosts |

백엔드 배포는 [TeenyMoney-Backend](https://github.com/KB-PJT-CLASS22-TEAM4/TeenyMoney-Backend) 저장소의 workflow가 따로 담당합니다.
