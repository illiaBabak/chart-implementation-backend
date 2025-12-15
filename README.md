# 📊 Chart Implementation Backend

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

**Backend pet project for learning Express, pdfmake, and Jest through PDF chart generation.**

</div>

---

## 📖 About

**Goal of the project** – to practice and learn:

- **Express.js** – REST API, middleware, CORS
- **pdfmake** – dynamic PDFs with charts and custom fonts
- **Jest + Supertest** – endpoint and API testing
- **MySQL + Supabase** – user data, PDF storage, and metadata
- **Ollama** – AI‑powered translation and short chart analysis

The API generates PDF documents with user‑based charts and can create both single PDFs and ZIP archives with multiple files.

---

## ✨ Main Features

- **PDF charts**: pie / bar / both for different user fields  
  (`age`, `gender`, `workplace`, `industry`, `location`, `birth_date`)
- **Multi‑language support** (via Ollama):
  - 🇺🇸 English, 🇺🇦 Ukrainian, 🇪🇸 Spanish, 🇫🇷 French, 🇩🇪 German
  - 🇮🇹 Italian, 🇵🇹 Portuguese, 🇨🇳 Chinese, 🇯🇵 Japanese, 🇰🇷 Korean
- **AI analysis**: one‑sentence text insight based on chart data
- **ZIP archives**: generate a set of PDFs for multiple categories
- **Supabase integration**: store PDFs in `documents` bucket + `charts` table with versions and statuses

---

## 🛠 Tech Stack (Short)

- **Backend**: Express.js + TypeScript
- **PDF & Charts**: pdfmake, custom Noto fonts, custom SVG and bar chart generators
- **Data**: MySQL (via `mysql2`), Supabase (`charts` + storage)
- **AI**: Ollama (`llama3`) for translation and analysis
- **Tests**: Jest, Supertest

---

## 🚀 Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Create `.env`**

```env
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

SUPABASE_KEY=your_supabase_anon_key
PORT=3001
```

3. **Prepare infrastructure**

- MySQL: `users` table with user data
- Supabase: `charts` table + `documents` bucket
- Running **Ollama** instance with model `llama3`

4. **Run dev server**

```bash
npm start
```

Server: **http://localhost:3001**

---

## 📡 API Overview

- **`GET /api/users`** – returns all users from MySQL
- **`POST /api/pdf/generate-document`** – single PDF with charts for selected `chartType`
- **`POST /api/pdf/generate-archive`** – ZIP with PDFs for multiple categories  
  (`pie` / `bar` / `both`, with selected language)
- **`GET /api/pdf/get-documents`** – list of generated documents by `chartType`
- **`GET /api/pdf/get-document`** – single record by `key`
- **`DELETE /api/pdf/delete-document`** – delete record + PDF from Supabase

---

## 📁 Project Structure (Short)

```text
src/
  index.ts          // entry point, Express + CORS + routes
  db.ts             // MySQL pool
  routes/
    users.ts        // /api/users
    pdf.ts          // /api/pdf/*
  services/
    userServices.ts       // MySQL access
    supabaseServices.ts   // charts table + storage
    ollamaServices.ts     // translation + analysis
  utils/
    generatePdf.ts        // ChartBuilder based on pdfmake
    generateSVGChart.ts   // pie charts
    generateHorizontalBarChart.ts
    segregateUsers.ts, guards.ts, constants.ts, ...
  types/                  // user, chart, Supabase types
  tests/
    index.test.ts         // Jest + Supertest tests
```

---

## 🎯 What I Practiced Here

- **Express + TypeScript** – typed controllers, middleware, and clean module structure
- **pdfmake** – fonts, SVG charts, tables, and report layouts
- **Jest / Supertest** – API tests and validation of error cases
- **MySQL + Supabase** – combining a classic DB with a BaaS service
- **AI integration** – simple but useful translation and analytics pipeline

---

## 🧪 Tests

```bash
npm test
```

Tests cover the main PDF endpoints and invalid‑input validation.
