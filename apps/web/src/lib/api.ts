import { API_URL, API_URL_INFO } from "./apiUrl";

export { API_URL, API_URL_INFO };

export function getActiveApiUrl(): string {
  return API_URL;
}

// Nota sobre un intento anterior que empeoró el diagnóstico:
//
// Cuando `/api` no devolvía JSON, el cliente reintentaba automáticamente contra
// la URL de Railway. La intención era buena, pero el efecto fue el contrario:
// ese reintento es *cross-origin*, así que cuando fallaba (backend caído, o CORS
// del backend rechazando el origen) `fetch` rechazaba y el usuario volvía a ver
// "No pudimos conectar con el servidor" — el mismo mensaje inútil, ocultando que
// la petición original había recibido un 404 perfectamente diagnosticable.
//
// Ahora no hay reintento: `/api/*` lo enruta Vercel del lado del servidor
// (ver `vercel.json`), y cualquier respuesta que no sea JSON se reporta tal cual,
// con su código y su content-type.

const ACCESS_TOKEN_KEY = "cc_access_token";
const REFRESH_TOKEN_KEY = "cc_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// El servidor no respondió: sin conexión, backend caído o CORS bloqueado.
// Se distingue de ApiError para poder mostrar un mensaje distinto.
export class NetworkError extends Error {
  cause?: unknown;
  constructor(cause?: unknown) {
    super("No se pudo conectar con el servidor.");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

// La petición llegó a algún sitio, pero quien contestó no es el backend:
// normalmente Vercel devolviendo un 404 o el index.html de la SPA porque
// `/api/*` no está enrutado hacia Railway. Se guardan el código y el
// content-type reales, que son los dos datos que identifican el problema.
export class ApiConfigError extends Error {
  detail: string;
  status: number;
  contentType: string;
  constructor(status: number, contentType: string, detail: string) {
    super("La API no está respondiendo correctamente.");
    this.name = "ApiConfigError";
    this.status = status;
    this.contentType = contentType;
    this.detail = detail;
  }
}

function buildUrl(path: string): string {
  return `${API_URL}${path}`;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    return data.accessToken as string;
  } catch (cause) {
    // Sin red no invalidamos la sesión: puede ser un corte temporal.
    console.error("[API] No se pudo refrescar la sesión:", cause);
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const doFetch = async (token: string | null) => {
    try {
      return await fetch(buildUrl(path), {
        ...rest,
        headers: {
          "Content-Type": "application/json",
          ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      });
    } catch (cause) {
      // fetch solo rechaza por fallo de red/CORS, no por códigos de error HTTP.
      throw new NetworkError(cause);
    }
  };

  let res = await doFetch(getAccessToken());

  if (res.status === 401 && !skipAuth && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // Cualquier respuesta sin JSON (salvo un 204 sin cuerpo) significa que quien
  // contestó no es el backend. Se reporta con su código y content-type reales
  // en vez de reintentar por otra ruta y acabar con un error de red confuso.
  if (!isJson && res.status !== 204) {
    throw new ApiConfigError(
      res.status,
      contentType,
      `${buildUrl(path)} respondió HTTP ${res.status} con content-type ` +
        `"${contentType || "desconocido"}" en vez de JSON. La petición no llegó al backend.`
    );
  }

  let body: any = null;
  if (isJson) {
    try {
      body = await res.json();
    } catch (cause) {
      console.error("[API] Respuesta JSON inválida:", cause);
      throw new ApiConfigError(res.status, contentType, `${buildUrl(path)} devolvió JSON malformado.`);
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, body?.error || "Ocurrió un error inesperado.", body?.details);
  }

  return body as T;
}
