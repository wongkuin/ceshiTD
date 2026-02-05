import type { ObjectType } from "./context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Evaluator = (envars: any) => unknown;

const enum BTTokenType {
    NUMBER,
    STRING,
    BOOLEAN,
    DOT,
    GT,
    GE,
    EQ,
    NEQ,
    LT,
    LE,
    ADD,
    SUB,
    MUL,
    DIV,
}
type BTToken = {
    type: BTTokenType;
    value?: string | number | boolean | null;
};

export class ExpressionEvaluator {
    private _postfix: BTToken[];
    private _args: ObjectType | null = null;

    constructor(expression: string) {
        expression = expression.replace(/\s/g, "");
        const tokens = expression.match(/\d+\.\d+|\w+|\d+|>=|<=|==|!=|>|<|[-+*/().]/g);
        if (!tokens) {
            throw new Error("Invalid expression");
        }
        this._postfix = this._convertToPostfix(tokens);
    }

    evaluate(args: ObjectType): unknown {
        const stack: unknown[] = [];

        this._args = args;
        for (const token of this._postfix) {
            const type = token.type;
            if (
                type === BTTokenType.NUMBER ||
                type === BTTokenType.BOOLEAN ||
                type === BTTokenType.STRING
            ) {
                stack.push(token.value);
            } else {
                const b = stack.pop()!;
                const a = stack.pop()!;
                switch (type) {
                    case BTTokenType.DOT: {
                        const obj = this._toObject(a);
                        stack.push(this._toValue(obj[b as string]));
                        break;
                    }
                    case BTTokenType.GT:
                        return this._toValue(a) > this._toValue(b);
                    case BTTokenType.GE:
                        return this._toValue(a) >= this._toValue(b);
                    case BTTokenType.EQ:
                        return (
                            this._toValue<unknown>(a, false) === this._toValue<unknown>(b, false)
                        );
                    case BTTokenType.NEQ:
                        return (
                            this._toValue<unknown>(a, false) !== this._toValue<unknown>(b, false)
                        );
                    case BTTokenType.LT:
                        return this._toValue(a) < this._toValue(b);
                    case BTTokenType.LE:
                        return this._toValue(a) <= this._toValue(b);
                    case BTTokenType.ADD:
                        stack.push(this._toValue(a) + this._toValue(b));
                        break;
                    case BTTokenType.SUB:
                        stack.push(this._toValue(a) - this._toValue(b));
                        break;
                    case BTTokenType.MUL:
                        stack.push(this._toValue(a) * this._toValue(b));
                        break;
                    case BTTokenType.DIV:
                        stack.push(this._toValue(a) / this._toValue(b));
                        break;
                }
            }
        }

        this._args = null;

        return stack.pop();
    }

    private _toObject(token: unknown) {
        if (typeof token === "string") {
            const obj = this._args?.[token];
            if (typeof obj === "object") {
                return obj as ObjectType;
            } else {
                throw new Error(`value indexed by '${token}' is not a object`);
            }
        } else {
            throw new Error(`token '${token}' is not a string`);
        }
    }

    private _toValue<T = number>(token: unknown, isNumber: boolean = true): T {
        const type = typeof token;
        if (type === "number" || type === "boolean" || token === null) {
            return token as T;
        } else if (typeof token === "string") {
            const value = this._args?.[token];
            if (value === undefined) {
                throw new Error(`value indexed by '${token}' is not found`);
            } else if (isNumber && typeof value !== "number") {
                throw new Error(`value indexed by '${token}' is not a number'`);
            }
            return value as T;
        } else {
            throw new Error(`token '${token}' type not support!`);
        }
    }

    private _precedence(operator: string): number {
        switch (operator) {
            case "<":
            case "<=":
            case "==":
            case "!=":
            case ">":
            case ">=":
                return 1;
            case "+":
            case "-":
                return 2;
            case "*":
            case "/":
                return 3;
            case ".":
                return 4;
            default:
                return 0;
        }
    }

    private _toToken(operator: string): BTToken {
        switch (operator) {
            case "<":
                return { type: BTTokenType.LT };
            case "<=":
                return { type: BTTokenType.LE };
            case "==":
                return { type: BTTokenType.EQ };
            case "!=":
                return { type: BTTokenType.NEQ };
            case ">":
                return { type: BTTokenType.GT };
            case ">=":
                return { type: BTTokenType.GE };
            case "+":
                return { type: BTTokenType.ADD };
            case "-":
                return { type: BTTokenType.SUB };
            case "*":
                return { type: BTTokenType.MUL };
            case "/":
                return { type: BTTokenType.DIV };
            case ".":
                return { type: BTTokenType.DOT };
            default:
                throw new Error(`unsupport operator: ${operator}`);
        }
    }

    private _convertToPostfix(infix: string[]) {
        const outputQueue: BTToken[] = [];
        const operatorStack: string[] = [];

        infix.forEach((token) => {
            if (/^\d+|\d+\.\d+$/.test(token)) {
                outputQueue.push({
                    type: BTTokenType.NUMBER,
                    value: parseFloat(token),
                });
            } else if (/^\w+$/.test(token)) {
                if (token === "true") {
                    outputQueue.push({ type: BTTokenType.BOOLEAN, value: true });
                } else if (token === "false") {
                    outputQueue.push({ type: BTTokenType.BOOLEAN, value: false });
                } else {
                    outputQueue.push({ type: BTTokenType.STRING, value: token });
                }
            } else if (token === "(") {
                operatorStack.push(token);
            } else if (token === ")") {
                while (operatorStack.length && operatorStack[operatorStack.length - 1] !== "(") {
                    outputQueue.push(this._toToken(operatorStack.pop()!));
                }
                operatorStack.pop();
            } else {
                while (
                    operatorStack.length &&
                    this._precedence(token) <=
                    this._precedence(operatorStack[operatorStack.length - 1])
                ) {
                    outputQueue.push(this._toToken(operatorStack.pop()!));
                }
                operatorStack.push(token);
            }
        });

        while (operatorStack.length) {
            outputQueue.push(this._toToken(operatorStack.pop()!));
        }

        return outputQueue;
    }
}