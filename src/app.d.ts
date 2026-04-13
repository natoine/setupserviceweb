// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {
	namespace App {
		interface Locals {
			user?: {
				id: number;
				email: string;
				username: string;
			};
			isAdmin?: boolean;
		}

		interface PageData {
			user?: {
				id: number;
				email: string;
				username: string;
			};
		}
	}
}

export {};
