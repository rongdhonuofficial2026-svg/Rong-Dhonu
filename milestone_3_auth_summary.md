# Milestone 3: Authentication & Security Complete

## 1. Authentication Flow
- **Registration**: Users request membership using the `/register` page. This securely passes to Supabase, which triggers an email confirmation and uses the database trigger `handle_new_user` to automatically initialize the user's Profile in the database as a `member`.
- **Login**: Members sign in securely using `/login` via email and password, validating through Supabase Edge Auth.
- **Password Recovery**: Users request a reset link at `/forgot-password`, which directs them to `/reset-password` upon clicking the secure email token.
- **Logout**: A secure Server Action purges the session.

## 2. Middleware & Protected Routes
A Next.js Edge Middleware (`src/proxy.ts`) orchestrates Authentication, Session Refresh, Authorization (RBAC), and Internationalization simultaneously.

**Protected Routes:**
- `/member/*`: Accessible only to authenticated users (Visitor, Member, Committee, Admin). Unauthorized users are instantly redirected to `/login`.
- `/admin/*`: Accessible only to authenticated users where `profile.role === 'admin'`. Other authenticated users are redirected to `/unauthorized`.

## 3. RBAC Summary
Roles are explicitly controlled via the Postgres ENUM `user_role` and verified in Supabase RLS policies and Next.js middleware.
- **Visitor**: Unauthenticated. Can view public exhibition pages, catalogs, and approved gallery art. No dashboard access.
- **Member**: Authenticated artist. Can submit artwork (Milestone 6), update their own pending submissions, and access `/member/*`.
- **Committee**: Special members assigned to review specific exhibitions. Controlled dynamically via `committee_members`.
- **Admin**: Full platform access. Can manage all settings, users, CMS content, exhibitions, artworks, and catalogs. Bypasses standard RLS restrictions via the custom `is_admin()` SQL function.

## 4. Security Summary
- **Input Validation**: All authentication input (Login, Register, Reset) is securely sanitized and typed using **Zod** schema validations (`src/lib/validations/auth.ts`).
- **Server Actions**: Authentication functions (`src/lib/actions/auth.ts`) are encapsulated within React Server Actions (`'use server'`). Client components never handle API keys or perform direct database auth mutations, preventing XSS-based auth bypass.
- **Password Security**: Strong password requirements (min 8 chars) enforced at both Zod layer and Supabase configuration. `zxcvbn` is implemented to provide visual password strength feedback on registration.
- **RLS verification constraint**: Due to local Docker unavailability, RLS policies were manually verified for syntactical correctness and strict referential alignment but not physically run against an emulator database.

## 5. Files Created
- `src/lib/validations/auth.ts`: Zod validation schemas
- `src/lib/actions/auth.ts`: Auth Server Actions
- `src/app/[locale]/(auth)/layout.tsx`: Auth visual layout
- `src/app/[locale]/(auth)/login/page.tsx`: Secure login page
- `src/app/[locale]/(auth)/register/page.tsx`: Membership request page
- `src/app/[locale]/(auth)/forgot-password/page.tsx`: Password recovery
- `src/app/[locale]/(auth)/reset-password/page.tsx`: Password reset
- `src/app/[locale]/(auth)/unauthorized/page.tsx`: 403 Forbidden page
- `src/proxy.ts`: (Updated) Integrated RBAC Middleware

## 6. Verification Checklist
- ✅ `zod` and `react-hook-form` connected securely
- ✅ Next.js Server Actions used to prevent client side leakage
- ✅ Edge middleware correctly intercepts protected routes
- ✅ `zxcvbn` password strength indicator integrated
- ✅ All forms include inline loading states, error handling, and success messages
- ✅ TypeScript passes strictly
- ✅ ESLint passes
- ✅ Build (`npm run build`) succeeded
