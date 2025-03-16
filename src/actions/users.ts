import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { ClientResponseError } from 'pocketbase';
import { ActionError } from 'astro:actions';
import { UserSettingsZ, UserZ } from '@/lib/definitions';
import { cookieSettings } from '@/lib/data';
export const users = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('Email is invalid').trim(),
      password: z.string().min(1, 'Password is required'),
    }),
    async handler({ email, password }, { locals, cookies, request }) {
      const { pb } = locals;
      try {
        const auth = await pb
          .collection('users')
          .authWithPassword(email, password);
        cookies.set(
          'pb_auth',
          auth.token,
          cookieSettings({
            requestUrl: request.url,
          })
        );

        return {
          redirect: '/',
        };
      } catch (e) {
        if (e instanceof ClientResponseError) {
          if (e.status === 400) {
            throw new ActionError({
              message: 'Wrong email or password',
              code: 'UNAUTHORIZED',
            });
          }
          if (e.status === 403) {
            throw new ActionError({
              message: 'You have not verified your email yet!',
              code: 'UNAUTHORIZED',
            });
          }
        }
        console.log('Login error', e);
        throw new ActionError({
          message: 'Something went wrong',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    },
  }),

  signup: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('Email is invalid').trim(),
      password: z.string().min(8, 'Password must be at least 8 characters!'),
      confirm_password: z.string().min(8, 'Passwords must match!'),
    }),
    async handler({ email, password, confirm_password }, { locals }) {
      const { pb, apb } = locals;

      if (password !== confirm_password) {
        throw new ActionError({
          message: 'Passwords do not match!',
          code: 'UNAUTHORIZED',
        });
      }

      try {
        await apb.collection('users').create({
          username: email.split('@')[0],
          email,
          password,
          passwordConfirm: confirm_password,
        });
        await pb.collection('users').requestVerification(email);
        return {
          message: 'Please check your email for a verification link!',
        };
      } catch (e) {
        if (e instanceof ClientResponseError) {
          if (
            e.status === 400 &&
            e.data.data.email?.code === 'validation_not_unique'
          ) {
            throw new ActionError({
              message: 'Email already in use',
              code: 'UNAUTHORIZED',
            });
          }
        }
        console.log('Signup error', JSON.stringify(e, null, 2));
        throw new ActionError({
          message: 'Something went wrong',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    },
  }),
  logout: defineAction({
    accept: 'json',
    async handler(_, { locals, cookies }) {
      const pb = locals.pb;
      pb.authStore.clear();
      cookies.delete('pb_auth');
    },
  }),
  getUserProfile: defineAction({
    accept: 'json',
    input: z.object({
      username: z.string().min(1, 'Username is required'),
    }),
    async handler({ username }, { locals }) {
      const { apb, isAuthed } = locals;
      if (!isAuthed) {
        throw new ActionError({
          message: 'You must be logged in to view this page',
          code: 'UNAUTHORIZED',
        });
      }

      const user = await apb
        .collection('users')
        .getFirstListItem(`username="${username}"`);
      return UserZ.parse(user);
    },
  }),
  updateProfile: defineAction({
    accept: 'form',
    input: z.object({
      username: z.string().min(1, 'Username is required').optional(),
      bio: z.string().optional(),
      avatar: z.instanceof(File).optional(),
    }),
    async handler(data, { locals }) {
      const { isAuthed } = locals;

      if (!isAuthed) {
        throw new ActionError({
          message: 'You must be logged in to update your profile',
          code: 'UNAUTHORIZED',
        });
      }

      try {
        const { apb, user } = locals;
        // Remove null values to avoid updating with empty values
        for (const key in data) {
          if (!data[key]) delete data[key];
        }
        const updatedUser = await apb
          .collection('users')
          .update(user.record.id, data);
        return UserZ.parse(updatedUser);
      } catch (e) {
        if (e instanceof ClientResponseError) {
          if (e.status === 400) {
            throw new ActionError({
              message: e.message,
              code: 'BAD_REQUEST',
            });
          }
        }
        throw new ActionError({
          message: 'Failed to update profile',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    },
  }),
  updateSettings: defineAction({
    accept: 'form',
    input: z.object({
      hideFromLatestPicks: z.boolean().optional(),
    }),
    async handler(data, { locals }) {
      console.log('Updating settings', data);

      const { isAuthed } = locals;
      if (!isAuthed) {
        throw new ActionError({
          message: 'You must be logged in to update your settings',
          code: 'UNAUTHORIZED',
        });
      }
      const { apb, user } = locals;
      const updatedUser = await apb
        .collection('users')
        .update(user.record.id, { settings: data });
      return UserSettingsZ.parse(updatedUser.settings);
    },
  }),
};
