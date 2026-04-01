'use server';

import { createPocketBase, getAdminPocketBase } from '@/lib/pocketbase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ClientResponseError } from 'pocketbase';
import { z } from 'zod';

function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'digest' in error &&
    typeof error.digest === 'string' &&
    error.digest.startsWith('NEXT_REDIRECT')
  );
}

const loginSchema = z.object({
  email: z.email('Email is invalid').trim(),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.email('Email is invalid').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormState = {
  error?: string;
  success?: boolean;
};

export type SignupFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function loginAction(
  prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const startTime = Date.now();
  const email = formData.get('email')?.toString();

  console.log('[loginAction] Starting login attempt', { email });

  try {
    const result = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!result.success) {
      console.warn('[loginAction] Validation failed', {
        email,
        errors: result.error.issues,
      });
      return {
        error: result.error.issues[0]?.message || 'Invalid input',
      };
    }

    const { email: validatedEmail, password } = result.data;
    console.log('[loginAction] Input validated, authenticating', {
      email: validatedEmail,
    });

    const pb = createPocketBase();

    const authData = await pb
      .collection('users')
      .authWithPassword(validatedEmail, password);

    console.log('[loginAction] Authentication successful', {
      email: validatedEmail,
      userId: authData.record.id,
    });

    const cookieStore = await cookies();
    const isSecure = process.env.NODE_ENV === 'production';

    const cookieAuthData = {
      token: pb.authStore.token,
      model: pb.authStore.model,
    };
    const cookieValue = JSON.stringify(cookieAuthData);

    console.log('[loginAction] Auth store serialized', {
      email: validatedEmail,
      hasToken: !!pb.authStore.token,
      hasRecord: !!pb.authStore.record,
      cookieLength: cookieValue.length,
    });

    cookieStore.set('pb_auth', cookieValue, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 * 2, // 14 days
    });

    console.log('[loginAction] Auth cookie set, redirecting to home', {
      email: validatedEmail,
      duration: Date.now() - startTime,
    });

    redirect('/home');
  } catch (error) {
    if (isRedirectError(error)) {
      console.log('[loginAction] Redirecting to home', {
        email,
        duration: Date.now() - startTime,
      });
      throw error;
    }

    if (error instanceof ClientResponseError) {
      console.error('[loginAction] PocketBase authentication error', {
        email,
        status: error.status,
        message: error.message,
        duration: Date.now() - startTime,
      });

      if (error.status === 400) {
        return {
          error: 'Wrong email or password',
        };
      }
      if (error.status === 403) {
        return {
          error: 'You have not verified your email yet!',
        };
      }
    }

    console.error('[loginAction] Unexpected error', {
      email,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });

    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}

export async function signupAction(
  prevState: SignupFormState | undefined,
  formData: FormData
): Promise<SignupFormState> {
  const startTime = Date.now();
  const email = formData.get('email')?.toString();

  console.log('[signupAction] Starting signup attempt', { email });

  try {
    const result = signupSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirm_password: formData.get('confirm_password'),
    });

    if (!result.success) {
      console.warn('[signupAction] Validation failed', {
        email,
        errors: result.error.issues,
      });
      return {
        error: result.error.issues[0]?.message || 'Invalid input',
      };
    }

    const { email: validatedEmail, password, confirm_password } = result.data;

    if (password !== confirm_password) {
      console.warn('[signupAction] Passwords do not match', {
        email: validatedEmail,
      });
      return {
        error: 'Passwords do not match!',
      };
    }

    console.log('[signupAction] Input validated, creating user account', {
      email: validatedEmail,
    });

    // Use admin instance to create user (matches Astro pattern)
    const adminPb = await getAdminPocketBase();
    const pb = createPocketBase();

    const userRecord = await adminPb.collection('users').create({
      username: validatedEmail.split('@')[0],
      email: validatedEmail,
      password,
      passwordConfirm: confirm_password,
    });

    console.log('[signupAction] User account created', {
      email: validatedEmail,
      userId: userRecord.id,
    });

    // Request verification using regular instance
    await pb.collection('users').requestVerification(validatedEmail);

    console.log('[signupAction] Verification email sent', {
      email: validatedEmail,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      message: 'Please check your email for a verification link!',
    };
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error('[signupAction] PocketBase error', {
        email,
        status: error.status,
        message: error.message,
        duration: Date.now() - startTime,
      });

      if (
        error.status === 400 &&
        error.data?.data?.email?.code === 'validation_not_unique'
      ) {
        return {
          error: 'Email already in use',
        };
      }
      return {
        error: error.message || 'Something went wrong',
      };
    }

    console.error('[signupAction] Unexpected error', {
      email,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });

    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}

export async function logoutAction() {
  console.log('[logoutAction] Starting logout');
  try {
    const cookieStore = await cookies();
    cookieStore.delete('pb_auth');
    console.log('[logoutAction] Auth cookie deleted, redirecting to login');
    redirect('/login');
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('[logoutAction] Unexpected error during logout', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
