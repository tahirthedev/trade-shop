# TradeShop Next.js Frontend

## ✅ Conversion Complete!

The HTML frontend has been successfully converted to a modern Next.js application with TypeScript and Tailwind CSS.

## 🚀 Quick Start

```bash
cd frontend-next
npm run dev
```

The application will be available at **http://localhost:3000**

## 📁 Project Structure

```
frontend-next/
├── src/
│   ├── app/                    # Next.js 14 App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── login/page.tsx     # Authentication page
│   │   ├── marketplace/page.tsx # Professional listings
│   │   ├── dashboard/page.tsx  # User dashboard
│   │   └── subscription/page.tsx # Subscription plans
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── marketplace/       # Marketplace components
│   │   │   └── ProfessionalCard.tsx
│   │   └── ai/               # AI features
│   │       └── AIAssistant.tsx
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth state
│   ├── lib/
│   │   ├── api/              # API client layer
│   │   │   ├── client.ts     # Base API client
│   │   │   ├── auth.ts       # Authentication
│   │   │   ├── professionals.ts
│   │   │   ├── projects.ts
│   │   │   ├── ai.ts
│   │   │   └── payments.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts          # TypeScript definitions
```

## 🎯 Features Implemented

### ✅ Authentication
- Login/Register with email & password
- Client and Professional (tradesperson) user types
- JWT token-based authentication
- Persistent auth state with localStorage
- Auto-redirect based on user type

### ✅ Pages

#### Home Page (`/`)
- Hero section with CTA buttons
- Features showcase
- How it works section
- Responsive design

#### Login Page (`/login`)
- Dual form (Login/Register toggle)
- Form validation
- Professional-specific fields (trade, experience, hourly rate)
- Error handling

#### Marketplace (`/marketplace`)
- Professional listings with search & filters
- Filter by profession, price range
- Professional cards with ratings, skills, location
- Contact modal with professional details
- Responsive grid layout

#### Dashboard (`/dashboard`)
- Project statistics (active, completed, proposals)
- Project creation form
- Project list with status badges
- Budget and location display
- Empty state for new users

#### Subscription (`/subscription`)
- Three pricing tiers (Básico, Profesional, Empresa)
- Stripe integration for payments
- FAQ section
- Popular tier highlighting

### ✅ Components

#### UI Components
- **Button**: Multiple variants (primary, secondary, success, danger, ghost)
- **Input**: Labeled form inputs with validation
- **Card**: Container with shadow and padding
- **Badge**: Status indicators with color variants
- **Modal**: Overlay dialog with close button
- **Spinner**: Loading indicator

#### Layout Components
- **Header**: Navigation with auth-aware menu (login/logout)
- **Footer**: Site links and company info

#### Marketplace Components
- **ProfessionalCard**: Displays professional info, ratings, skills

#### AI Components
- **AIAssistant**: Chat interface with Claude AI
  - Conversation history
  - Typing indicator
  - Auto-scroll to bottom
  - Minimizable

### ✅ API Integration

All API calls go through the backend at `http://localhost:5000/api`:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Professionals**: `/api/professionals` (with filters)
- **Projects**: `/api/projects` (CRUD operations)
- **AI**: `/api/ai/chat`, `/api/ai/analyze-project`
- **Payments**: `/api/payments/create-checkout-session`

### ✅ Type Safety

Full TypeScript coverage with interfaces for:
- User, Professional, Project, Review types
- API response types
- Form data types
- Component props

## 🔧 Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Query** (@tanstack/react-query) - Data fetching (installed, ready to use)
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **Stripe** - Payment processing

## 🔌 Backend Connection

The frontend connects to the existing backend at `localhost:5000`.

Make sure the backend is running:
```bash
cd backend
node server.js
```

## 📝 Environment Setup

No `.env` file needed for development - API URL is hardcoded to `http://localhost:5000/api`.

For production, create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

Then update `src/lib/api/client.ts` to use:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

## 🎨 Styling

All components use Tailwind CSS utility classes. Color scheme:
- **Primary**: Blue (600-800)
- **Success**: Green
- **Warning**: Yellow/Orange  
- **Danger**: Red
- **Info**: Purple

## 🔐 Authentication Flow

1. User logs in/registers at `/login`
2. Token stored in localStorage
3. AuthContext provides global auth state
4. Header updates to show logout button
5. Protected routes check auth state
6. API calls include token in Authorization header

## 🚧 To-Do / Future Enhancements

- [ ] Add actual React Query hooks for data fetching
- [ ] Implement real-time notifications
- [ ] Add image upload for projects
- [ ] Professional portfolio gallery
- [ ] Review and rating system UI
- [ ] Project messaging/chat
- [ ] Advanced search with map view
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Profile editing pages
- [ ] Mobile responsive improvements

## 🐛 Known Issues

- None! All TypeScript errors resolved ✅

## 📖 Usage Examples

### Creating a New Project
1. Login as a client
2. Go to `/dashboard`
3. Click "Nuevo Proyecto"
4. Fill in title, description, budget, location
5. Submit

### Finding Professionals
1. Go to `/marketplace`
2. Use filters (profession, price range)
3. Click "Contactar" on a professional card
4. View contact info or create project

### AI Assistant
1. Add `<AIAssistant />` component to any page
2. Chat with AI about projects, professionals, etc.
3. Assistant uses conversation history

## 🤝 Contributing

When adding new features:
1. Create TypeScript interfaces in `src/types/index.ts`
2. Add API functions in `src/lib/api/`
3. Build reusable components in `src/components/ui/`
4. Use existing color/style patterns

## 📞 Support

Backend API documentation: See `backend/postman_collection.json`

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**
