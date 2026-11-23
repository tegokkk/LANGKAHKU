import { z } from "zod";
import { username, password } from "../modules/auth/auth.schema.js";
import { one, transaction, audit } from "../config/database.js";
import { hashPassword, verifyPassword } from "./password.js";

export const setupSchema = z.strictObject({
  schoolName: z.string().trim().min(3).max(180),
  username,
  password,
});

// Explicit operator command only; never run cleanup from migrations or app startup.
export async function prepareProduction(pool, input) {
  const data = setupSchema.parse(input);
  const hash = await hashPassword(data.password);
  return transaction(pool, async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(61482027)");
    await db.query(
      "LOCK TABLE schools, users, content_items IN SHARE ROW EXCLUSIVE MODE",
    );
    const { rows: demoSchools } = await db.query(
      "SELECT id FROM schools WHERE name='SMA Ruang Tumbuh (Demo)'",
    );
    const ids = demoSchools.map((school) => school.id);
    const existing = await one(
      db,
      "SELECT * FROM users WHERE username=$1 AND NOT (school_id=ANY($2::uuid[]))",
      [data.username, ids],
    );
    if (
      existing &&
      (existing.role !== "superadmin" ||
        existing.status !== "approved" ||
        existing.deletion_requested_at ||
        !(await verifyPassword(existing.password_hash, data.password)))
    )
      throw new Error(
        "Akun sudah ada dan berbeda; setup tidak menimpa akun atau kata sandi.",
      );
    if (
      !existing &&
      (
        await db.query(
          "SELECT id FROM users WHERE role='superadmin' AND NOT (school_id=ANY($1::uuid[]))",
          [ids],
        )
      ).rowCount
    )
      throw new Error(
        "Superadmin sudah tersedia. Setup hanya membuat superadmin pertama.",
      );

    // Include the UI test registrations and their private data in the seeded school.
    const { rows: demoUsers } = await db.query(
      "SELECT id FROM users WHERE school_id=ANY($1::uuid[])",
      [ids],
    );
    const userIds = demoUsers.map((user) => user.id);
    const removedContent = await db.query(
      "DELETE FROM content_items WHERE demo=true OR school_id=ANY($1::uuid[])",
      [ids],
    );
    await db.query(
      "DELETE FROM sessions WHERE sess->>'userId'=ANY($1::text[])",
      [userIds],
    );
    await db.query(
      "DELETE FROM audit_logs WHERE actor_id=ANY($1::uuid[]) OR target_id=ANY($1::uuid[]) OR target_id=ANY($2::uuid[])",
      [userIds, ids],
    );
    await db.query(
      "DELETE FROM consultations WHERE school_id=ANY($1::uuid[]) OR student_id=ANY($2::uuid[]) OR teacher_id=ANY($2::uuid[])",
      [ids, userIds],
    );
    await db.query(
      "DELETE FROM deletion_jobs WHERE school_id=ANY($1::uuid[]) OR target_id=ANY($2::uuid[])",
      [ids, userIds],
    );
    await db.query("DELETE FROM users WHERE school_id=ANY($1::uuid[])", [ids]);
    await db.query("DELETE FROM cohorts WHERE school_id=ANY($1::uuid[])", [
      ids,
    ]);
    await db.query("DELETE FROM schools WHERE id=ANY($1::uuid[])", [ids]);
    let user = existing;
    if (!user) {
      const school = await one(
        db,
        "INSERT INTO schools(name,public_registration) VALUES($1,true) RETURNING id",
        [data.schoolName],
      );
      user = await one(
        db,
        "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,$2,$3,'SuperAdmin','superadmin','approved') RETURNING id,school_id,username",
        [school.id, data.username, hash],
      );
      await audit(db, user.id, "superadmin_bootstrapped", user.id);
    }
    return {
      username: user.username,
      schoolId: user.school_id,
      created: !existing,
      removed: {
        schools: ids.length,
        users: userIds.length,
        content: removedContent.rowCount,
      },
    };
  });
}
