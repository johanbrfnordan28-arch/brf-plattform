# BRF Företag

Ljusgrön grundmall för BRF-styrelser — Next.js 15, Tailwind CSS och TypeScript.

## Kom igång

```bash
cd /Users/johancarlsen/projects/brf-plattform
npm install
npm run dev
```

Öppna [http://127.0.0.1:3010](http://127.0.0.1:3010) i webbläsaren (Edge, Safari, m.fl.).

**Skapa förening (kopiera till adressfältet):** `http://127.0.0.1:3010/prova-gratis` — eller dubbelklicka `OPPNA-I-EDGE.command` i projektmappen.

**Äldre länkar** `/skapa-testforening` och `/skapa-testforening/start` går till samma sida.

## Design

| Element | Färg |
|--------|------|
| Bakgrund | `#f4faf6` |
| Primär | `#5a9a6e` |
| Mörk accent | `#3d7354` |

## Innehåll (demo)

- Startsida med hero och sex modulkort
- Sektion upphandlingar med åtta kategorier
- Svenska texter

## Driftsättning (GitHub + Vercel)

Projektet är en vanlig Next.js-app och fungerar direkt på [Vercel](https://vercel.com) utan extra konfiguration.

### Två sätt att komma åt projektet

| Sätt | Vem | Vad ni får |
|------|-----|------------|
| **Publik webbadress** (Vercel) | Testare, intressenter | Besöka sidan i webbläsaren — ingen källkod |
| **GitHub** | Utvecklare som ska bidra | Kloning, kodgranskning, pull requests |

### Steg 1 — GitHub (källkod)

1. Skapa ett **privat** eller **publikt** repo på GitHub (t.ex. `brf-plattform`).
2. I projektmappen:

```bash
git init
git add .
git commit -m "Första version av Styrelseflow-demo"
git branch -M main
git remote add origin https://github.com/ORGANISATION/brf-plattform.git
git push -u origin main
```

3. Bjud in medarbetare under **Settings → Collaborators** (eller via organisation/team).

### Steg 2 — Vercel (publik testmiljö)

1. Logga in på [vercel.com](https://vercel.com) med GitHub-konto.
2. **Add New → Project** → välj `brf-plattform`-repot.
3. Låt standardinställningarna vara (Framework: Next.js, Build: `npm run build`, Output: standard).
4. Klicka **Deploy**. Efter några minuter får ni en URL, t.ex. `https://brf-plattform.vercel.app`.
5. Varje push till `main` kan automatiskt publicera en ny version (kan stängas av under Project Settings).

### Serverlagring (förening + avtal)

1. Kopiera `.env.example` till `.env` (SQLite lokalt).
2. Kör `npm run db:migrate` (eller `npm run db:push`).
3. Starta `npm run dev` — skapa/spara förening och godkänn avtal synkas till databasen via `/api/foreningar`.

**Produktion (Postgres):** byt `provider` i `prisma/schema.prisma` till `postgresql`, sätt `DATABASE_URL` till Neon/Supabase/Vercel Postgres, kör `npx prisma migrate deploy`.

Webbläsaren sparar fortfarande lokalt; servern speglar profil, avtal och konton.
**Inloggning:** e-post + lösenord (skickas vid skapande). Byt/glömt lösenord under `/konto/*`.
**Avtal** signeras med BankID (demo tills riktig e-legitimation).
**Plattformsadmin** (dolt för styrelsen): `/plattform-login` — inloggningshistorik och mejl-outbox.

Tillfälliga adminlösenord skapas vid första inloggning och syns i mejl-outbox om SMTP saknas.

### Viktigt vid test på Vercel

- **Data sparas per webbläsare** — och synkas till servern när databasen är konfigurerad.
- **Juridikmodulen** är gemensam demo-data i alla sessioner (avsiktligt).
- Testa styrelseflödet via `/prova-gratis` eller `/forening` på den publika URL:en.

### Roller (förslag)

- **Repo-ägare** — skapar GitHub-repo, kopplar Vercel, bjuder in utvecklare.
- **Testare** — får bara Vercel-länken.
- **Utvecklare** — får GitHub-åtkomst och kör lokalt med `npm install && npm run dev`.
