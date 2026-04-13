import { writable, derived } from 'svelte/store';

export interface AuthUser {
	id: number;
	email: string;
	username: string;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthUser | null>(null);

	return {
		subscribe,
		set,
		update,
		logout: async () => {
			await fetch('/api/auth/logout', { method: 'POST' });
			set(null);
		}
	};
}

export const authUser = createAuthStore();

/** True when a user is authenticated */
export const isAuthenticated = derived(authUser, ($u) => $u !== null);
