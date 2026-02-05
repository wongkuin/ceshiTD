import type { BTContext } from "../../context";
import { BTNode, BTNodeDef, BTStatus } from "../../node";
import { BTTree } from "../../tree";

export class Let extends BTNode {
    declare args: { readonly value?: unknown };

    override onTick(tree: BTTree<BTContext, unknown>): BTStatus {
        const value = this._checkOneof(0, this.args.value, null);
        this.output.push(value);
        return "success";
    }

    static override get descriptor(): BTNodeDef {
        return {
            name: "Let",
            type: "Action",
            children: 0,
            status: ["success"],
            desc: "定义新的变量名",
            input: ["已存在变量名?"],
            args: [
                {
                    name: "value",
                    type: "json?",
                    desc: "值(value)",
                    oneof: "已存在变量名",
                },
            ],
            output: ["新变量名"],
            doc: `
                + 如果有输入变量，则给已有变量重新定义一个名字
                + 如果\`值(value)\`为 \`null\`，则清除变量
            `,
        };
    }
}
