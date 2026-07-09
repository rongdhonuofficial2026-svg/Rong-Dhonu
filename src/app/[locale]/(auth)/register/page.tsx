'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validations/auth';
import { registerAction } from '@/lib/actions/auth';
import { z } from 'zod';
import { Link } from '@/lib/i18n/routing';
import { useLocale } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import zxcvbn from 'zxcvbn';

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const locale = useLocale();
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password', '');
  const passwordScore = password ? zxcvbn(password).score : 0;
  const scoreColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setSuccess(null);
    const result = await registerAction(data, locale);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(result.message || 'Registration successful');
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-charcoal">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">{success}</p>
        <div className="mt-6">
          <Link href="/login" className="font-medium text-accent-indigo hover:text-indigo-800 auth-link-row">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-charcoal">
        Create your account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent-gold hover:text-yellow-600 auth-link-row">
          Sign in
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
            Full Name
            <input
              {...register('fullName')}
              type="text"
              className="mt-1 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-accent-indigo sm:text-sm sm:leading-6"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500 font-normal">{errors.fullName.message}</p>}
          </label>

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
                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-accent-indigo sm:text-sm sm:leading-6 pr-10"
              />
              <button
                type="button"
                className="auth-toggle-password absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex gap-1 h-1.5 w-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-full flex-1 rounded-full ${i < passwordScore ? scoreColors[passwordScore] : 'bg-gray-200'}`} />
                ))}
              </div>
            )}
            {errors.password && <p className="mt-1 text-xs text-red-500 font-normal">{errors.password.message}</p>}
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              className="mt-1 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-accent-indigo sm:text-sm sm:leading-6"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-normal">{errors.confirmPassword.message}</p>}
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-md bg-accent-gold px-3 py-2.5 text-sm font-semibold text-charcoal hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
