export interface SnapAuthLoginResponse {
	access_token: string;
	token_type: 'bearer' | string;
}

export interface SnapAuthUser {
	user_id: string;
	username: string;
	role: string;
}
