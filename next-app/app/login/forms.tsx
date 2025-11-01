'use client';

import { useActionState } from 'react';
import {
  loginAction,
  signupAction,
  type LoginFormState,
  type SignupFormState,
} from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginInitialState: LoginFormState = {};
const signupInitialState: SignupFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, loginInitialState);

  return (
    <form action={formAction} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          name='email'
          type='email'
          placeholder='you@example.com'
          required
          disabled={isPending}
          autoComplete='email'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          name='password'
          type='password'
          placeholder='••••••••'
          required
          disabled={isPending}
          autoComplete='current-password'
        />
      </div>
      {state?.error && (
        <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
          {state.error}
        </div>
      )}
      <Button type='submit' className='w-full' disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, signupInitialState);

  return (
    <form action={formAction} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='signup-email'>Email</Label>
        <Input
          id='signup-email'
          name='email'
          type='email'
          placeholder='you@example.com'
          required
          disabled={isPending}
          autoComplete='email'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='signup-password'>Password</Label>
        <Input
          id='signup-password'
          name='password'
          type='password'
          placeholder='••••••••'
          required
          disabled={isPending}
          autoComplete='new-password'
          minLength={8}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='confirm-password'>Confirm Password</Label>
        <Input
          id='confirm-password'
          name='confirm_password'
          type='password'
          placeholder='••••••••'
          required
          disabled={isPending}
          autoComplete='new-password'
          minLength={8}
        />
      </div>
      {state?.error && (
        <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
          {state.error}
        </div>
      )}
      {state?.success && state?.message && (
        <div className='rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400'>
          {state.message}
        </div>
      )}
      <Button type='submit' className='w-full' disabled={isPending}>
        {isPending ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}

