/// <reference path="../.astro/types.d.ts" />
declare namespace App {
  interface Locals {
    pb: import('pocketbase').default;
    apb: import('pocketbase').default;
    user: {
      record: import('@/lib/definitions').UserType;
      token: string;
    };
    isAuthed: boolean;
    distinctId: string;
  }
}
