# MÜDEK Admin Dashboard - Frontend

Modern, professional admin dashboard built with Next.js 14, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Next.js 14** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - API client
- **Sonner** - Toast notifications
- **Lucide React** - Icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Dashboard homepage
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # shadcn/ui components
│       ├── sidebar.tsx     # Sidebar navigation
│       ├── topbar.tsx      # Top header bar
│       ├── button.tsx      # Button component
│       └── card.tsx        # Card component
├── lib/
│   ├── api/                # API client layer
│   │   ├── apiClient.ts    # Axios instance
│   │   ├── courseApi.ts    # Course API
│   │   ├── examApi.ts      # Exam API
│   │   └── ...             # Other API modules
│   └── utils.ts           # Utility functions
└── package.json
```

## Features

- ✅ Modern sidebar navigation
- ✅ Responsive layout
- ✅ Dark mode support (ready)
- ✅ API service layer
- ✅ Toast notifications
- ✅ Type-safe API calls

## Next Steps

- Create CRUD pages for each module
- Implement forms with React Hook Form
- Connect to backend API
- Add authentication
- Implement data fetching and caching

