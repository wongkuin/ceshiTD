import type { BTContext } from "../../context";
import { BTNode, BTNodeData, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class Calculate extends BTNode {
    declare args: { readonly value: string };

    constructor(context: BTContext, cfg: BTNodeData) {
        super(context, cfg);

        if (typeof this.args.value !== "string" || this.args.value.length === 0) {
            this.error(`args.value is not a expr string`);
        }
        context.compileCode(this.args.value);
    }

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const value = tree.blackboard.eval(this.args.value);
        this.output.push(value);
        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Calculate",
            type: "Action",
            children: 0,
            status: ["success"],
            desc: "简单的数值公式计算",
            args: [{ name: "value", type: "expr", desc: "计算公式" }],
            output: ["计算结果"],
            doc: `
                + 做简单的数值公式计算，返回结果到输出
            `,
        };
    }
}
