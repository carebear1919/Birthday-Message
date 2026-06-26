# Scrapbook Birthday Wall

A full-stack web app where friends leave hidden birthday messages (with optional photos) for a celebrant, who later unlocks them with a password and flips through them like a physical scrapbook/journal.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend/DB/Storage:** Supabase (Postgres + Storage)
- **Page-flip:** react-pageflip
- **Fonts:** Inter, Caveat, Patrick Hand, Permanent Marker

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase account (free tier works)

### 2. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret — never expose it to the client)

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run the database migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Open and run the contents of `db-migration.sql`
3. This creates the `birthday_pages` and `messages` tables with RLS policies

### 5. Create the Storage bucket

1. In Supabase dashboard, go to **Storage**
2. Click **Create bucket**
3. Name: `birthday-photos`
4. Make it **public** (uncheck "Limit bucket size if needed")
5. Click **Save**

### 6. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to use

1. **Create a wall:** Go to `/create`, enter the celebrant's name, a link slug, and a secret password
2. **Share the friend link:** `/[slug]` — friends visit this to leave messages and photos
3. **Celebrant unlocks:** Go to `/[slug]/reveal`, enter the password, and flip through the journal

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing / home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + Tailwind theme
│   ├── create/
│   │   └── page.tsx          # Create a birthday wall
│   └── [slug]/
│       ├── page.tsx          # Friend contribution form
│       └── reveal/
│           └── page.tsx      # Password gate + scrapbook notebook
├── lib/
│   └── supabase.ts           # Supabase client (anon + admin)
└── types.ts                  # Shared TypeScript types
```

## Security

- Passwords hashed with bcrypt (never stored in plaintext)
- Messages only readable through password-protected server action
- File uploads validated for type and size on both client and server
- RLS policies prevent public reads on messages table
- Service role key used only server-side for password verification
