import PocketBase from 'pocketbase';
import { POCKETBASE_URL, ADMIN_USER, ADMIN_PASSWORD } from 'astro:env/server';

let pb;
let apb;

export const PB = () => {
  if (!pb) {
    pb = new PocketBase(POCKETBASE_URL);
  }

  return pb;
};
