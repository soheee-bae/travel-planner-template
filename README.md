# travel-planner

여행 일정을 같이 짜는 웹앱입니다. 이 저장소에는 데이터베이스 비밀번호와 API 키가 없습니다. 각자 빈 Supabase 프로젝트를 만들고 아래 순서대로 연결합니다.

로그인은 없습니다. 공개 키로 본인 프로젝트의 데이터를 읽고 씁니다.

## 준비

- [Node.js 22](https://nodejs.org/) 이상 (`.nvmrc`와 같습니다)
- pnpm 11
- [Supabase](https://supabase.com) 계정

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

## 1. 클론

```bash
git clone https://github.com/soheee-bae/travel-planner-template.git
cd travel-planner-template
pnpm install
```

## 2. 빈 Supabase 프로젝트

1. [Dashboard](https://supabase.com/dashboard)에서 **New project**를 만듭니다.
2. 이름, 리전, **Database password**를 입력합니다. 이 비밀번호는 5번에서 다시 씁니다.
3. 프로젝트가 준비되면 **Project Settings → API Keys**에서 두 값을 복사합니다.

| 복사할 값 | 예시 | 넣지 않을 것 |
| --- | --- | --- |
| Project URL | `https://abcdefgh.supabase.co` | 주소 끝의 `/rest/v1/` |
| publishable 또는 anon 키 | `sb_publishable_...` 또는 `eyJ...` | secret 키, service role 키 |

`<project-ref>`는 URL의 서브도메인입니다. 위 예시에서는 `abcdefgh`입니다.

## 3. `.env.local`

프로젝트 폴더에서 예제 파일을 복사하고, 2번에서 복사한 값으로 바꿉니다.

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_MSW=false

NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=travel-planner/0.1 (you@your-domain.com)
```

`NEXT_PUBLIC_ENABLE_MSW`는 `false`입니다. `true`이거나 URL이 비어 있으면 이 저장소의 목 데이터가 나옵니다.

`NOMINATIM_USER_AGENT`의 메일 주소는 본인 주소로 바꿉니다. `example.com`이 들어가면 날씨 검색이 거절될 수 있습니다.

`.env.local`은 Git에 커밋하지 않습니다.

## 4. 데이터베이스에 `init.sql` 적용

빈 프로젝트에는 `supabase/migrations/20261025150000_init.sql`만 한 번 적용합니다.

이 파일이 하는 일은 두 가지입니다.

- 테이블을 만듭니다. 여행, 숙소, 교통, 장소, 영수증, 체크리스트, 메모, 시크릿 노트, 동행 이름입니다.
- 샘플 여행 한 개를 넣습니다. 제목은 `여행`, 날짜는 `2026-11-06`부터 `2026-11-08`까지(2박 3일)입니다. 숙소, 교통, 장소, 영수증, 체크리스트, 메모, 동행 이름, 시크릿 노트 3개도 같이 들어갑니다.

`supabase/seed.sql`은 이 단계에서 사용하지 않습니다. 클라우드 SQL Editor에 붙여 넣지 않습니다.

아래 둘 중 하나만 합니다.

### 방법 A. SQL Editor

1. Dashboard에서 방금 만든 프로젝트를 엽니다.
2. **SQL Editor**에 `init.sql` 전체를 붙여 넣고 실행합니다.
3. 성공하면 다시 실행하지 않습니다. 다시 실행하면 테이블이 이미 있다는 오류가 납니다.

### 방법 B. CLI

`<project-ref>`는 2번의 본인 프로젝트 ref입니다.

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
pnpm db:push
```

`login`은 브라우저에서 Supabase에 로그인합니다. `link`와 `db:push`는 2번의 데이터베이스 비밀번호를 묻습니다.

`pnpm db:setup`은 이 저장소를 개발할 때 쓰던 특정 프로젝트로 연결합니다. 본인 프로젝트에는 사용하지 않습니다.

## 5. 들어갔는지 확인

Dashboard에서 같은 프로젝트의 **Table Editor**를 엽니다. 왼쪽 위 스키마는 `public`입니다.

`trips`에 `여행` 한 행이 있으면 적용된 것입니다. `accommodations`, `transports`, `places`, `expenses`, `time_capsules`에도 샘플 행이 있습니다.

문구와 날짜는 Table Editor에서 고칩니다. `trips`의 `start_date`와 `end_date`가 몇 박 며칠과 Day 탭을 정합니다.

## 6. 앱 실행

```bash
pnpm dev
```

http://localhost:3000 을 엽니다. 샘플 여행 화면으로 바로 이동합니다.

`.env.local`을 수정한 뒤에는 개발 서버를 다시 시작합니다. `NEXT_PUBLIC_` 값은 서버를 켤 때 읽습니다.

## 자주 막히는 경우

- Table Editor가 비어 있습니다. Dashboard에서 연 프로젝트가 2번에서 만든 프로젝트인지 확인합니다. 다른 프로젝트를 보고 있으면 테이블이 없습니다.
- CLI는 최신이라고 하는데 Table Editor에는 테이블이 없습니다. 마이그레이션 기록만 남아 있고 테이블이 지워진 상태입니다. 본인 프로젝트에 `link`한 뒤 아래를 실행합니다.

```bash
pnpm exec supabase migration repair --status reverted 20261025150000
pnpm db:push
```

- 화면에 제주도나 나고야 여행이 보입니다. `.env.local`의 URL이 비어 있거나 `NEXT_PUBLIC_ENABLE_MSW=true`입니다. 3번을 확인한 뒤 `pnpm dev`를 다시 시작합니다.
- `init.sql`을 두 번 실행해서 오류가 납니다. 이미 적용된 것입니다. 5번처럼 `trips` 행만 확인하면 됩니다.

## 로컬 Docker에서만 쓰는 `seed.sql`

클라우드에는 필요 없습니다. 로컬 Supabase를 띄운 뒤 샘플을 다시 만들고 싶을 때만 사용합니다.

```bash
pnpm db:seed
```

이 명령은 로컬 데이터베이스를 지우고 `init.sql`을 다시 적용합니다. `seed.sql`은 로컬 로그인 사용자만 추가합니다. `pnpm db:push`에는 포함되지 않습니다.

## 날씨

홈의 날씨 카드는 테이블에 저장된 값이 아닙니다. `trips.destination_city`로 오늘 날씨를 가져옵니다.

샘플 여행의 도시는 `여행지`입니다. 이 이름은 장소로 검색되지 않아서 카드에 "오늘 날씨를 못 가져왔어"가 나옵니다. Table Editor에서 `destination_city`를 `서울`, `제주`처럼 실제 도시 이름으로 바꿉니다.

앱은 그 이름으로 좌표를 찾은 뒤 오늘 기온, 최저, 최고, 날씨 상태를 표시합니다. 날씨 API 키는 없습니다. 좌표 검색은 3번의 `NOMINATIM_BASE_URL`과 `NOMINATIM_USER_AGENT`를 사용합니다. `.env.local`을 고친 뒤에는 `pnpm dev`를 다시 시작합니다.

## 네이버 지도

선택 사항입니다. 키가 없으면 임시 지도를 사용합니다.

[네이버 클라우드 플랫폼](https://www.ncloud.com/)에서 Dynamic Map 키를 발급한 뒤 `.env.local`에 추가합니다.

```bash
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
NAVER_MAP_CLIENT_SECRET=
```

콘솔에서 `http://localhost:3000`을 허용한 다음 `pnpm dev`를 다시 시작합니다. 자동차 경로는 Client Secret이 있어야 동작합니다.
