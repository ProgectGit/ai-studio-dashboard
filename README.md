# AI Studio Dashboard

AI Studio Dashboard — це статичний веб-додаток для керування проєктами AI Studio: задачами, прогресом, системами пам'яті, AI-модулями та технологічним стеком.

Додаток використовує:

- HTML
- CSS
- Vanilla JavaScript
- Supabase JS Client
- PostgreSQL через Supabase
- GitHub Pages для хостингу

React, Next.js, Node.js backend, Express, Firebase, авторизація та build step не використовуються.

## Структура Проєкту

```text
index.html       Основна сторінка додатка
style.css        Темна AI Studio тема та адаптивний layout
app.js           Supabase CRUD, стан dashboard, фільтри та прогрес
config.js        Supabase project URL і anon key
manifest.json    PWA manifest
supabase.sql     PostgreSQL schema для Supabase
README.md        Інструкція з налаштування та деплою
```

## Локальний Запуск

Можна відкрити `index.html` прямо у браузері або запустити простий статичний сервер:

```bash
python3 -m http.server 8000
```

Після цього відкрий:

```text
http://localhost:8000
```

## Створення Supabase Project

1. Відкрий Supabase.
2. Створи новий project.
3. Дочекайся, поки база даних буде готова.
4. Відкрий SQL Editor.
5. Встав вміст `supabase.sql`.
6. Запусти SQL script.

## Налаштування Supabase

Відкрий `config.js` і заміни placeholder-значення:

```js
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

Ці значення знаходяться в Supabase:

```text
Project Settings -> API
```

## Таблиці Бази Даних

SQL-файл створює:

- `projects`
- `project_tasks`
- `project_databases`
- `project_ai_modules`
- `project_tech_stack`

Кожна пов'язана таблиця зберігає рядки, прив'язані до проєкту через `project_id`.

## Розрахунок Прогресу

Прогрес проєкту рахується у frontend:

```text
completed_tasks / total_tasks * 100
```

Значення оновлюється після створення задачі, видалення задачі та зміни виконання задачі.

## Деплой На GitHub Pages

1. Створи GitHub repository.
2. Завантаж ці файли в root repository.
3. Зроби commit.
4. Відкрий repository settings.
5. Перейди в Pages.
6. Встанови source на main branch і root folder.
7. Збережи.

GitHub Pages опублікує додаток як статичний сайт.

## Увімкнення GitHub Pages

У GitHub:

```text
Settings -> Pages -> Build and deployment -> Source -> Deploy from a branch
```

Обери:

```text
Branch: main
Folder: /root
```

## MVP Обмеження

У цьому MVP навмисно немає:

- авторизації
- розділення приватних даних користувачів
- server-side API
- build tooling
- offline sync
- завантаження файлів
- realtime collaboration

SQL вмикає public MVP access через Row Level Security policies. Це зручно для тестування та демо на GitHub Pages, але не є приватним режимом.

## Roadmap

- Додати авторизацію та user-owned data.
- Додати пошук проєктів.
- Додати дедлайни задач.
- Додати коментарі до задач.
- Додати realtime updates.
- Додати графіки історії прогресу.
- Додати import/export.
- Додати service worker caching.
- Додати role-based permissions.
