<script lang="ts">
	import { Button, Input, Drawer, Label, P, Heading, Popover } from 'flowbite-svelte';
	import { currentuser, pb } from './pocketbase';

	let hideLoginDrawer = $state(true);
	let hideSignupDrawer = $state(true);

	let name: string | undefined = $state();
	let email: string | undefined = $state();
	let password: string | undefined = $state();

	async function login(event: Event) {
		event.preventDefault();
		if (email && password) {
			await pb.collection('users').authWithPassword(email, password);
			hideLoginDrawer = true;
			hideSignupDrawer = true;
		}
	}

	async function signUp(event: Event) {
		try {
			const data = {
				name,
				email,
				password,
				passwordConfirm: password
			};

			const createdUser = await pb.collection('users').create(data);
			await login(event);
		} catch (err) {
			console.error(err);
		}
	}

	function signOut() {
		pb.authStore.clear();
		name = undefined;
		email = undefined;
		password = undefined;
	}
</script>

<!-- {#if !$currentuser}
	<form>
		<div class="flex flex-row gap-4">
			<Input type="text" id="email" placeholder="Email" bind:value={email} required />
			<Input type="password" id="password" placeholder="Password" bind:value={password} required />
			<Button onclick={login}>Login</Button>
		</div>
	</form>
{:else}
	<div class="flex flex-row items-center gap-4">
		{$currentuser.name}
		<Button onclick={signOut}>Logout</Button>
	</div>
{/if} -->

<Drawer bind:hidden={hideLoginDrawer}>
	<Heading tag="h3" class="mb-4">Login</Heading>
	<div class="flex flex-col gap-4">
		<div>
			<Label for="email" class="mb-2">Email</Label>
			<Input type="text" id="email" placeholder="Email" bind:value={email} required />
		</div>
		<div>
			<Label for="password" class="mb-2">Password</Label>
			<Input type="password" id="password" placeholder="Password" bind:value={password} required />
		</div>
		<Button onclick={login}>Login</Button>
	</div>
</Drawer>

<Drawer bind:hidden={hideSignupDrawer}>
	<Heading tag="h3" class="mb-4">Signup</Heading>
	<div class="flex flex-col gap-4">
		<div>
			<Label for="name" class="mb-2">Name</Label>
			<Input
				type="text"
				id="name"
				placeholder="What should we call you by?"
				bind:value={name}
				required
			/>
		</div>
		<div>
			<Label for="email" class="mb-2">Email</Label>
			<Input type="text" id="email" placeholder="Email" bind:value={email} required />
		</div>
		<div>
			<Label for="password" class="mb-2">Password</Label>
			<Input type="password" id="password" placeholder="Password" bind:value={password} required />
		</div>
		<Button onclick={signUp}>Login</Button>
	</div>
</Drawer>

{#if !$currentuser}
	<div class="flex flex-row items-center gap-4">
		<Button onclick={() => (hideLoginDrawer = false)} color="alternative">Login</Button>
		<Button onclick={() => (hideSignupDrawer = false)}>Signup</Button>
	</div>
{:else}
	<div class="flex flex-row items-center gap-4">
		<P>Welcome, {$currentuser.name}</P>
		<Button>Logout</Button>
		<Popover trigger="click" triggerDelay={0}>
			<Button onclick={signOut}>For real?</Button>
		</Popover>
	</div>
{/if}
