import PocketBase, { type ClientResponseError } from 'npm:pocketbase';

let pocketBaseClient: PocketBase | undefined = undefined;

export function getPocketBaseClient(): PocketBase | undefined {
	if (pocketBaseClient) {
		return pocketBaseClient;
	}

	try {
		pocketBaseClient = new PocketBase('http://localhost:8090');
		return pocketBaseClient;
	} catch (e) {
		const error = e as ClientResponseError;
		console.error(error.message);
	}
}
