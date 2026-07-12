'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { resetPasswordAction } from '@/lib/actions/auth';
import { z } from 'zod';
import { useRouter } from '@/lib/i18n/routing';
import { useLocale } from 'next-intl';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import zxcvbn from 'zxcvbn';

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isInvalidLink, setIsInvalidLink] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'invalid_token' || err === 'expired') {
      setIsInvalidLink(true);
      setError('This password reset link has expired or is invalid.');
    } else if (err) {
      setIsInvalidLink(true);
      setError('An error occurred during authentication.');
    }
  }, []);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema)
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password', '');
  const passwordScore = password ? zxcvbn(password).score : 0;
  const scoreColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

  const onSubmit = async (data: ResetPasswordForm) => {
    setError(null);
    setSuccess(null);
    const result = await resetPasswordAction(data, locale);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess('Password reset successfully.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-charcoal">Success</h2>
        <p className="mt-2 text-sm text-green-600">{success}</p>
        <p className="mt-2 text-sm text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  if (isInvalidLink) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-charcoal">Invalid Link</h2>
        <p className="mt-2 text-sm text-gray-600">{error}</p>
        <div className="mt-6">
          <button
            onClick={() => router.push('/forgot-password')}
            className="group relative flex w-full justify-center rounded-md bg-charcoal px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-charcoal">
        Set new password
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Please enter your new password below.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 relative">
            New Password
            <div className="relative mt-1">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
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
            Confirm New Password
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
            className="group relative flex w-full justify-center rounded-md bg-charcoal px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
