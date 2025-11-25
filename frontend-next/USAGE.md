# Trade Shop - Next.js Frontend

Complete Next.js 14 frontend for the Trade Shop marketplace platform, converted from the original HTML implementation.

## 🚀 Running the Application

### Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:5000`

### Start Development Server
```bash
cd frontend-next
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## 📱 Pages & Routes

### Public Pages
- **`/`** - Home page with hero, features, and CTAs
- **`/login`** - Login/Registration page
- **`/subscription`** - Pricing and subscription plans

### Protected Pages (require authentication)
- **`/marketplace`** - Browse and search professionals
- **`/dashboard`** - User dashboard with project management

## 🔑 Authentication Flow

1. Visit `/login`
2. Register as either:
   - **Client** - To post projects and hire professionals
   - **Tradesperson** - To offer services and bid on projects
3. After registration, you'll be redirected to:
   - Marketplace (for clients)
   - Dashboard (for tradespeople)

### Test Credentials
Use these credentials from the seeded database:

**Clients:**
- Email: `sarah@example.com` / Password: `password123`
- Email: `john@example.com` / Password: `password123`

**Professionals:**
- Email: `miguel@example.com` / Password: `password123` (Electrician)
- Email: `james@example.com` / Password: `password123` (Plumber)
- Email: `david@example.com` / Password: `password123` (HVAC)

## 🎨 Features

### Marketplace
- Search professionals by name or keywords
- Filter by profession (Electrician, Plumber, HVAC, etc.)
- Filter by hourly rate range
- View professional profiles with ratings and reviews
- Contact professionals directly
- **AI Assistant** - Get help finding the right professional

### Dashboard
- View project statistics (active, completed, proposals)
- Create new projects with title, description, budget, location
- Track project status (new, active, completed, cancelled)
- **AI Assistant** - Get help managing projects

### AI Assistant
Available on marketplace and dashboard pages:
- Click the blue bot icon in bottom-right corner
- Ask questions about professionals, projects, or services
- Get AI-powered recommendations
- Contextual help based on your user type (client/tradesperson)

### Subscription Management
- View pricing tiers (Básico/Free, Profesional, Empresa)
- Compare features across plans
- Upgrade via Stripe checkout
- FAQ section

## 🛠️ Tech Stack

- **Framework:** Next.js 14.2+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Data Fetching:** Native fetch with custom API client
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Payments:** Stripe.js

## 📁 Project Structure

```
frontend-next/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Login/Register
│   │   ├── marketplace/       # Browse professionals
│   │   ├── dashboard/         # User dashboard
│   │   └── subscription/      # Pricing plans
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Header, Footer
│   │   ├── marketplace/       # ProfessionalCard
│   │   └── ai/                # AIAssistant
│   ├── context/               # AuthContext
│   ├── lib/
│   │   ├── api/               # API client modules
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript definitions
└── public/                    # Static assets
```

## 🔌 API Integration

All API calls go through `/src/lib/api/client.ts` to:
- Add authentication tokens
- Handle errors consistently
- Type responses with TypeScript

### API Modules
- `auth.ts` - Login, register, profile
- `professionals.ts` - Search, filter, view professionals
- `projects.ts` - CRUD operations for projects
- `ai.ts` - Chat with AI assistant, analyze projects
- `payments.ts` - Stripe checkout sessions

## 🎯 User Flows

### Client Flow
1. Register as client
2. Browse marketplace
3. Search/filter professionals
4. Contact or create project
5. Manage projects in dashboard

### Tradesperson Flow
1. Register as tradesperson (provide trade, experience, rates)
2. View dashboard
3. See available projects
4. Submit proposals
5. Track active projects

## 🔧 Configuration

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend Connection
The app connects to the backend API at `http://localhost:5000/api`

Ensure your backend is running and CORS is configured to allow `http://localhost:3000`

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf .next
npm install
npm run dev
```

### API connection issues
- Verify backend is running on port 5000
- Check CORS configuration in backend
- Ensure MongoDB is running

### Authentication not persisting
- Check browser localStorage
- Clear site data and re-login
- Verify token in localStorage

## 📝 Development Notes

- All client components use `'use client'` directive
- Server components are default (layout, page.tsx without state)
- Auth state persists in localStorage
- API client automatically adds auth tokens
- TypeScript strict mode enabled

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
vercel deploy
```

Set environment variable:
- `NEXT_PUBLIC_API_URL` - Your production API URL

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
