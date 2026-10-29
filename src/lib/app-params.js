import { getAccessToken } from '@base44/sdk';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('base44_access_token');
	window.localStorage.removeItem('token');
}

const cleanParam = (val) => {
	if (!val || val === 'undefined' || val === 'null') return '';
	return typeof val === 'string' ? val.trim() : String(val);
};

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	const searchParams = !isNode ? new URLSearchParams(window.location.search) : null;
	const appId =
		cleanParam(import.meta.env.VITE_BASE44_APP_ID) ||
		cleanParam(searchParams?.get("app_id")) ||
		cleanParam(searchParams?.get("appId")) ||
		"";

	const appBaseUrl =
		cleanParam(import.meta.env.VITE_BASE44_APP_BASE_URL) ||
		cleanParam(import.meta.env.VITE_BASE44_BACKEND_URL) ||
		cleanParam(searchParams?.get("app_base_url")) ||
		"";

	const functionsVersion =
		cleanParam(searchParams?.get("functions_version")) ||
		cleanParam(import.meta.env.VITE_BASE44_FUNCTIONS_VERSION) ||
		"";

	return {
		appId,
		token: getAccessToken(),
		functionsVersion,
		appBaseUrl,
	};
};

export const appParams = {
	...getAppParams()
};
