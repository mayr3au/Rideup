// Lance le site en local avec le compte démo Elite (fausses données, rien n'est enregistré).
// Usage : npm run dev:demo  puis ouvrir http://localhost:3001
import { spawn } from "node:child_process";

const child = spawn("npx", ["next", "dev", "-p", "3001"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_RIDEUP_DEMO: "1" },
});
child.on("exit", (code) => process.exit(code ?? 0));
