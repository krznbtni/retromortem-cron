import { Cron } from 'https://deno.land/x/croner@6.0.3/dist/croner.js';
import type { ClientResponseError } from 'npm:pocketbase';

import { getPocketBaseClient } from './lib/pocketbase.ts';
import {
	Collections,
	RetrospectivesStateOptions,
} from './lib/types/pocketbase-types.ts';

// POCKETBASE_URL=http://localhost:8090 deno run --allow-net --allow-env src/main.ts

async function setRetroStateToInProgress(): Promise<void> {
	const pbClient = getPocketBaseClient();

	if (!pbClient) {
		return;
	}

	const date = new Date().toISOString().replace('T', ' ');

	const retros = await pbClient.collection(Collections.Retrospectives)
		.getFullList({
			filter:
				`scheduled <= '${date}' && state = '${RetrospectivesStateOptions.published}'`,
		});

	for (const retro of retros) {
		retro.state = RetrospectivesStateOptions['in-progress'];

		try {
			await pbClient.collection(
				Collections.Retrospectives,
			).update(retro.id, retro);

			console.info(
				`Successfully set retro ${retro.id} to '${
					RetrospectivesStateOptions['in-progress']
				}'.`,
			);
		} catch (e) {
			const error = e as ClientResponseError;

			console.error(
				`Failed to set retro ${retro.id} to '${
					RetrospectivesStateOptions['in-progress']
				}'. PocketBase error: ${error.message}`,
			);
		}
	}
}

const ONE_SECOND = 1000;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;

async function setRetroStateToFinished(): Promise<void> {
	const pbClient = getPocketBaseClient();

	if (!pbClient) {
		return;
	}

	const THREE_HOURS = ONE_HOUR * 3;
	const date = new Date(Date.now() - THREE_HOURS).toISOString().replace(
		'T',
		' ',
	);

	const retros = await pbClient.collection(Collections.Retrospectives)
		.getFullList({
			filter: `scheduled <= '${date}' && state = '${
				RetrospectivesStateOptions['in-progress']
			}'`,
		});

	for (const retro of retros) {
		retro.state = RetrospectivesStateOptions['finished'];

		try {
			await pbClient.collection(
				Collections.Retrospectives,
			).update(retro.id, retro);
		} catch (e) {
			const error = e as ClientResponseError;

			console.error(
				`Failed to set retro ${retro.id} to '${
					RetrospectivesStateOptions['in-progress']
				}'. PocketBase error: ${error.message}`,
			);
		}
	}
}

new Cron('*/1 * * * *', {}, setRetroStateToInProgress);
// new Cron('*/1 * * * *', {}, setRetroStateToFinished);
