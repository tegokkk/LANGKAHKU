import { readConfig } from "../src/config/env.js";
import { backupDatabase } from "../src/utils/backup.js";
const config = readConfig();
const result = await backupDatabase({
  url: config.DATABASE_URL,
  key: process.env.BACKUP_KEY,
  directory: process.env.BACKUP_DIRECTORY,
});
console.log(`Backup terenkripsi tersimpan: ${result.path}`);
