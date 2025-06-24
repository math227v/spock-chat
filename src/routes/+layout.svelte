<script lang="ts">
	import { page } from '$app/state';
	import Login from '$lib/Login.svelte';
	import '../app.css';

	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';

	let activeUrl = $derived(page.url.pathname);
	let { children } = $props();
</script>

<Navbar>
	<NavBrand href="/">
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
			>Spock chat</span
		>
	</NavBrand>
	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
	</NavUl>

	<div class="flex md:order-2">
		<Login />
		<NavHamburger />
	</div>
</Navbar>

{@render children()}
