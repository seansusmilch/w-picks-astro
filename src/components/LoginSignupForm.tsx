import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export function LoginSignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch('/login', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (res.redirected) {
          window.location.href = res.url;
        }
        return res.json();
      })
      .then(({ error }) => {
        if (error) {
          setError(error);
          setLoading(false);
        }
      });
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
      <Tabs defaultValue='login'>
        <div className='flex justify-center'>
          <TabsList>
            <TabsTrigger value='login'>Login</TabsTrigger>
            <TabsTrigger value='signup'>Sign Up</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='login'>
          <div className='flex flex-col max-w-lg'>
            <label>Email</label>
            <input
              className='p-2 bg-muted rounded-md'
              type='email'
              name='email'
              disabled={loading}
              required
            />

            <label>Password</label>
            <input
              className='p-2 bg-muted rounded-md'
              type='password'
              name='password'
              disabled={loading}
              required
            />
          </div>
        </TabsContent>
        <TabsContent value='signup'>Signup content</TabsContent>
      </Tabs>
      {error && (
        <div className='text-left text-destructive-foreground bg-destructive p-2 rounded-md'>
          <p className='font-semibold'>Error:</p>
          <p className=''>{error}</p>
        </div>
      )}
      <div className='flex flex-row justify-end'>
        <button
          disabled={loading}
          className='mt-4 p-2 bg-blue-500 text-white rounded-lg max-w-fit'
        >
          Submit
        </button>
      </div>
    </form>
  );
}
