// Types for the few Node built-ins the outbox tests use (Jest runs them in Node). Declared here rather than adding
// @types/node, which would put Node's globals into the app's types.
declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): { run(...params: unknown[]): unknown; all(...params: unknown[]): unknown[] };
  }
}
declare module 'node:fs' {
  export function mkdtempSync(prefix: string): string;
  export function rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
}
declare module 'node:os' {
  export function tmpdir(): string;
}
declare module 'node:path' {
  export function join(...parts: string[]): string;
}
