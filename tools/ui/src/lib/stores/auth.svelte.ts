import { browser } from '$app/environment';
import { SNAP_AUTH_TOKEN_LOCALSTORAGE_KEY } from '$lib/constants';
import { AuthService } from '$lib/services/auth.service';
import type { SnapAuthUser } from '$lib/types';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

class AuthStore {
	status = $state<AuthStatus>('checking');
	token = $state<string | null>(null);
	user = $state<SnapAuthUser | null>(null);
	error = $state<string | null>(null);
	private initialized = false;

	get isAuthenticated(): boolean {
		return this.status === 'authenticated' && Boolean(this.token && this.user);
	}

	get isChecking(): boolean {
		return this.status === 'checking';
	}

	async initialize(): Promise<void> {
		if (!browser || this.initialized) return;

		this.initialized = true;
		const storedToken = localStorage.getItem(SNAP_AUTH_TOKEN_LOCALSTORAGE_KEY)?.trim();

		if (!storedToken) {
			this.clearAuthState('unauthenticated');

			return;
		}

		this.status = 'checking';
		this.token = storedToken;

		try {
			this.user = await AuthService.me(storedToken);
			this.error = null;
			this.status = 'authenticated';
		} catch {
			this.clearAuthState('unauthenticated');
		}
	}

	async login(username: string, password: string): Promise<void> {
		if (!browser) return;

		this.status = 'checking';
		this.error = null;

		try {
			const login = await AuthService.login(username, password);
			const token = login.access_token;

			localStorage.setItem(SNAP_AUTH_TOKEN_LOCALSTORAGE_KEY, token);
			this.token = token;
			this.user = await AuthService.me(token);
			this.status = 'authenticated';
		} catch (error) {
			this.clearAuthState('unauthenticated');
			this.error = error instanceof Error ? error.message : 'Authentication failed.';

			throw error;
		}
	}

	logout(): void {
		this.clearAuthState('unauthenticated');
	}

	handleUnauthorized(): void {
		this.clearAuthState('unauthenticated');
	}

	private clearAuthState(status: AuthStatus): void {
		if (browser) {
			localStorage.removeItem(SNAP_AUTH_TOKEN_LOCALSTORAGE_KEY);
		}

		this.token = null;
		this.user = null;
		this.status = status;
	}
}

export const authStore = new AuthStore();
