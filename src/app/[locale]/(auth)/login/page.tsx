'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations/auth';
import { loginAction } from '@/lib/actions/auth';
import { z } from 'zod';
import { Link, useRouter } from '@/lib/i18n/routing';
import { useLocale } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const result = await loginAction(data, locale);
    if (result.error) {
      setError(result.error);
    } else if (result.redirectTo) {
      router.push(result.redirectTo as any);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-charcoal">
        Sign in to your account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Or{' '}
        <Link href="/register" className="font-medium text-accent-gold hover:text-yellow-600">
          request membership
        </Link>
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Email address
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-accent-indigo sm:text-sm sm:leading-6"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-normal">{errors.email.message}</p>}
          </label>

          <label className="block text-sm font-medium text-gray-700 relative">
            Password
            <div className="relative mt-1">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-accent-indigo sm:text-sm sm:leading-6 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-normal">{errors.password.message}</p>}
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-gray-900 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-accent-indigo focus:ring-accent-indigo mr-2"
            />
            Remember me
          </label>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-accent-indigo hover:text-indigo-800">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-md bg-charcoal px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
