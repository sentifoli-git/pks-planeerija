# PKS Planeerija

Perearsti kvaliteedisüsteemi planeerija – krooniliste patsientide iga-aastase läbivaatuse planeerimine ja jälgimine.

## Funktsioonid

- 📊 **Ülevaade** – Dashboard koos YTD statistikaga
- 👥 **Nimistud** – Kroonikute arvude haldamine nimistu kaupa
- 📅 **Graafik** – Kalendrivaade tööpäevade ja slottidega
- ✏️ **Nädala sisestus** – Päevaste kutsete ja visiitide sisestamine
- ⚙️ **Seaded** – Süsteemi parameetrite seadistamine (ainult admin)
- 📜 **Auditlogi** – Kõikide muudatuste jälgimine

## Rollid

| Roll | Kirjeldus | Õigused |
|------|-----------|---------|
| **Admin** | Süsteemi administraator | Kõik õigused |
| **Õendusjuht** | Nursing lead | Näeb kõiki üksusi, muudab nimistuid |
| **Vastutav õde: Pelgulinn** | Unit lead | Haldab Pelgulinna andmeid |
| **Vastutav õde: Ülemiste** | Unit lead | Haldab Ülemiste andmeid |
| **Kõneliini õde** | Call nurse | Sisestab kutseid (valib üksuse) |

## Paigaldamine

### 1. Eeltingimused

- Node.js 18+
- Supabase konto (või PostgreSQL andmebaas)

### 2. Klooni repo ja installi sõltuvused

```bash
git clone <repo-url>
cd pks-planeerija
npm install
```

### 3. Seadista keskkonnamuutujad

Kopeeri `.env.example` → `.env.local` ja täida:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Rollide paroolid (MUUDA TOOTMISES!)
AUTH_PASSWORD_ADMIN=pks-admin-2026
AUTH_PASSWORD_NURSING_LEAD=pks-nursing-2026
AUTH_PASSWORD_UNIT_LEAD_PELGULINN=pks-pelgulinn-2026
AUTH_PASSWORD_UNIT_LEAD_ULEMISTE=pks-ulemiste-2026
AUTH_PASSWORD_CALL_NURSE=pks-callnurse-2026

# Session
SESSION_SECRET=your-random-32-char-secret-here
```

### 4. Seadista andmebaas

Käivita Supabase SQL Editoris `supabase/schema.sql` fail.

See loob:
- Kõik vajalikud tabelid
- Indeksid
- Audit triggerid
- Algandmed (units, lists, holidays)

### 5. Käivita arendusserver

```bash
npm run dev
```

Ava [http://localhost:3000](http://localhost:3000)

## Vaikimisi paroolid (MUUDA TOOTMISES!)

| Roll | Parool |
|------|--------|
| Admin | `pks-admin-2026` |
| Õendusjuht | `pks-nursing-2026` |
| Vastutav õde: Pelgulinn | `pks-pelgulinn-2026` |
| Vastutav õde: Ülemiste | `pks-ulemiste-2026` |
| Kõneliini õde | `pks-callnurse-2026` |

## Projekti struktuur

```
pks-planeerija/
├── app/
│   ├── (auth)/login/          # Sisselogimine
│   ├── (dashboard)/           # Kaitstud lehed
│   │   ├── overview/          # Ülevaade
│   │   ├── lists/             # Nimistud
│   │   ├── calendar/          # Graafik
│   │   ├── weekly/            # Nädala sisestus
│   │   ├── settings/          # Seaded
│   │   └── audit/             # Auditlogi
│   └── api/                   # API routes
├── components/ui/             # UI komponendid
├── lib/
│   ├── auth.ts               # Autentimine
│   ├── calculations.ts       # Arvutused
│   ├── supabase.ts          # DB klient
│   └── types.ts             # TypeScript tüübid
├── supabase/
│   └── schema.sql           # Andmebaasi schema
├── seed.json                # Algandmed
└── .env.example             # Keskkonnamuutujate näidis
```

## Arvutuste loogika

### Aasta siht
```
yearTarget = chronicTotal × 0.90
```

### Nädala siht
```
weeklyTarget = yearTarget ÷ 45 (nädalat)
```

### Periood
- **Algus:** 01.02.2026
- **Lõpp:** 13.12.2026
- **Nädalaid:** ~45

### MET/NOT_MET kriteerium
Nädal loetakse täidetuks (MET), kui:
- Kutsed ≥ nädala siht-kutsed **JA**
- Visiidid ≥ nädala siht-visiidid

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **Icons:** Lucide React
- **Date handling:** date-fns

## Edasiarendus

### TODO

- [ ] Andmebaasi integratsioon (praegu mock data)
- [ ] PDF raportite eksport
- [ ] Email teavitused
- [ ] Perearst 2 integratsioon
- [ ] Mitme aasta tugi

## Litsents

Privaatne – Perekliinik OÜ © 2026
