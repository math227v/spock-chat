<script>
	import Messages from '$lib/Messages.svelte';
	import { Heading, P } from 'flowbite-svelte';
</script>

<section class="bg-primary-600">
	<div class="container mx-auto p-8">
		<Heading tag="h1" class="mb-2 text-center text-white">Spockchat!</Heading>
		<Heading tag="h5" class="text-center text-white">Dette er en pocketbase app!</Heading>
	</div>
</section>

<section>
	<div class="container mx-auto p-8">
		<Messages />
	</div>
</section>
