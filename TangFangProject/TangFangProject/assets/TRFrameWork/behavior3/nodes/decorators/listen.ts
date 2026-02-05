import type { BTContext, TargetType } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree, BTTreeEvent } from "../../tree";

const builtinEventOptions = [
    { name: "行为树被中断", value: BTTreeEvent.INTERRUPTED },
    { name: "行为树开始执行前", value: BTTreeEvent.BEFORE_TICKED },
    { name: "行为树执行完成后", value: BTTreeEvent.AFTER_TICKED },
    { name: "行为树执行成功后", value: BTTreeEvent.TICKED_SUCCESS },
    { name: "行为树执行失败后", value: BTTreeEvent.TICKED_FAILURE },
    { name: "行为树被清理", value: BTTreeEvent.CLEANED },
];

export class Listen extends BTNode {
    declare args: { readonly event: string };
    declare input: [TargetType | TargetType[] | undefined];
    declare output: [string?, string?];

    protected _isBuiltinEvent(event: string): boolean {
        return !!builtinEventOptions.find((e) => e.value === event);
    }

    protected _processOutput(
        tree: BTTree<BTContext, unknown>,
        eventTarget?: TargetType,
        ...eventArgs: unknown[]
    ) {
        const [eventArgsKey, eventTargetKey] = this.cfg.output;
        if (eventTargetKey) {
            tree.blackboard.set(eventTargetKey, eventTarget);
        }
        if (eventArgsKey) {
            tree.blackboard.set(eventArgsKey, eventArgs);
        }
    }

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        let [target] = this.input;
        const args = this.args;

        if (this._isBuiltinEvent(args.event)) {
            if (target !== undefined) {
                this.warn(`invalid target ${target} for builtin event ${args.event}`);
            }
            target = tree as TargetType;
        }

        const callback = (eventTarget?: TargetType) => {
            return (...eventArgs: unknown[]) => {
                this._processOutput(tree, eventTarget, ...eventArgs);
                const level = tree.stack.length;
                const status = this.children[0].tick(tree);
                if (status === "running") {
                    tree.stack.popTo(level);
                }
            };
        };
        if (target !== undefined) {
            if (target instanceof Array) {
                target.forEach((v) => {
                    tree.context.on(args.event, v, callback(v), tree);
                });
            } else {
                tree.context.on(args.event, target, callback(target), tree);
            }
        } else {
            tree.context.on(args.event, callback(undefined), tree);
        }

        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Listen",
            type: "Decorator",
            children: 1,
            status: ["success"],
            desc: "侦听事件",
            input: ["目标对象?"],
            output: ["事件参数?", "事件目标?"],
            args: [
                {
                    name: "event",
                    type: "enum",
                    desc: "事件",
                    options: builtinEventOptions.slice(),
                },
            ],
            doc: `
                + 当事件触发时，执行第一个子节点，多个仅执行第一个
                + 如果子节点返回 \`running\`，会中断执行并清理执行栈`,
        };
    }
}
