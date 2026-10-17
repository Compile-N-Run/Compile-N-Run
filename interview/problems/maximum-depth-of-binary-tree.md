---
title: Maximum Depth of Binary Tree
leetcode: maximum-depth-of-binary-tree
description: "Maximum Depth of Binary Tree explained: count the nodes on the longest root-to-leaf path with a short recursive depth-first search, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `root` of a binary tree, which may be empty. Return its **maximum depth**: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth `0`, a single node has depth `1`.

## Examples

- `[]` (no nodes) → `0`.
- `[7]` → `1`. The root is also a leaf.
- `[5, 3, 8, null, 4]` → `3`. The longest path is `5 → 3 → 4`.
- `[1, null, 2, null, 3, null, 4]` → `4`. Every node has only a right child, so the tree is a chain of four nodes.
- `[1, 2, 3, 4, 5, 6, 7]` → `3`. A full tree with three levels.

Trees are written level by level with `null` for a missing child, the way LeetCode prints them.

## Key idea

The depth of a tree is one more than the depth of its deeper subtree. That sentence is the whole algorithm: an empty tree has depth 0, and for any node you ask the same question of its left and right children and add one for the node itself. This "answer for a node = combine the answers of the children" shape is the template for most tree problems.

## Approach

1. If `root` is null, return `0`.
2. Compute `left = maxDepth(root.left)` and `right = maxDepth(root.right)`.
3. Return `1 + max(left, right)`.

The same count can be made level by level with a queue (breadth-first search): process one whole level per loop iteration and count the iterations. That avoids recursion and is handy for very deep trees, but is more code for the same O(n) work.

## Complexity

- **Time:** O(n). Every node is visited exactly once.
- **Space:** O(h) for the recursion stack, where `h` is the height: O(log n) for a balanced tree and O(n) for a chain.

## Common mistakes

- Returning `1` for an empty tree or `0` for a single node. The depth counts nodes, so an empty tree is `0` and a lone root is `1`.
- Counting only one side (for example always going left). The answer is the *maximum* over both children.
- Confusing depth with the number of edges; LeetCode's definition counts nodes, so a chain of four nodes has depth 4, not 3.

## Follow-up questions

- *How would you find the minimum depth?* Careful: a node with one child is not a leaf, so you cannot just swap `max` for `min`. Only take the minimum over children that exist.
- *Can you do it without recursion?* Yes, with a breadth-first search that counts levels, or an iterative depth-first search that stores `(node, depth)` pairs on a stack.
- *How would you decide whether the tree is height-balanced?* Compute depths bottom-up and return a sentinel (such as `-1`) as soon as two sibling depths differ by more than one.

## Related problems

- [Binary Tree Maximum Path Sum](/interview/problems/binary-tree-maximum-path-sum/)
- [Binary Tree Zigzag Level Order Traversal](/interview/problems/binary-tree-zigzag-level-order-traversal/)
- [Lowest Common Ancestor of a Binary Tree](/interview/problems/lowest-common-ancestor-of-a-binary-tree/)
- Minimum Depth of Binary Tree
- Balanced Binary Tree
- Diameter of Binary Tree

## Solutions

```python
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if root is None:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
```

```java
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}
```

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (root == nullptr) {
            return 0;
        }
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};
```

```javascript
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function (root) {
  if (root === null) {
    return 0;
  }
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
};
```

```go
func maxDepth(root *TreeNode) int {
	if root == nil {
		return 0
	}
	return 1 + max(maxDepth(root.Left), maxDepth(root.Right))
}
```
