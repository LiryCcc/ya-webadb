import { AdbCommandBase } from "@yume-chan/adb";
import type { Consumable, ReadableStream } from "@yume-chan/stream-extra";

export interface AdbBackupOptions {
    user: number;
    saveSharedStorage?: boolean;
    saveWidgets?: boolean;
    packages: string[] | "user" | "all";
    savePackageApk: boolean;
    savePackageObb: boolean;
    savePackageKeyValue: boolean;
    compress: boolean;
}

export interface AdbRestoreOptions {
    user: number;
    file: ReadableStream<Consumable<Uint8Array>>;
}

export class AdbBackup extends AdbCommandBase {
    /**
     * User must confirm backup on device within 60 seconds.
     */
    public async backup(
        options: AdbBackupOptions
    ): Promise<ReadableStream<Uint8Array>> {
        const args = ["bu", "backup"];

        if (options.user !== undefined) {
            args.push("--user", options.user.toString());
        }

        args.push(options.saveSharedStorage ? "--shared" : "--no-shared");
        args.push(options.saveWidgets ? "--widgets" : "--no-widgets");

        args.push(options.savePackageApk ? "--apk" : "--no-apk");
        args.push(options.savePackageObb ? "--obb" : "--no-obb");
        args.push(
            options.savePackageKeyValue ? "--key-value" : "--no-key-value"
        );

        args.push(options.compress ? "--compress" : "--no-compress");

        if (typeof options.packages === "string") {
            switch (options.packages) {
                case "user":
                    args.push("--all", "--no-system");
                    break;
                case "all":
                    args.push("--all", "--system");
                    break;
            }
        } else {
            args.push(...options.packages);
        }

        const process = await this.adb.subprocess.spawn(args);
        return process.stdout;
    }

    /**
     * User must enter the password (if any) and
     * confirm restore on device within 60 seconds.
     */
    public async restore(options: AdbRestoreOptions): Promise<void> {
        const args = ["bu", "restore"];
        if (options.user !== undefined) {
            args.push("--user", options.user.toString());
        }
        const process = await this.adb.subprocess.spawn(args);
        await options.file.pipeTo(process.stdin);
        await process.exit;
    }
}
