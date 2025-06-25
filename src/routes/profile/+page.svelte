<script lang="ts">
	import { Avatar, Button, Input, Label, P } from 'flowbite-svelte';
	import { currentuser, pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let name: string = $state('');
	let email: string = $state('');

	onMount(() => {
		name = $currentuser?.name;
		email = $currentuser?.email;
	});

	$effect(() => {
		if (!$currentuser) goto('/');
	});

	async function updateProfile() {
		if (!$currentuser) return;
		pb.collection('users').update($currentuser.id, { name, email });
	}
</script>

<section>
	<div class="container mx-auto p-8">
		<div class="mb-4 flex items-center gap-4">
			<Avatar size="lg" src="https://api.dicebear.com/9.x/thumbs/svg?seed={$currentuser?.id}" />
			<div class="space-y-1 font-medium">
				<P>{name}</P>
				<P>{email}</P>
			</div>
		</div>

		<form class="space-y-4">
			<div>
				<Label for="username" class="mb-2">Username</Label>
				<Input id="username" type="text" bind:value={name} />
			</div>
			<Button onclick={updateProfile}>Save</Button>
		</form>
	</div>
</section>
