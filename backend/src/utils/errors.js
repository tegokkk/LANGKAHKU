export class AppError extends Error {
  constructor(status, message, code = "REQUEST_FAILED") {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const fail = (status, message, code) => {
  throw new AppError(status, message, code);
};
export const requireRecord = (record) =>
  record || fail(404, "Data tidak ditemukan.");
