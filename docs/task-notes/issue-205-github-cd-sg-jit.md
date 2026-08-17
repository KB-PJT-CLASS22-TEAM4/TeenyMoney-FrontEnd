# Issue #205 — 프론트엔드 CD: Security Group JIT 허용

백엔드 저장소 `TeenyMoney-Backend` Issue #154와 동일한 원인/조치.
상세 진단 근거는 백엔드 쪽 `docs/task-notes/issue-154-github-cd-sg-jit.md` 참고.

## 요약

프론트엔드도 백엔드와 같은 EC2(`52.78.250.231`)에 SSH로 접속해 nginx 경로에 배포한다.
EC2 Security Group 인바운드 22번이 GitHub Actions 러너를 허용하지 않으므로
**아직 배포를 돌린 적이 없어도 동일하게 timeout으로 실패한다.**

백엔드에서 겪은 문제를 미리 막는 선제 조치.

## 조치

### 1. 워크플로 (`.github/workflows/deploy-dev.yml`, +40줄)

백엔드와 동일한 패치.

- `permissions`에 `id-token: write`
- job `env`에 `EC2_SECURITY_GROUP_ID`
- `AWS 인증` 스텝 (`aws-actions/configure-aws-credentials@v4`, OIDC)
- `러너 IP 임시 허용` 스텝 (`id: sg`)
- `러너 IP 허용 회수` 스텝 (`if: always()`)
- `ssh` / `scp` / 정리 스텝 `ssh`에 `-o ConnectTimeout=10`

SG 규칙 설명은 `gha-fe-<run_id>-<attempt>` 로 프론트엔드 배포임을 구분한다
(백엔드는 `gha-<run_id>-<attempt>`).

기존 배포/롤백/백업 로직은 변경 없음.

### 2. AWS — IAM 역할 신뢰 정책 확장

백엔드에서 만든 `github-actions-teenymoney-deploy` 역할을 **공유**한다.
같은 EC2, 같은 SG이므로 권한 정책은 동일하고 역할을 새로 만들 필요가 없다.

단, 신뢰 정책의 `sub` 조건이 백엔드 저장소로 한정되어 있어 프론트엔드를 추가해야 한다:

```json
"token.actions.githubusercontent.com:sub": [
  "repo:KB-PJT-CLASS22-TEAM4/TeenyMoney-Backend:environment:development",
  "repo:KB-PJT-CLASS22-TEAM4/TeenyMoney-FrontEnd:environment:development"
]
```

이걸 빼먹으면 `AWS 인증` 스텝에서 AssumeRole 거부로 실패한다.

### 3. GitHub Environment variables (`development`)

Environment variable은 저장소별로 따로 관리되므로 프론트엔드 저장소에도 등록해야 한다.

| 이름 | 값 |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | 백엔드와 동일한 ARN |
| `EC2_SECURITY_GROUP_ID` | 백엔드와 동일한 `sg-...` |

## 동시 배포에 대하여

`concurrency.group`이 백엔드(`backend-development-deploy`)와
프론트엔드(`frontend-development-deploy`)로 분리되어 있어 두 배포가 동시에 돌 수 있다.

이 경우 SG에 규칙이 2개 추가되지만, 각 워크플로가 **자기가 만든 rule id만** 삭제하므로
서로 간섭하지 않는다. 규칙 설명 접두사(`gha-` / `gha-fe-`)로도 구분된다.

## 검증

- [x] YAML 파싱 정상
- [x] 스텝 순서 확인 — `SSH 설정 → AWS 인증 → IP 허용 → EC2 배포 → SSH 정리 → IP 회수 → 요약`
- [ ] IAM 신뢰 정책에 프론트엔드 저장소 추가
- [ ] 프론트엔드 저장소 Environment variables 2개 등록
- [ ] 실제 `dev` push로 배포 성공 확인
- [ ] 배포 후 SG에 `gha-fe-` 규칙이 남지 않았는지 확인
