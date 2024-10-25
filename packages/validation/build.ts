import { $ } from "bun";

await Promise.all([$`tsc`, $`tsup`]);
