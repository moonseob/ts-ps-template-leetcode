export class ListNode {
    val: number;
    next: ListNode | null;

    constructor(val?: number, next?: ListNode | null) {
        this.val = val ?? 0;
        this.next = next ?? null;
    }
}

export const buildList = (values: number[] | null): ListNode | null => {
    if (!values || values.length === 0) return null;
    const dummy = new ListNode(0);
    let current = dummy;
    for (const value of values) {
        current.next = new ListNode(value);
        current = current.next;
    }
    return dummy.next;
};

export const buildListWithCycle = (values: number[] | null, pos: number): ListNode | null => {
    if (!values || values.length === 0) return null;
    const nodes = values.map((value) => new ListNode(value));
    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i]!.next = nodes[i + 1]!;
    }
    if (pos >= 0 && pos < nodes.length) {
        nodes[nodes.length - 1]!.next = nodes[pos]!;
    }
    return nodes[0]!;
};

export const listToArray = (head: ListNode | null, limit = 10000): number[] => {
    const result: number[] = [];
    const seen = new Set<ListNode>();
    while (head && !seen.has(head) && result.length < limit) {
        result.push(head.val);
        seen.add(head);
        head = head.next;
    }
    return result;
};

export class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
        this.val = val === undefined ? 0 : val;
        this.left = left === undefined ? null : left;
        this.right = right === undefined ? null : right;
    }
}

export const buildTree = (values: Array<number | null> | null): TreeNode | null => {
    if (!values || values.length === 0) return null;
    const rootValue = values[0];
    if (rootValue === null) return null;

    const root = new TreeNode(rootValue);
    const queue: TreeNode[] = [root];
    let index = 1;

    while (queue.length > 0 && index < values.length) {
        const node = queue.shift();
        if (!node) continue;

        const leftValue = values[index++];
        if (leftValue !== undefined && leftValue !== null) {
            node.left = new TreeNode(leftValue);
            queue.push(node.left);
        }

        const rightValue = values[index++];
        if (rightValue !== undefined && rightValue !== null) {
            node.right = new TreeNode(rightValue);
            queue.push(node.right);
        }
    }

    return root;
};

export const treeToArray = (root: TreeNode | null): Array<number | null> => {
    if (!root) return [];
    const result: Array<number | null> = [];
    const queue: Array<TreeNode | null> = [root];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node) {
            result.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        } else {
            result.push(null);
        }
    }
    while (result.length > 0 && result[result.length - 1] === null) {
        result.pop();
    }
    return result;
};
