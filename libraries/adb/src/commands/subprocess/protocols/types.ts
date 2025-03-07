import type { MaybePromiseLike } from '@yume-chan/async';
import type { MaybeConsumable, ReadableStream, WritableStream } from '@yume-chan/stream-extra';

import type { Adb, AdbSocket } from '../../../adb.js';

export interface AdbSubprocessProtocol {
  /**
   * A WritableStream that writes to the `stdin` stream.
   */
  readonly stdin: WritableStream<MaybeConsumable<Uint8Array>>;

  /**
   * The `stdout` stream of the process.
   */
  readonly stdout: ReadableStream<Uint8Array>;

  /**
   * The `stderr` stream of the process.
   *
   * Note: Some `AdbSubprocessProtocol` doesn't separate `stdout` and `stderr`,
   * All output will be sent to `stdout`.
   */
  readonly stderr: ReadableStream<Uint8Array>;

  /**
   * A `Promise` that resolves to the exit code of the process.
   *
   * Note: Some `AdbSubprocessProtocol` doesn't support exit code,
   * They will always resolve it with `0`.
   */
  readonly exit: Promise<number>;

  /**
   * Resizes the current shell.
   *
   * Some `AdbSubprocessProtocol`s may not support resizing
   * and will ignore calls to this method.
   */
  resize(rows: number, cols: number): MaybePromiseLike<void>;

  /**
   * Kills the current process.
   */
  kill(): MaybePromiseLike<void>;
}

export interface AdbSubprocessProtocolConstructor {
  /** Returns `true` if the `adb` instance supports this shell */
  isSupported(adb: Adb): MaybePromiseLike<boolean>;

  /** Spawns an executable in PTY (interactive) mode. */
  pty(adb: Adb, command: string): MaybePromiseLike<AdbSubprocessProtocol>;

  /** Spawns an executable and pipe the output. */
  raw(adb: Adb, command: string): MaybePromiseLike<AdbSubprocessProtocol>;

  /** Creates a new `AdbShell` by attaching to an exist `AdbSocket` */
  new (socket: AdbSocket): AdbSubprocessProtocol;
}
