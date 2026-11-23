import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
try {
  const directory = process.env.BACKUP_DIRECTORY;
  const files = (await readdir(directory)).filter((file) =>
    /^langkahku-[0-9T.Z-]+-[a-f0-9]{6}\.lkb$/.test(file),
  );
  const times = await Promise.all(
    files.map(async (file) => (await stat(join(directory, file))).mtimeMs),
  );
  process.exitCode = times.some(
    (time) => Date.now() - time < 26 * 60 * 60 * 1000,
  )
    ? 0
    : 1;
} catch {
  process.exitCode = 1;
}
