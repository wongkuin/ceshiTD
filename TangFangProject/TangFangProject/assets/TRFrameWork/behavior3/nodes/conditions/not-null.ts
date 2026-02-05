import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class NotNull extends BTNode {
    declare input: [unknown];

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const [value] = this.input;
        if (value === undefined || value === null) {
            return "failure";
        } else {
            return "success";
        }
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "NotNull",
            type: "Condition",
            children: 0,
            status: ["success", "failure"],
            desc: "判断变量是否存在",
            input: ["判断的变量"],
        };
    }
}
