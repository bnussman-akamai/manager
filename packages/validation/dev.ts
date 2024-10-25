import { $ } from "bun";

await Promise.all([$`tsc -w --preserveWatchOutput`, $`tsup --watch`]);
