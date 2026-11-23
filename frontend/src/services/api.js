let csrf = "";
export function setCsrf(value) {
  csrf = value;
}
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export async function api(path, options = {}) {
  const { body, signal, timeoutMs = 20000, updateCsrf = true, ...rest } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const method = (rest.method || "GET").toUpperCase();
  let response, data;
  try {
    response = await fetch(`/api/v1${path}`, {
      credentials: "same-origin",
      cache: "no-store",
      ...rest,
      method,
      signal: requestSignal,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(!["GET", "HEAD", "OPTIONS"].includes(method)
          ? { "X-CSRF-Token": csrf }
          : {}),
        ...rest.headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    data = await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted)
      throw new ApiError(
        "Layanan terlalu lama merespons. Periksa data terbaru sebelum mengirim ulang perubahan.",
        0,
        "TIMEOUT",
      );
    if (response)
      throw new ApiError(
        "Respons layanan tidak valid. Muat ulang data sebelum mengirim ulang perubahan.",
        response.status,
        "INVALID_RESPONSE",
      );
    throw new ApiError(
      "Koneksi terputus. Penyimpanan belum dapat dikonfirmasi; periksa data saat daring sebelum mengirim ulang.",
      0,
      "OFFLINE",
    );
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new ApiError(
      "Respons layanan tidak valid. Muat ulang data.",
      response.status,
      "INVALID_RESPONSE",
    );
  if (!response.ok) {
    if (response.status === 401 && data.error?.code === "SESSION_EXPIRED")
      window.dispatchEvent(new Event("session-expired"));
    if (response.status === 403 && data.error?.code === "ACCOUNT_RESTRICTED")
      window.dispatchEvent(new Event("session-restricted"));
    throw new ApiError(
      data.error?.message || "Permintaan belum berhasil. Coba lagi.",
      response.status,
      data.error?.code,
    );
  }
  if (updateCsrf && data.csrf) setCsrf(data.csrf);
  return data;
}
export const downloadJson = (data, name) => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
