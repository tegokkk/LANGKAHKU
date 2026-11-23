import { restoreDatabase } from "../src/utils/backup.js";
if (
  !process.env.RESTORE_DATABASE_URL ||
  !process.env.DELETION_LEDGER_PATH ||
  !process.env.BACKUP_FILE
)
  throw new Error(
    "RESTORE_DATABASE_URL, DELETION_LEDGER_PATH (salinan terbaru), dan BACKUP_FILE wajib diisi. Layanan target harus tetap tertutup selama pemulihan.",
  );
console.log(
  await restoreDatabase({
    url: process.env.RESTORE_DATABASE_URL,
    key: process.env.BACKUP_KEY,
    path: process.env.BACKUP_FILE,
    ledger: process.env.DELETION_LEDGER_PATH,
  }),
);
