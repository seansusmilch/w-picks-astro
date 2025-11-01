'use server';

import { z } from 'zod';
import { ClientResponseError } from 'pocketbase';
import { UserSettingsZ, UserZ } from '@/lib/definitions';
import { cookieSettings, getPB, getAPB, getUser } from '@/lib/data';
import { getLogger } from '@/lib/logger';
import { cookies, headers } from 'next/headers';

const logger = getLogger('actions:users');

const loginSchema = z.object({
  email: z.string().email('Email is invalid').trim(),
  password: z.string().min(1, 'Password is required'),
});

export async function login(data: z.infer<typeof loginSchema>) {
  const pb = getPB();
  const cookieStore = await cookies();
  const headersList = await headers();
  
  try {
    const auth = await pb
      .collection('users')
      .authWithPassword(data.email, data.password);
    
    // Export cookie using PocketBase's format
    const requestUrl = headersList.get('referer') || headersList.get('host') || '';
    const isSecure = requestUrl.startsWith('https') || process.env.NODE_ENV === 'production';
    
    const cookieString = pb.authStore.exportToCookie({
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: 1209600, // 14 days
    });
    
    // Extract cookie value from the exported cookie string
    const cookieValue = cookieString.split('pb_auth=')[1]?.split(';')[0];
    if (cookieValue) {
      cookieStore.set('pb_auth', cookieValue, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 1209600,
      });
    }

    return {
      redirect: '/',
    };
  } catch (e) {
    if (e instanceof ClientResponseError) {
      if (e.status === 400) {
        throw new Error('Wrong email or password');
      }
      if (e.status === 403) {
        throw new Error('You have not verified your email yet!');
      }
    }
    logger.error({ error: e }, 'Login error');
    throw new Error('Something went wrong');
  }
}

const signupSchema = z.object({
  email: z.string().email('Email is invalid').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters!'),
  confirm_password: z.string().min(8, 'Passwords must match!'),
});

export async function signup(data: z.infer<typeof signupSchema>) {
  const pb = getPB();
  const apb = await getAPB();

  if (data.password !== data.confirm_password) {
    throw new Error('Passwords do not match!');
  }

  try {
    await apb.collection('users').create({
      username: data.email.split('@')[0],
      email: data.email,
      password: data.password,
      passwordConfirm: data.confirm_password,
    });
    await pb.collection('users').requestVerification(data.email);
    return {
      message: 'Please check your email for a verification link!',
    };
  } catch (e) {
    if (e instanceof ClientResponseError) {
      if (
        e.status === 400 &&
        e.data.data.email?.code === 'validation_not_unique'
      ) {
        throw new Error('Email already in use');
      }
    }
    logger.error({ error: e }, 'Signup error');
    throw new Error('Something went wrong');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('pb_auth');
}

const getUserProfileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export async function getUserProfile(data: z.infer<typeof getUserProfileSchema>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('You must be logged in to view this page');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    throw new Error('You must be logged in to view this page');
  }

  const apb = await getAPB();
  const foundUser = await apb
    .collection('users')
    .getFirstListItem(`username="${data.username}"`);
  return UserZ.parse(foundUser);
}

const updateProfileSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  bio: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('You must be logged in to update your profile');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    throw new Error('You must be logged in to update your profile');
  }

  try {
    const apb = await getAPB();
    // Remove null/undefined values
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar) updateData.avatar = data.avatar;

    const updatedUser = await apb
      .collection('users')
      .update(user.record.id, updateData);
    return UserZ.parse(updatedUser);
  } catch (e) {
    if (e instanceof ClientResponseError) {
      if (e.status === 400) {
        throw new Error(e.message);
      }
    }
    throw new Error('Failed to update profile');
  }
}

export async function updateSettings(data: Partial<z.infer<typeof UserSettingsZ>>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('You must be logged in to update your settings');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    throw new Error('You must be logged in to update your settings');
  }

  const apb = await getAPB();
  const currentSettings = user.record.settings || {};
  const updatedSettings = { ...currentSettings, ...data };

  const updatedUser = await apb
    .collection('users')
    .update(user.record.id, { settings: updatedSettings });
  return UserSettingsZ.parse(updatedUser.settings);
}