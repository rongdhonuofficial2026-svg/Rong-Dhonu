'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { forgotPasswordAction } from '@/lib/actions/auth';
import { z } from 'zod';
import { Link } from '@/lib/i18n/routing';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const locale = useLocale();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    setSuccess(null);
    const result = await forgotPasswordAction(data, locale);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(result.message || 'Check your email');
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-charcoal">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">{success}</p>
        <div className="mt-6">
          <Link href="/login" className="font-medium text-accent-indigo hover:text-indigo-800">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-charcoal">
        Reset your password
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your email and we will send you a link to reset your password.
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
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-md bg-charcoal px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Send reset link'}
          </button>
        </div>
        
        <div className="text-center text-sm">
          <Link href="/login" className="font-medium text-accent-indigo hover:text-indigo-800">
            Return to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
