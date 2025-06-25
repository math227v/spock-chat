<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { MapLibre, Marker, type MarkerClickInfo } from 'svelte-maplibre';
	import { currentuser, pb } from './pocketbase';
	import type { RecordModel } from 'pocketbase';
	import { Avatar } from 'flowbite-svelte';

	let userPos: { coords: [number, number]; accuracy: number } | undefined = $state(undefined);
	let locationError: string | undefined = $state(undefined);

	let positions: RecordModel[] | undefined = $state();
	let unsubscribe: () => void;

	onMount(() => {
		pb.collection('positions')
			.getList(1, 50, { expand: 'user' })
			.then(async (data) => {
				if (data?.items) {
					positions = data.items;
					console.dir(positions);
				} else {
					positions = [];
				}
				unsubscribe = await pb
					.collection('positions')
					.subscribe('*', async ({ action, record }) => {
						if (action === 'create') {
							// Tilføj ny position til arrayet
							const user = await pb.collection('users').getOne(record.user);
							record.expand = { user };
							if (positions) {
								positions.push(record);
							} else {
								positions = [record];
							}
						} else if (action === 'delete') {
							// Find index på den slettede position
							if (positions) {
								const index = positions.findIndex((p) => p?.id === record.id);
								if (index !== -1) {
									// Fjern den slettede position fra arrayet
									positions.splice(index, 1);
								}
							}
						} else if (action === 'update') {
							if (positions) {
								// Find index på den opdaterede position i positions-arrayet
								const index = positions.findIndex((p) => p?.id === record.id);

								if (index !== -1) {
									// Opdater den eksisterende position med det nye record
									positions[index].position = record.position;
								} else {
									positions.push(record);
								}
							} else {
								positions = [record];
							}
						}
					});
			})
			.catch((err) => console.error(err));

		const options = {
			enableHighAccuracy: true,
			maximumAge: 30000,
			timeout: 27000
		};

		let watchID: number;
		if (navigator?.geolocation) {
			watchID = navigator.geolocation.watchPosition(
				(pos) => {
					locationError = undefined;

					const userLng = Number(pos.coords.longitude.toFixed(6));
					const userLat = Number(pos.coords.latitude.toFixed(6));
					const data = {
						coords: [userLng, userLat] as [number, number],
						accuracy: pos.coords.accuracy
					};

					if (pos.coords.accuracy > 25) {
						locationError = 'Lokationen er ikke præcis nok.';
					}

					if ($currentuser) {
						pb.collection('positions')
							.getFirstListItem(`user="${$currentuser.id}"`)
							.catch(() => null)
							.then((existing) => {
								const data = {
									position: {
										lon: pos.coords.longitude,
										lat: pos.coords.latitude
									},
									user: $currentuser.id
								};

								if (existing) {
									console.log('Updating pos');
									pb.collection('positions')
										.update(existing.id, data)
										.catch((err) => console.error(err));
								} else {
									console.log('Creating pos');
									pb.collection('positions')
										.create(data)
										.catch((err) => console.error(err));
								}
							});
					}

					userPos = data;
				},
				() => {
					locationError = 'Din position kunne ikke bestemmes.';
				},
				options
			);

			return () => navigator.geolocation.clearWatch(watchID);
		}
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	const startPosition: [number, number] = [11.0, 56.0];
</script>

<div class="relative min-h-full w-full md:h-full">
	<MapLibre
		center={startPosition}
		zoom={6}
		standardControls
		style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
	>
		<!-- <NavigationControl /> -->
		<!-- {#if userPos?.coords}
			<Marker bind:lngLat={userPos.coords}>
				<MapPinAltSolid class="-translate-y-1/2" size="xl" color="#ff0000" />
			</Marker>
		{/if} -->

		{#if positions}
			{#each positions as entry (entry?.id)}
				{#if entry?.position}
					<Marker bind:lngLat={entry.position}>
						<Avatar
							src="https://api.dicebear.com/9.x/thumbs/svg?seed={entry?.expand?.user?.id}"
							border={$currentuser?.id == entry?.expand?.user?.id}
							class="ring-green-400"
						/>
						<!-- <MapPinAltSolid class="-translate-y-1/2 cursor-pointer" size="xl" color="#ff9900" /> -->
					</Marker>
				{/if}
			{/each}
		{/if}
	</MapLibre>
</div>
