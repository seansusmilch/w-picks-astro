'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, signup } from '@/actions/users';
import { useRouter } from 'next/navigation';
import { postLoginRedirect, APP_NAME } from '@/lib/constants';

export function LoginSignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError('');
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    if (activeTab === 'login') {
      try {
        const result = await login({
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        });
        setSuccessMessage('Redirecting you...');
        router.push(result.redirect || postLoginRedirect);
        router.refresh();
      } catch (err: any) {
        setError(err.message || 'Login failed');
        setLoading(false);
      }
    } else {
      try {
        const result = await signup({
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          confirm_password: formData.get('confirm_password') as string,
        });
        setSuccessMessage(result.message || 'Please check your email for a verification link!');
        setLoading(false);
        setActiveTab('login');
      } catch (err: any) {
        setError(err.message || 'Signup failed');
        setLoading(false);
      }
    }
  };

  return (
    <form
      method='POST'
      className='bg-inherit p-4 border rounded-md max-w-lg min-w-96 flex flex-col gap-4'
      onSubmit={handleSubmit}
    >
      <h1 className='text-2xl font-semibold text-center py-4'>
        Welcome to {APP_NAME}
      </h1>

      {successMessage && (
        <div className='text-left text-foreground bg-green-400 dark:bg-green-600 p-2 rounded-md'>
          <p className='font-semibold'>Success:</p>
          <p className=''>{successMessage}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className='flex justify-center'>
          <TabsList>
            <TabsTrigger value='login'>Login</TabsTrigger>
            <TabsTrigger value='signup'>Sign Up</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='login'>
          <div className='flex flex-col max-w-lg gap-4'>
            <div className='flex flex-col text-lg'>
              <label htmlFor='email'>Email</label>
              <Input type='email' name='email' disabled={loading} required />
            </div>
            <div className='flex flex-col text-lg'>
              <label htmlFor='password'>Password</label>
              <Input
                type='password'
                name='password'
                disabled={loading}
                required
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value='signup'>
          <div className='flex flex-col max-w-lg gap-4'>
            <div className='flex flex-col text-lg'>
              <label htmlFor='email'>Email</label>
              <Input type='email' name='email' disabled={loading} required />
            </div>

            <div className='flex flex-col text-lg'>
              <label htmlFor='password'>Password</label>
              <Input
                type='password'
                name='password'
                disabled={loading}
                required
              />
            </div>

            <div className='flex flex-col text-lg'>
              <label htmlFor='confirm_password'>Confirm Password</label>
              <Input
                type='password'
                name='confirm_password'
                disabled={loading}
                required
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <div className='text-left text-destructive-foreground bg-destructive p-2 rounded-md'>
          <p className='font-semibold'>Error:</p>
          <p className=''>{error}</p>
        </div>
      )}

      <div className='pt-4 flex flex-row justify-end'>
        <Button className='font-bold' type='submit' disabled={loading}>
          Let's Goooo
        </Button>
      </div>
    </form>
  );
}