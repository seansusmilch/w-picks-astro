/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    pb: import('pocketbase').default;
    apb: import('pocketbase').default;
    user: { record: any; token: string };
  }
}
