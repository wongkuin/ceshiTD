import type { BTContext } from "./context";
import type { BTNode } from "./node";
import { BTTree } from "./tree";

export class BTStack {
    private _nodes: BTNode[] = [];
    private _tree: BTTree<BTContext, unknown>;

    constructor(tree: BTTree<BTContext, unknown>) {
        this._tree = tree;
    }

    get length() {
        return this._nodes.length;
    }

    top(): BTNode | undefined {
        return this._nodes[this._nodes.length - 1];
    }

    push(node: BTNode) {
        this._nodes.push(node);
    }

    pop(): BTNode | undefined {
        const node = this._nodes.pop();
        if (node) {
            this._tree.blackboard.set(node.__yield, undefined);
        }
        return node;
    }

    popTo(index: number) {
        while (this._nodes.length > index) {
            this.pop();
        }
    }

    move(dest: BTStack, start: number, count: number) {
        dest._nodes.push(...this._nodes.splice(start, count));
    }

    clear() {
        this.popTo(0);
    }
}
