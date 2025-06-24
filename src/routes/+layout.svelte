<script lang="ts">
	import { page } from '$app/state';
	import Login from '$lib/Login.svelte';
	import '../app.css';

	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Footer,
		FooterCopyright,
		FooterLinkGroup,
		FooterLink,
		P
	} from 'flowbite-svelte';

	let activeUrl = $derived(page.url.pathname);
	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
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

	<main class="flex flex-1">
		<div class="w-full">
			{@render children()}
		</div>
	</main>

	<Footer class="rounded-none border-t-2 border-gray-100">
		<FooterCopyright
			by="Mathias M. Lauridsen."
			year={new Date().getFullYear()}
			copyrightMessage="All rights reserved."
		/>
		<P>Made with ❤️</P>
		<FooterLinkGroup>
			<FooterLink href="/">Home</FooterLink>
		</FooterLinkGroup>
	</Footer>
</div>
