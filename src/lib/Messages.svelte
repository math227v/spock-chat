<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { currentuser, pb } from './pocketbase';
	import { Button, Heading, Input, P } from 'flowbite-svelte';
	import type { ListResult, RecordModel } from 'pocketbase';

	let newMessage: string = '';
	let messages: (RecordModel | undefined)[] = [];
	let unsubscribe: () => void;

	onMount(async () => {
		const resultList = await pb.collection('messages').getList(1, 50, {
			sort: 'created',
			expand: 'user'
		});

		messages = resultList.items;
		unsubscribe = await pb.collection('messages').subscribe('*', async ({ action, record }) => {
			if (action == 'create') {
				const user = await pb.collection('users').getOne(record.user);
				record.expand = { user };

				messages = [...messages, record];
			}
			if (action == 'delete') {
				messages = messages.filter((m) => m?.id !== record.id);
			}
		});
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	async function sendMessage(event: Event) {
		event.preventDefault();

		const data = {
			text: newMessage,
			user: $currentuser?.id
		};
		const createdMessage = await pb.collection('messages').create(data);
		newMessage = '';
	}
</script>

<Heading tag="h1">Messages</Heading>
<div class="my-4 flex max-h-96 flex-col gap-4 overflow-scroll rounded border-2 border-gray-300 p-2">
	{#each messages as message (message?.id)}
		<div class="rounded-xl border-2 border-gray-300 p-2">
			<P>{message?.text}</P>
			<small>Sent by @{message?.expand?.user?.name}</small>
		</div>
	{/each}
</div>

<forms>
	<div class="flex flex-row gap-4">
		<Input
			type="text"
			placeholder="Message"
			bind:value={newMessage}
			disabled={!$currentuser?.verified}
		/>
		<Button onclick={sendMessage} disabled={!$currentuser?.verified}>Send</Button>
	</div>
</forms>
