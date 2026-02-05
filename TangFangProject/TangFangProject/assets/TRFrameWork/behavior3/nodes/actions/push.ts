import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class Push extends BTNode {
    declare input: [unknown[], unknown];

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const [arr, element] = this.input;
        if (!Array.isArray(arr)) {
            return "failure";
        }
        arr.push(element);
        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Push",
            type: "Action",
            children: 0,
            status: ["success", "failure"],
            desc: "向数组中添加元素",
            input: ["数组", "元素"],
            doc: `
                + 当变量\`数组\`不是数组类型时返回 \`failure\`
                + 其余返回 \`success\`
            `,
        };
    }
}
