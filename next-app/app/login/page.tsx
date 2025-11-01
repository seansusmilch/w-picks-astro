import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { LoginForm, SignupForm } from './forms';

export default async function LoginPage() {
  // Redirect if already authenticated
  const user = await getAuthenticatedUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>Welcome</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='login' className='w-full'>
            <div className='mb-4 flex justify-center'>
              <TabsList>
                <TabsTrigger value='login'>Login</TabsTrigger>
                <TabsTrigger value='signup'>Sign Up</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value='login'>
              <LoginForm />
            </TabsContent>
            <TabsContent value='signup'>
              <SignupForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
