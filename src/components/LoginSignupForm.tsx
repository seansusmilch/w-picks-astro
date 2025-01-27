import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { actions, isInputError } from 'astro:actions';
import { navigate } from 'astro:transitions/client';

export function LoginSignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError('');
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    if (activeTab === 'login') {
      const { error } = await actions.users.login(formData);
      if (error) {
        if (isInputError(error)) {
          setError(error.issues.map((issue) => issue.message).join(', '));
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      setSuccessMessage('Redirecting you...');
      navigate('/');
    } else {
      const { data, error } = await actions.users.signup(formData);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      setLoading(false);
      setActiveTab('login');
    }
  };

  return (
    <form
      method='POST'
      className='bg-inherit p-4 border rounded-md shadow-lg max-w-lg min-w-96 flex flex-col gap-4'
      onSubmit={handleSubmit}
    >
      <h1 className='text-2xl font-semibold text-center py-4'>
        Welcome to W Picks
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
