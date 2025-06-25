<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { currentuser, pb } from './pocketbase';
	import { Avatar, Button, Heading, Input, P } from 'flowbite-svelte';
	import type { ListResult, RecordModel } from 'pocketbase';
	import { TrashBinSolid } from 'flowbite-svelte-icons';

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

	async function deleteMessage(message: RecordModel | undefined) {
		if (message?.id) {
			await pb.collection('messages').delete(message.id);
		}
	}
</script>

<Heading tag="h1">Messages</Heading>
<div class="my-4 flex max-h-96 flex-col gap-4 overflow-scroll rounded border-2 border-gray-300 p-2">
	{#each messages as message (message?.id)}
		<div class="flex flex-row items-center gap-2 rounded-xl border-2 border-gray-300 p-4">
			<Avatar src="https://api.dicebear.com/9.x/thumbs/svg?seed={message?.expand?.user?.id}" />
			<div class="flex flex-1 flex-col">
				<P>{message?.text}</P>
				<small>Sent by @{message?.expand?.user?.name}</small>
			</div>
			{#if message?.expand?.user?.id == $currentuser?.id}
				<Button color="alternative" onclick={() => deleteMessage(message)}>
					<TrashBinSolid />
				</Button>
			{/if}
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
