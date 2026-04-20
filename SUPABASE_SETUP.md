# Panduan Setup Database Supabase - SMK Prima Unggul

Untuk menjalankan aplikasi ini, Anda perlu menjalankan SQL berikut di **Supabase SQL Editor**:

```sql
-- 1. Tabel Profile (Disinkronkan dengan Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  role text check (role in ('admin', 'guru', 'siswa')) not null default 'siswa',
  nis text,
  kelas text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS pada profiles
alter table public.profiles enable row level security;

-- 3. Tabel Ujian
create table public.exams (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  subject text not null,
  duration integer not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel Soal
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid references public.exams(id) on delete cascade not null,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  points integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel Percobaan Ujian (Attempts)
create table public.exam_attempts (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid references public.exams(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  score numeric,
  status text check (status in ('ongoing', 'submitted')) default 'ongoing'
);

-- 6. Tabel Jawaban Detail (Responses)
create table public.exam_responses (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references public.exam_attempts(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  selected_option text,
  unique(attempt_id, question_id)
);

-- 7. Tabel Presensi (Attendance)
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  time_in text not null,
  status text check (status in ('present', 'late', 'absent', 'excused', 'sick')) not null,
  notes text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, date)
);

-- 8. Trigger Otomatis saat Registrasi (Sync Auth User -> Profile)
-- Jalankan ini di SQL Editor
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'siswa'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policy RLS Dasar (Contoh: Semua bisa baca profile sendiri)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
```

### Konfigurasi Environment Variables
Setelah setup database, masukkan kredensial berikut ke panel **Secrets** di AI Studio:
1. `VITE_SUPABASE_URL`: (Dari Supabase Project Settings > API)
2. `VITE_SUPABASE_ANON_KEY`: (Dari Supabase Project Settings > API)

### Menjadikan Admin Pertama
Daftar secara normal melalui aplikasi, lalu di dashboard Supabase, ubah kolom `role` pada tabel `profiles` menjadi `admin` untuk user Anda tersebut.
