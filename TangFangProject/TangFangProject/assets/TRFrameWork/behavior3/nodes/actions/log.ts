import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

enum LogLevel {
    INFO = "info",
    DEBUG = "debug",
    WARN = "warn",
    ERROR = "error",
}

export class Log extends BTNode {
    declare input: [unknown?];
    declare args: {
        readonly message: string;
        readonly level: LogLevel;
    };

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const [inputMsg] = this.input;
        const args = this.args;
        const level = args.level ?? LogLevel.INFO;
        let print = console.log;
        if (level === LogLevel.INFO) {
            print = console.info;
        } else if (level === LogLevel.DEBUG) {
            print = console.debug;
        } else if (level === LogLevel.WARN) {
            print = console.warn;
        } else if (level === LogLevel.ERROR) {
            print = console.error;
        }
        print.call(console, "behavior3 -> log:", args.message, inputMsg ?? "");
        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Log",
            type: "Action",
            children: 0,
            status: ["success"],
            desc: "打印日志",
            input: ["日志?"],
            args: [
                {
                    name: "message",
                    type: "string",
                    desc: "日志",
                },
                {
                    name: "level",
                    type: "enum",
                    desc: "日志级别",
                    default: LogLevel.INFO,
                    options: [
                        {
                            name: "INFO",
                            value: LogLevel.INFO,
                        },
                        {
                            name: "DEBUG",
                            value: LogLevel.DEBUG,
                        },
                        {
                            name: "WARN",
                            value: LogLevel.WARN,
                        },
                        {
                            name: "ERROR",
                            value: LogLevel.ERROR,
                        },
                    ],
                },
            ],
        };
    }
}
