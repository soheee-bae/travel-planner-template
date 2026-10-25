# travel-planner

여행 일정을 같이 짜는 웹앱입니다. 클론한 뒤에는 본인 Supabase 프로젝트를 만들고 아래 순서대로 연결합니다.

이 저장소에는 `.env.local`, 데이터베이스 비밀번호, API 키가 포함되어 있지 않습니다. 로그인도 없습니다. 공개 키로 해당 프로젝트의 데이터를 읽고 쓰므로, 프로젝트는 사용자마다 따로 만듭니다.

## 준비

- [Node.js 22](https://nodejs.org/) 이상 (`.nvmrc`와 같습니다)
- pnpm 11
- [Supabase](https://supabase.com) 계정

Node.js 22에는 Corepack이 포함되어 있습니다.

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

## 1. 클론

```bash
git clone https://github.com/soheee-bae/travel-planner.git
cd travel-planner
pnpm install
```

## 2. Supabase 프로젝트

1. [Dashboard](https://supabase.com/dashboard)에서 **New project**를 선택합니다.
2. 이름, 리전, **Database password**를 입력합니다. 이 비밀번호는 스키마를 적용할 때 다시 사용합니다. 분실한 경우 **Project Settings → Database**에서 재설정합니다.
3. 프로젝트 준비가 끝나면 **Project Settings → API Keys**에서 아래 값을 복사합니다.

| 값 | 설명 |
| --- | --- |
| Project URL | `https://<project-ref>.supabase.co` 입니다. `/rest/v1/`는 포함하지 않습니다. |
| publishable 또는 anon 키 | `sb_publishable_...` 또는 `eyJ...` 입니다. |

`<project-ref>`는 URL의 서브도메인입니다. `https://abcdefgh.supabase.co`이면 `abcdefgh`입니다.

secret 키와 service role 키는 사용하지 않습니다. 브라우저에 포함되면 안 됩니다.

## 3. `.env.local`

프로젝트 루트에서 예제 파일을 복사한 뒤, 위에서 복사한 값으로 채웁니다.

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable 또는 anon 키>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_MSW=false

NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=travel-planner/0.1 (you@your-domain.com)
```

`NEXT_PUBLIC_ENABLE_MSW`는 `false`로 둡니다. `true`이거나 URL이 비어 있으면 목 데이터가 표시됩니다.

`NOMINATIM_USER_AGENT`의 메일 주소는 본인 주소로 바꿉니다. `example.com`이 포함되면 날씨 지오코딩이 거절될 수 있습니다.

`.env.local`은 Git에 커밋하지 않습니다.

## 4. 스키마 적용

빈 프로젝트에 올릴 파일은 `supabase/migrations/20261025150000_init.sql` 하나입니다. 여행, 일정, 장소, 영수증, 체크리스트, 메모, 타임캡슐, 동행 이름 테이블을 만들고 anon 키로 읽고 쓸 수 있게 합니다. 여행 데이터는 넣지 않습니다.

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
pnpm db:push
```

`login`은 브라우저에서 Supabase 로그인을 진행합니다. `link`와 `db:push`는 2번에서 저장한 데이터베이스 비밀번호를 입력받습니다.

CLI 대신 Dashboard를 쓰는 경우, **SQL Editor**에서 `supabase/migrations/20261025150000_init.sql` 전체를 붙여 넣고 한 번 실행합니다. 이미 적용한 프로젝트에서 다시 실행하면 테이블이 있다는 오류가 납니다.

`pnpm db:seed`와 `supabase/seed.sql`은 로컬 Docker 데이터베이스용입니다. 클라우드 프로젝트에는 사용하지 않습니다.

## 5. 실행

```bash
pnpm dev
```

http://localhost:3000 을 엽니다. `.env.local`을 수정한 뒤에는 개발 서버를 다시 시작합니다. `NEXT_PUBLIC_` 값은 서버 시작 시 읽습니다.

연결이 완료된 빈 데이터베이스는 여행 목록이 비어 있습니다. **여행 추가**에서 이름, 여행지, 날짜를 입력합니다. **동행 이름**에는 `Alex, Sam`처럼 쉼표로 구분해 입력한 뒤 **여행 만들기**를 누릅니다. 이 이름은 스플래시, 결제자, 정산에 사용됩니다.

여행을 만들기 전에 샘플 여행이 보이면 URL이 비어 있거나 `NEXT_PUBLIC_ENABLE_MSW=true`인 상태입니다. `.env.local`을 확인한 뒤 서버를 다시 시작합니다.

여행이 하나이면 그 여행 화면으로 바로 이동합니다.

## 네이버 지도

선택 사항입니다. 키가 없으면 임시 지도를 사용합니다.

네이버 지도를 사용하려면 [네이버 클라우드 플랫폼](https://www.ncloud.com/)에서 Dynamic Map 키를 발급한 뒤 `.env.local`에 추가합니다.

```bash
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
NAVER_MAP_CLIENT_SECRET=
```

콘솔에서 `http://localhost:3000`을 허용한 다음 `pnpm dev`를 다시 시작합니다. 자동차 경로는 Client Secret이 있어야 동작합니다.
