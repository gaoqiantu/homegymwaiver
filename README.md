# Home Gym Waiver App

A bilingual (English/Chinese) waiver signing application built with Next.js 14, Supabase, and Resend.

## Features

- **Bilingual Support**: Toggle between English and Chinese with a single click
- **Digital Signature**: Canvas-based signature capture
- **Audit Trail**: Captures IP address, user agent, and timestamp
- **Email Notifications**: Sends confirmation emails to users and admins
- **Admin Dashboard**: View, search, and export signed waivers
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend
- **Validation**: Zod + React Hook Form
- **Language**: TypeScript

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the following SQL in the Supabase SQL Editor:

```sql
-- Create waivers table
CREATE TABLE waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  language_used TEXT NOT NULL CHECK (language_used IN ('en', 'zh'))
);

-- Enable RLS
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;

-- Policy for service role (bypasses RLS)
CREATE POLICY "Service role can do all" ON waivers
  FOR ALL USING (auth.role() = 'service_role');
```

3. Create a Storage Bucket:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `signatures`
   - Set it to **Public** (so signatures can be displayed)

4. Create an Admin User:
   - Go to Authentication > Users
   - Click "Add user"
   - Enter email and password for your admin account

### 3. Set Up Resend

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. (Optional) Verify your domain for production use

### 4. Configure Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend Email Configuration
RESEND_API_KEY=re_your_api_key

# Admin Configuration (receives notifications)
ADMIN_EMAIL=admin@example.com
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the waiver form.

Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Public signing page
│   ├── providers.tsx           # Client-side providers
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout
│   │   ├── page.tsx            # Dashboard (server component)
│   │   ├── dashboard.tsx       # Dashboard UI (client component)
│   │   └── login/page.tsx      # Admin login
│   └── api/
│       └── auth/callback/route.ts
├── components/
│   ├── ui/                     # Shadcn components
│   ├── waiver-form.tsx         # Main waiver form
│   ├── signature-pad.tsx       # Signature canvas
│   ├── language-toggle.tsx     # EN/ZH toggle
│   ├── legal-text.tsx          # Scrollable legal text
│   └── waiver-details-modal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   ├── translations.ts         # EN/ZH dictionary
│   ├── actions.ts              # Server actions
│   ├── validations.ts          # Zod schemas
│   └── utils.ts
├── hooks/
│   └── use-translation.ts      # Translation hook
├── types/
│   └── index.ts
└── middleware.ts               # Route protection
```

## Usage

### Public Waiver Form

1. Users can toggle language using the button in the top-right corner
2. Fill in personal and emergency contact information
3. Scroll through the legal text (must reach bottom to enable checkbox)
4. Check the agreement checkbox
5. Sign in the signature pad
6. Submit the form

### Admin Dashboard

1. Navigate to `/admin`
2. Log in with your admin credentials
3. View all signed waivers in the table
4. Click "View" to see full details including signature
5. Export all data to CSV using the export button

## Customization

### Legal Text

Edit the `legalText` and `legalTextZh` values in `lib/translations.ts` to update the waiver content.

### Email Templates

Modify the HTML templates in `lib/actions.ts` to customize email appearance.

### Styling

The app uses Tailwind CSS and Shadcn UI. Customize colors and themes in:
- `app/globals.css` for CSS variables
- `tailwind.config.ts` for Tailwind configuration

## License

MIT
