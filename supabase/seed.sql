-- 로컬 `supabase db reset` 전용이다. 클라우드 프로젝트에는 실행하지 않는다.
-- 샘플 여행 데이터는 init.sql이 넣는다. 여기에는 로컬 로그인 사용자만 만든다.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'dev@travel-planner.local',
  crypt('devpassword', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
);
