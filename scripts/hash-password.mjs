// Run with: node scripts/hash-password.mjs "your-new-password"
// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH in .env
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("Paste this into ADMIN_PASSWORD_HASH in .env (dollar signs pre-escaped):");
console.log(hash.replaceAll("$", "\\$"));
