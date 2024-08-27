import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LoginSignupForm() {
  return (
    <form
      method='POST'
      className='bg-inherit p-4 rounded-md shadow-lg max-w-lg min-w-96'
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
              required
            />

            <label>Password</label>
            <input
              className='p-2 bg-muted rounded-md'
              type='password'
              name='password'
              required
            />
          </div>
        </TabsContent>
        <TabsContent value='signup'>Signup content</TabsContent>
      </Tabs>
      <div className='flex flex-row justify-end'>
        <button className='mt-4 p-2 bg-blue-500 text-white rounded-lg max-w-fit'>
          Submit
        </button>
      </div>
    </form>
  );
}
