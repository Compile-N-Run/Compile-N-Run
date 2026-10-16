---
title: Lowest Common Ancestor of a Binary Tree
leetcode: lowest-common-ancestor-of-a-binary-tree
description: "Lowest Common Ancestor of a Binary Tree explained: find the deepest node that has two given nodes below it with one recursive depth-first search, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `root` of a binary tree (not necessarily a search tree) and two different nodes `p` and `q` from that tree. Return their **lowest common ancestor**: the deepest node that has both `p` and `q` in its subtree.

A node counts as part of its own subtree, so if `p` sits somewhere below `q`, the answer is `q` itself. All values in the tree are distinct, the tree has at least two nodes, and both `p` and `q` are guaranteed to be in it. You receive and return node objects, not values.

## Examples

All examples use this tree, written level by level as `[10, 4, 15, 1, 7, null, 20, null, null, 6, 9]`:

```
        10
       /  \
      4    15
     / \     \
    1   7    20
       / \
      6   9
```

- `p = 6`, `q = 9` → `7`, their parent.
- `p = 1`, `q = 9` → `4`. Node 1 is in 4's left subtree and node 9 in its right subtree.
- `p = 4`, `q = 6` → `4`. Node 6 is below node 4, and a node is its own ancestor.
- `p = 9`, `q = 20` → `10`. They are on different sides of the root.

## Key idea

Ask each subtree one question: "do you contain `p` or `q`?" A recursive function returns `p` or `q` if it finds one of them, or `null` if it finds neither. When a node gets a non-null answer from **both** its left and right subtrees, `p` and `q` are split across its two sides, so this node is the lowest common ancestor. If only one side answers, pass that answer up unchanged; it is either one of the targets or the ancestor already found lower down.

If the current node *is* `p` or `q`, return it right away without searching further. If the other target lies below it, the current node is the answer anyway; if the other target is elsewhere, some higher node will see answers from both sides.

## Approach

1. Define `lca(node)`:
   1. If `node` is null, return null.
   2. If `node` is `p` or `q`, return `node`.
   3. Compute `left = lca(node.left)` and `right = lca(node.right)`.
   4. If both are non-null, return `node`: `p` and `q` are on opposite sides.
   5. Otherwise return whichever of `left` and `right` is non-null (or null if both are).
2. The answer is `lca(root)`.

Another approach first records every node's parent (with a DFS or BFS), collects all ancestors of `p` in a set, then walks up from `q` until it reaches a node in that set. It is also O(n) but uses more memory and code.

## Complexity

- **Time:** O(n). Each node is visited at most once.
- **Space:** O(h) for the recursion stack, where `h` is the tree's height: O(log n) for a balanced tree, O(n) for a tree shaped like a chain.

## Common mistakes

- Using the binary search tree trick (go left if both values are smaller). This tree has no ordering, so values tell you nothing about where a node is.
- Comparing values when the problem hands you node objects. With distinct values it happens to work, but comparing the nodes themselves is the intended and safer check.
- Forgetting the case where one node is an ancestor of the other. The early return in step 1.2 handles it.
- Returning a boolean ("found or not") instead of a node, then struggling to report which node is the ancestor.

## Follow-up questions

- *What if `p` or `q` might not be in the tree?* The early return can then report a node that is not a real answer. Count how many targets were actually found during a full traversal and return null unless both were.
- *What if the tree is a binary search tree?* Walk down from the root: if both values are smaller go left, if both are larger go right, otherwise the current node is the answer. That is O(h) time and O(1) space.
- *What if each node has a parent pointer?* It becomes the "intersection of two linked lists" problem: walk up from both nodes.
- *What if the tree is very deep?* Rewrite the recursion with an explicit stack, or use the parent-map approach, to avoid a stack overflow.

## Related problems

- Lowest Common Ancestor of a Binary Search Tree
- Lowest Common Ancestor of a Binary Tree III (nodes have parent pointers)
- Lowest Common Ancestor of Deepest Leaves

## Solutions

```python
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if root is None or root is p or root is q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root  # p and q are on opposite sides
        return left or right
```

```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) {
            return root;
        }
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) {
            return root; // p and q are on opposite sides
        }
        return left != null ? left : right;
    }
}
```

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (root == nullptr || root == p || root == q) {
            return root;
        }
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) {
            return root;  // p and q are on opposite sides
        }
        return left ? left : right;
    }
};
```

```javascript
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function (root, p, q) {
  if (root === null || root === p || root === q) {
    return root;
  }
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left !== null && right !== null) {
    return root; // p and q are on opposite sides
  }
  return left !== null ? left : right;
};
```

```go
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
	if root == nil || root == p || root == q {
		return root
	}
	left := lowestCommonAncestor(root.Left, p, q)
	right := lowestCommonAncestor(root.Right, p, q)
	if left != nil && right != nil {
		return root // p and q are on opposite sides
	}
	if left != nil {
		return left
	}
	return right
}
```
