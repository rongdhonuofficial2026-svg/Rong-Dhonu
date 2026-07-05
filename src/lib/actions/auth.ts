 
'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, resetPasswordSchema, forgotPasswordSchema } from '@/lib/validations/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from '@/lib/i18n/routing';

export async function loginAction(data: z.infer<typeof loginSchema>, locale: string) {
  const result = loginSchema.safeParse(data);
  
  if (!result.success) {
    return { error: 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Retrieve user to check/create profile
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    const isOwnerEmail = user.email === 'rongdhonuofficial2026@gmail.com';

    if (!profile) {
      // If profile doesn't exist, create it.
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        role: isOwnerEmail ? 'owner' : 'member',
        full_name_en: user.user_metadata?.full_name || user.email?.split('@')[0]
      });
    } else if (isOwnerEmail && profile.role !== 'owner') {
      // Ensure owner role is assigned if they already have a profile but wrong role
      await supabase.from('profiles').update({ role: 'owner' }).eq('id', user.id);
    }
  }

  revalidatePath('/');
  return { success: true };
}

export async function registerAction(data: z.infer<typeof registerSchema>, locale: string) {
  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Check your email for the verification link.' };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
}

export async function forgotPasswordAction(data: z.infer<typeof forgotPasswordSchema>, locale: string) {
  const result = forgotPasswordSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid email' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email);

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Password reset link sent to your email.' };
}

export async function resetPasswordAction(data: z.infer<typeof resetPasswordSchema>, locale: string) {
  const result = resetPasswordSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getUserRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role || 'member';
}
