<script lang="ts">
	import {
		Button,
		Input,
		Drawer,
		Label,
		P,
		Heading,
		Popover,
		Alert,
		A,
		Avatar,
		Dropdown,
		DropdownHeader,
		DropdownGroup,
		Span,
		DropdownItem
	} from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { currentuser, pb } from './pocketbase';

	let hideLoginDrawer = $state(true);
	let hideSignupDrawer = $state(true);

	let errors: Array<string | undefined> = $state([]);

	let name: string | undefined = $state();
	let email: string | undefined = $state();
	let password: string | undefined = $state();

	async function login(event: Event) {
		event.preventDefault();
		if (email && password) {
			try {
				await pb.collection('users').authWithPassword(email, password);

				hideLoginDrawer = true;
				hideSignupDrawer = true;
			} catch (err) {
				if (String(err) == 'ClientResponseError 400: Failed to authenticate.') {
					errors.push('Email or password not recognized.');
				} else {
					errors.push(String(err));
				}
			}
		} else {
			errors.push('Email and Password required.');
		}
	}

	async function signUp(event: Event) {
		try {
			if (!name || !email || !password) throw new Error('Fields missing');
			const data = {
				name,
				email,
				password,
				passwordConfirm: password
			};

			await pb
				.collection('users')
				.create(data)
				.then((record) => pb.collection('users').requestVerification(data.email));
			await login(event);
		} catch (err) {
			errors.push(String(err));
		}
	}

	function signOut() {
		pb.authStore.clear();
		name = undefined;
		email = undefined;
		password = undefined;
	}
</script>

<div class="fixed top-0 left-0 z-100 w-full">
	<div class="mx-auto flex max-w-md flex-col gap-4 p-4">
		{#each errors as error}
			<Alert color="red" dismissable>
				{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
				{error}
			</Alert>
		{/each}
	</div>
</div>

<Drawer bind:hidden={hideLoginDrawer} class="z-50">
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

<Drawer bind:hidden={hideSignupDrawer} class="z-50">
	<Heading tag="h3" class="mb-4">Signup</Heading>
	<div class="flex flex-col gap-4">
		<div>
			<Label for="name" class="mb-2">Username</Label>
			<Input
				type="text"
				id="username"
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
		<Button onclick={signUp}>Sign up</Button>
	</div>
</Drawer>

{#if !$currentuser}
	<div class="flex flex-row items-center gap-4">
		<Button onclick={() => (hideLoginDrawer = false)} color="alternative">Login</Button>
		<Button onclick={() => (hideSignupDrawer = false)}>Signup</Button>
	</div>
{:else}
	<div class="flex flex-row items-center gap-4">
		<Avatar
			class="cursor-pointer"
			id="user-avatar"
			src="https://api.dicebear.com/9.x/thumbs/svg?seed={$currentuser?.id}"
		/>
		<Dropdown triggeredBy="#user-avatar" triggerDelay={0} trigger="click">
			<DropdownHeader>
				@{$currentuser?.name}
			</DropdownHeader>
			<DropdownGroup>
				<DropdownItem href="/profile">Profile</DropdownItem>
				<DropdownItem id="logout-btn">Logout</DropdownItem>
				<Popover trigger="click" triggeredBy="#logout-btn" triggerDelay={0} placement="bottom">
					<Button onclick={signOut}>For real?</Button>
				</Popover>
			</DropdownGroup>
		</Dropdown>
	</div>
	<!-- <div class="flex flex-row items-center gap-4">
		<P>Welcome, <A href="/profile">{$currentuser.name}</A></P>
		<Button>Logout</Button>
		<Popover trigger="click" triggerDelay={0}>
			<Button onclick={signOut}>For real?</Button>
		</Popover>
	</div> -->
{/if}
