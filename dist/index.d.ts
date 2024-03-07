/// <reference types="node" />
import { EventEmitter } from 'node:events';
export declare class JsonUtil {
    #private;
    load(j: string): void;
    getJson(): PackageJsonType;
    freeJson(): void;
}
export declare class FileUtil {
    static resolveFilePath(file: string): string;
    static createFile(file: string): string;
}
export declare class CommandUtil {
    mainCommandProgram(): {
        opts: {};
        action: string;
        actionOpts: {};
    };
    static createPackageJsonPrompts(): Promise<PackageJsonType>;
}
export declare class BaseCmd extends EventEmitter {
    #private;
    constructor();
    readline(): void;
}
type Opts = {
    action: string;
    opts?: {
        path?: string;
    };
    actionOpts: {
        file?: string;
    };
};
type PackageJsonType = {
    name: string;
    version: string;
    description: string;
    main: string;
    scripts: {
        test: string;
    };
    keywords: string[];
    author: string;
    license: string;
    dependencies: object;
    devDependencies: object;
    value?: string;
};
export declare class Cmd extends BaseCmd {
    #private;
    json: PackageJsonType;
    constructor();
    run(): void;
    processMainCommandprogram(opts: Opts): void;
    processLineEvent(line: string): void;
}
export {};
