import PocketBase, { type AuthRecord } from 'pocketbase';
import { writable } from 'svelte/store';

export const pb = new PocketBase('https://spock.homelab.mathiaslauridsen.dk');
export const currentuser = writable(pb.authStore.record);

pb.authStore.onChange((auth) => {
    currentuser.set(pb.authStore.record);
});