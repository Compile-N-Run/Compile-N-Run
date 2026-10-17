---
title: Validate Binary Search Tree
leetcode: validate-binary-search-tree
description: "Validate Binary Search Tree explained: check that every node stays inside the open range its ancestors allow with one recursive pass and 64-bit or nullable bounds, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `root` of a binary tree. Decide whether it is a **valid binary search tree**: for every node, all values in its left subtree must be strictly smaller than the node's value, all values in its right subtree must be strictly larger, and both subtrees must themselves be valid binary search trees. Equal values are not allowed anywhere.

The tree has at least one node, and node values can be any 32-bit integer, including the smallest and largest ones. Return `true` or `false`.

## Examples

- `[8, 3, 10]` → `true`. 3 is smaller than 8 and 10 is larger.
- `[8, 3, 10, null, null, 6, 12]` → `false`. 6 sits in the right subtree of 8 but is smaller than 8, even though it is correctly placed under 10.
- `[5, 5]` → `false`. The left child equals its parent, and duplicates are not allowed.
- `[2147483647]` → `true`. A single node is always a valid tree, whatever its value.
- `[-2147483648, null, 2147483647]` → `true`. The two extreme values can still form a valid tree, so the solution must not use them as "impossible" sentinels.

## Key idea

Comparing each node with just its parent is not enough: in the second example every parent-child pair looks fine, yet 6 is on the wrong side of 8. What each node really needs is the range of values its **ancestors** allow. The root may hold anything. Going left tightens the upper bound to the parent's value; going right tightens the lower bound. Pass that open interval `(low, high)` down the recursion and reject a node the moment it falls outside.

The bounds start wide open, so they must be able to express "no limit". Either use a nullable value (`None` / `null`) or a wider type than the node values (64-bit), so the smallest and largest 32-bit integers are still legal node values.

## Approach

1. Define `valid(node, low, high)`, where `low` and `high` are exclusive bounds that may be "unbounded".
2. If `node` is empty, return `true`: an empty subtree never breaks the rule.
3. If `node.val <= low` or `node.val >= high`, return `false`.
4. Otherwise return `valid(node.left, low, node.val) and valid(node.right, node.val, high)`: the left child must stay below this value, the right child above it.
5. The answer is `valid(root, unbounded, unbounded)`.

An equivalent approach does an in-order traversal and checks that the values come out strictly increasing, keeping only the previous value. Both are linear; the range check is shown here because it extends naturally to questions like "which subtree breaks the rule" and needs no traversal order.

## Complexity

- **Time:** O(n). Every node is visited once and does constant work.
- **Space:** O(h) for the recursion stack, where `h` is the tree's height: O(log n) when balanced, O(n) for a chain.

## Common mistakes

- Checking only `left.val < node.val < right.val` for each node. That misses a grandchild on the wrong side of an ancestor (example 2).
- Using the 32-bit minimum and maximum as the initial bounds with a `<=` / `>=` test. A single node holding `2147483647` is then wrongly rejected. Use nullable bounds or 64-bit values.
- Allowing equal values on one side. The definition requires strictly smaller and strictly larger.
- Forgetting that the empty tree is valid, which turns the base case into a crash or a `false`.

## Follow-up questions

- *Can you do it iteratively?* Yes: an in-order traversal with an explicit stack, comparing each value with the previous one, uses no recursion and stops at the first violation.
- *What if duplicates were allowed on one side (say, left `<=`)?* Change one comparison in step 3 and pass the bound accordingly; the structure stays the same.
- *How would you find the two swapped nodes that break a BST?* Recover Binary Search Tree: in-order traversal, record the two places where the sequence decreases.

## Related problems

- [Lowest Common Ancestor of a Binary Tree](/interview/problems/lowest-common-ancestor-of-a-binary-tree/)
- [Binary Tree Maximum Path Sum](/interview/problems/binary-tree-maximum-path-sum/)
- Kth Smallest Element in a BST
- Recover Binary Search Tree

## Solutions

```python
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def valid(node, low, high):  # low/high are exclusive bounds, None means unbounded
            if node is None:
                return True
            if (low is not None and node.val <= low) or (high is not None and node.val >= high):
                return False
            return valid(node.left, low, node.val) and valid(node.right, node.val, high)

        return valid(root, None, None)
```

```java
class Solution {
    public boolean isValidBST(TreeNode root) {
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    // low/high are exclusive bounds; long keeps every int value legal at the root
    private boolean valid(TreeNode node, long low, long high) {
        if (node == null) {
            return true;
        }
        if (node.val <= low || node.val >= high) {
            return false;
        }
        return valid(node.left, low, node.val) && valid(node.right, node.val, high);
    }
}
```

```cpp
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return valid(root, LLONG_MIN, LLONG_MAX);
    }

private:
    // low/high are exclusive bounds; long long keeps every int value legal at the root
    bool valid(TreeNode* node, long long low, long long high) {
        if (node == nullptr) {
            return true;
        }
        if (node->val <= low || node->val >= high) {
            return false;
        }
        return valid(node->left, low, node->val) && valid(node->right, node->val, high);
    }
};
```

```javascript
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isValidBST = function (root) {
  // low/high are exclusive bounds; the infinities leave the root unbounded
  const valid = (node, low, high) => {
    if (node === null) {
      return true;
    }
    if (node.val <= low || node.val >= high) {
      return false;
    }
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
  };
  return valid(root, -Infinity, Infinity);
};
```

```go
import "math"

func isValidBST(root *TreeNode) bool {
	return validBST(root, math.MinInt64, math.MaxInt64)
}

// low/high are exclusive bounds; the 64-bit extremes keep every int32 value legal at the root
func validBST(node *TreeNode, low, high int) bool {
	if node == nil {
		return true
	}
	if node.Val <= low || node.Val >= high {
		return false
	}
	return validBST(node.Left, low, node.Val) && validBST(node.Right, node.Val, high)
}
```
