import { base } from '$app/paths';
import { API_AUTH, HEADERS } from '$lib/constants';
import { MimeTypeApplication } from '$lib/enums';
import type { SnapAuthLoginResponse, SnapAuthUser } from '$lib/types';

export class AuthService {
	static async login(username: string, password: string): Promise<SnapAuthLoginResponse> {
		const response = await fetch(`${base}${API_AUTH.LOGIN}`, {
			body: JSON.stringify({ password, username }),
			headers: {
				[HEADERS.CONTENT_TYPE]: MimeTypeApplication.JSON
			},
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(await AuthService.parseErrorMessage(response));
		}

		const data = (await response.json()) as SnapAuthLoginResponse;

		if (!data.access_token) {
			throw new Error('Authentication failed.');
		}

		return data;
	}

	static async me(token: string): Promise<SnapAuthUser> {
		const response = await fetch(`${base}${API_AUTH.ME}`, {
			headers: {
				[HEADERS.AUTHORIZATION]: `${HEADERS.BEARER}${token}`
			}
		});

		if (!response.ok) {
			throw new Error(await AuthService.parseErrorMessage(response));
		}

		return response.json() as Promise<SnapAuthUser>;
	}

	private static async parseErrorMessage(response: Response): Promise<string> {
		try {
			const data = await response.json();

			if (typeof data?.detail === 'string') return data.detail;

			if (typeof data?.message === 'string') return data.message;

			if (typeof data?.error === 'string') return data.error;
		} catch {
			// fall through to the generic status message
		}

		return response.status === 401 ? 'Invalid username or password.' : 'Authentication failed.';
	}
}
