import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { ClientResponseError } from 'pocketbase';
import { ActionError } from 'astro:actions';

export const users = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('Email is invalid').trim(),
      password: z.string().min(1, 'Password is required'),
    }),
    async handler({ email, password }, { locals }) {
      const { pb } = locals;
      try {
        await pb.collection('users').authWithPassword(email, password);
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
    async handler(_, { locals }) {
      const pb = locals.pb;
      pb.authStore.clear();
      return {
        redirect: '/',
      };
    },
  }),
};
