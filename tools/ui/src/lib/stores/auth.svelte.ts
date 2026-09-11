import { browser } from '$app/environment';
import { SNAP_AUTH_USER_LOCALSTORAGE_KEY } from '$lib/constants';
import type { SnapAuthUser } from '$lib/types';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

const DEMO_USERS = {
	admin: {
		password: 'admin-password',
		user: {
			role: 'admin',
			user_id: 'admin-001',
			username: 'admin'
		}
	},
	engineering: {
		password: 'engineering-password',
		user: {
			role: 'engineering',
			user_id: 'engineering-001',
			username: 'engineering'
		}
	},
	finance: {
		password: 'finance-password',
		user: {
			role: 'finance',
			user_id: 'finance-001',
			username: 'finance'
		}
	}
} satisfies Record<string, { password: string; user: SnapAuthUser }>;

class AuthStore {
	status = $state<AuthStatus>('checking');
	user = $state<SnapAuthUser | null>(null);
	error = $state<string | null>(null);
	private initialized = false;

	get isAuthenticated(): boolean {
		return this.status === 'authenticated' && Boolean(this.user);
	}

	get isChecking(): boolean {
		return this.status === 'checking';
	}

	async initialize(): Promise<void> {
		if (!browser || this.initialized) return;

		this.initialized = true;
		const storedUser = this.readStoredUser();

		if (!storedUser) {
			this.clearAuthState('unauthenticated');

			return;
		}

		this.user = storedUser;
		this.error = null;
		this.status = 'authenticated';
	}

	async login(username: string, password: string): Promise<void> {
		if (!browser) return;

		this.status = 'checking';
		this.error = null;
		const demoUser = DEMO_USERS[username as keyof typeof DEMO_USERS];

		if (!demoUser || demoUser.password !== password) {
			this.clearAuthState('unauthenticated');
			this.error = 'Invalid username or password.';

			throw new Error(this.error);
		}

		const user = { ...demoUser.user };

		localStorage.setItem(SNAP_AUTH_USER_LOCALSTORAGE_KEY, JSON.stringify(user));
		this.user = user;
		this.status = 'authenticated';
	}

	logout(): void {
		this.clearAuthState('unauthenticated');
	}

	handleUnauthorized(): void {
		// Demo auth is local-only; llama-server 401s belong to llama-ui API-key handling.
	}

	private clearAuthState(status: AuthStatus): void {
		if (browser) {
			localStorage.removeItem(SNAP_AUTH_USER_LOCALSTORAGE_KEY);
		}

		this.user = null;
		this.status = status;
	}

	private readStoredUser(): SnapAuthUser | null {
		try {
			const raw = localStorage.getItem(SNAP_AUTH_USER_LOCALSTORAGE_KEY);

			if (!raw) return null;

			const parsed = JSON.parse(raw) as Partial<SnapAuthUser>;
			const demoUser = parsed.username
				? DEMO_USERS[parsed.username as keyof typeof DEMO_USERS]
				: undefined;

			if (!demoUser) return null;

			if (
				parsed.user_id !== demoUser.user.user_id ||
				parsed.role !== demoUser.user.role ||
				parsed.username !== demoUser.user.username
			) {
				return null;
			}

			return { ...demoUser.user };
		} catch {
			return null;
		}
	}
}

export const authStore = new AuthStore();
