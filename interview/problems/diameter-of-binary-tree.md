---
title: Diameter of Binary Tree
leetcode: diameter-of-binary-tree
description: "Diameter of Binary Tree explained: find the longest path between any two nodes, counted in edges, with one post-order traversal that returns each subtree's height, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `root` of a binary tree. The **diameter** is the number of edges on the longest path between any two nodes in the tree. The path may or may not go through the root, and it never visits a node twice. Return the diameter.

A tree with a single node has diameter 0. The tree has at least one node.

## Examples

- `[1, 2, 3, 4, 5]` → `3`. The path `4 → 2 → 1 → 3` has three edges.

```
      1
     / \
    2   3
   / \
  4   5
```

- `[1]` → `0`. One node, no edges.
- `[1, null, 2]` → `1`. Root and one child.
- `[1, 2, null, 3, 4, 5, null, null, 6, 7]` → `5`. The longest path `7 → 5 → 3 → 2 → 4 → 6` does not pass through the root; the best path through the root has only 4 edges.

```
        1
       /
      2
     / \
    3   4
   /     \
  5       6
 /
7
```

## Key idea

Every path has a unique **highest** node, the one closest to the root. At that node the path goes down into the left subtree as far as it can and down into the right subtree as far as it can, so its length is `height(left) + height(right)`, where the height of a subtree is the number of edges from its root to its deepest leaf (an empty subtree has height -1, a single node 0). So the diameter is the largest `height(left) + height(right)` over all nodes. One post-order traversal computes the height of every subtree bottom-up, and we update a running maximum at each node along the way.

## Approach

1. Keep a variable `best = 0` for the diameter found so far.
2. Define `height(node)`:
   1. If `node` is null, return -1 (no edges).
   2. Compute `left = height(node.left)` and `right = height(node.right)`.
   3. The longest path whose highest node is this one has `left + right + 2` edges (one edge down to each child, then their heights). Update `best = max(best, left + right + 2)`.
   4. Return `max(left, right) + 1`, this node's own height.
3. Call `height(root)` and return `best`.

The natural first idea computes the height of each node's children separately for every node, which repeats work and costs O(n²) on a skewed tree. Returning the height from the same recursion that updates the maximum does everything in one pass.

## Complexity

- **Time:** O(n). Each node is visited once.
- **Space:** O(h) for the recursion stack, where `h` is the height of the tree: O(log n) when balanced, O(n) for a chain.

## Common mistakes

- Returning the diameter from the recursion instead of the height. The function must return the *height* so the parent can compute its own candidate; the diameter lives in a separate variable.
- Assuming the longest path passes through the root and returning `height(root.left) + height(root.right) + 2`. The fourth example shows a tree where the best path is lower down.
- Mixing up edges and nodes. The problem counts edges, so a single node is 0 and two nodes are 1; counting nodes gives an answer that is one too large.
- Using 0 as the height of an empty subtree and then adding 2 at every node, which overcounts leaves. With the -1 convention, `left + right + 2` is exactly the path length through this node (for a leaf: `-1 + -1 + 2 = 0`).

## Follow-up questions

- *How do you do it without recursion?* Do a post-order traversal with an explicit stack and a map from node to height, or process nodes in reverse level order.
- *What about an N-ary tree?* Keep the two largest child heights at each node; the candidate is their sum plus 2.
- *What if the edges had weights?* The same recursion works, returning the heaviest downward path and combining the two heaviest children.

## Related problems

- [Binary Tree Maximum Path Sum](/interview/problems/binary-tree-maximum-path-sum/): the same "combine the two best child values at the highest node" recursion with sums instead of lengths.
- [Lowest Common Ancestor of a Binary Tree](/interview/problems/lowest-common-ancestor-of-a-binary-tree/): another post-order traversal that passes information up the tree.
- Maximum Depth of Binary Tree
- Balanced Binary Tree

## Solutions

```python
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        self.best = 0

        def height(node):  # edges from node to its deepest leaf; -1 for an empty subtree
            if node is None:
                return -1
            left = height(node.left)
            right = height(node.right)
            self.best = max(self.best, left + right + 2)  # longest path whose top is this node
            return max(left, right) + 1

        height(root)
        return self.best
```

```java
class Solution {
    private int best = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        best = 0;
        height(root);
        return best;
    }

    // Edges from node to its deepest leaf; -1 for an empty subtree.
    private int height(TreeNode node) {
        if (node == null) {
            return -1;
        }
        int left = height(node.left);
        int right = height(node.right);
        best = Math.max(best, left + right + 2); // longest path whose top is this node
        return Math.max(left, right) + 1;
    }
}
```

```cpp
class Solution {
public:
    int diameterOfBinaryTree(TreeNode* root) {
        best = 0;
        height(root);
        return best;
    }

private:
    int best = 0;

    // Edges from node to its deepest leaf; -1 for an empty subtree.
    int height(TreeNode* node) {
        if (node == nullptr) {
            return -1;
        }
        int left = height(node->left);
        int right = height(node->right);
        best = max(best, left + right + 2);  // longest path whose top is this node
        return max(left, right) + 1;
    }
};
```

```javascript
/**
 * @param {TreeNode} root
 * @return {number}
 */
var diameterOfBinaryTree = function (root) {
  let best = 0;
  // Edges from node to its deepest leaf; -1 for an empty subtree.
  const height = (node) => {
    if (node === null) {
      return -1;
    }
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right + 2); // longest path whose top is this node
    return Math.max(left, right) + 1;
  };
  height(root);
  return best;
};
```

```go
func diameterOfBinaryTree(root *TreeNode) int {
	best := 0
	// height returns the edges from node to its deepest leaf; -1 for an empty subtree.
	var height func(node *TreeNode) int
	height = func(node *TreeNode) int {
		if node == nil {
			return -1
		}
		left := height(node.Left)
		right := height(node.Right)
		best = max(best, left+right+2) // longest path whose top is this node
		return max(left, right) + 1
	}
	height(root)
	return best
}
```
