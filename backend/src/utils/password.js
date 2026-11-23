import argon2 from "argon2";
import { randomBytes, createHash } from "node:crypto";
export const hashPassword = (password) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
export const verifyPassword = (hash, password) => argon2.verify(hash, password);
export const recoveryCode = () => randomBytes(24).toString("hex");
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
