import { createHttpApi } from './httpApi';
import { localApi } from './localApi';
import type { EloApi } from './types';

export * from './types';
export * from './errors';

/**
 * Sem EXPO_PUBLIC_API_URL, o app roda em modo demonstração, com os dados no próprio
 * aparelho. Com a variável definida (ex.: https://api.elodecuidado.com.br), usa a API real.
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const api: EloApi = apiUrl ? createHttpApi(apiUrl) : localApi;
