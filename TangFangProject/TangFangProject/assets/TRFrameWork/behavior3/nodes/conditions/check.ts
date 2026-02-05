import type { BTContext } from "../../context";
import { BTNode, BTNodeData, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class Check extends BTNode {
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
        return value ? "success" : "failure";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Check",
            type: "Condition",
            children: 0,
            status: ["success", "failure"],
            desc: "检查True或False",
            args: [{ name: "value", type: "expr", desc: "值" }],
            doc: `
                + 做简单数值公式判定，返回 \`success\` 或 \`failure\`
            `,
        };
    }
}
