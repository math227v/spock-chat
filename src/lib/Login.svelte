<script lang="ts">
	import { currentuser, pb } from './pocketbase';

	let username: string | undefined = $state();
	let password: string | undefined = $state();
	let email: string | undefined = $state();

	async function login(event: Event) {
		event.preventDefault();
		if (email && password) {
			await pb.collection('users').authWithPassword(email, password);
		}
	}

	async function signUp(event: Event) {
		try {
			const data = {
				username,
				password,
				email,
				passwordConfirm: password,
				name: 'hi mom!'
			};

			const createdUser = await pb.collection('users').create(data);
			await login(event);
		} catch (err) {
			console.error(err);
		}
	}

	function signOut() {
		pb.authStore.clear();
	}
</script>

{#if $currentuser}
	<p>Signed in as {$currentuser.name}</p>
	<button onclick={signOut}>Logout</button>
{:else}
	<form>
		<input type="text" placeholder="username" bind:value={username} />
		<input type="email" placeholder="email" bind:value={email} />
		<input type="password" placeholder="password" bind:value={password} />

		<button onclick={signUp}>Sign Up</button>
		<button onclick={login}>Login</button>
	</form>
{/if}
