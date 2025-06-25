import { currentuser } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';

export function load() {
    if (!currentuser) redirect(303, '/');
}