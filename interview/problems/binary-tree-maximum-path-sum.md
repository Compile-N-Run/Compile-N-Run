---
title: Binary Tree Maximum Path Sum
leetcode: binary-tree-maximum-path-sum
description: "Binary Tree Maximum Path Sum explained: find the largest sum of any path in a binary tree with negative values using one post-order DFS that returns the best downward branch, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `root` of a binary tree whose nodes hold integers, which may be negative. A *path* is a sequence of nodes where each pair of neighbours is connected by an edge, and no node appears twice. A path has at least one node, it does not have to pass through the root, and it can go up from one node and then down into another branch, like an upside-down V.

The *sum* of a path is the total of its node values. Return the largest sum of any path in the tree. The tree has at least one node.

## Examples

Trees are written in level order, with `null` for a missing child.

- `root = [2, 1, 3]` → `6`. The path `1 → 2 → 3` uses all three nodes.
- `root = [-8, 4, 6, null, null, 5, 7]` → `18`. The best path is `5 → 6 → 7`. Going through the root would add `-8`, which only hurts.
- `root = [-3]` → `-3`. The path must contain at least one node, so a negative answer is possible.
- `root = [-2, -5, -1]` → `-1`. Every value is negative, so the best path is the single largest node.

## Key idea

Every path has exactly one *highest* node, the place where it turns (or where it starts, if it only goes down). If we fix that top node, the best path through it is:

`node.val + (best downward path into the left child, or 0) + (best downward path into the right child, or 0)`

We take "or 0" because a branch with a negative total is better left out.

So for every node we need one number: the best sum of a path that **starts at this node and goes straight down** through at most one child. Call it the node's *gain*:

`gain(node) = node.val + max(0, gain(node.left), gain(node.right))`

A post-order DFS (children first, then the node) computes each gain from the children's gains. While doing so it also evaluates the V-shaped path that tops out at the current node and keeps the best one seen in a global maximum.

The subtle part is that the function **returns** one thing (the gain, a single branch, so the parent can extend it) but **records** another (the V-shaped sum, which cannot be extended because the parent cannot connect to both branches).

## Approach

1. Set `best` to minus infinity (or the root's value).
2. Define `gain(node)`:
   1. If `node` is empty, return `0`.
   2. `left = max(0, gain(node.left))` and `right = max(0, gain(node.right))`. Negative branches are dropped.
   3. Update `best = max(best, node.val + left + right)`: the best path whose top is this node.
   4. Return `node.val + max(left, right)`: the parent can extend only one branch.
3. Call `gain(root)` and return `best`.

Walking through `[-8, 4, 6, null, null, 5, 7]`: the leaves 4, 5 and 7 have gains 4, 5 and 7. At node 6, the V-shaped sum is `6 + 5 + 7 = 18`, so `best = 18`, and its gain is `6 + 7 = 13`. At the root, the V-shaped sum is `-8 + 4 + 13 = 9`, which does not beat 18.

The brute force tries every pair of nodes as the two ends of a path and sums the nodes between them: O(n²) pairs and O(n) per path. The single DFS visits each node once.

## Complexity

- **Time:** O(n). Each node is visited once and does constant work.
- **Space:** O(h), where h is the height of the tree, for the recursion stack. That is O(log n) for a balanced tree and O(n) for a chain.

## Common mistakes

- Returning `node.val + left + right` to the parent. A path cannot fork, so the parent may only extend one branch.
- Initialising `best` to `0`. For a tree of only negative values the answer is negative, and `0` would be wrong.
- Forgetting to clamp child gains at `0`, which forces a negative branch into the path.
- Clamping the final answer at `0`: only the branches are optional, the top node is always part of the path.

## Follow-up questions

- How would you return the path itself, not just its sum? (Store, at each node, which children were used, and rebuild the path from the node that set `best`.)
- What is the longest path counted in edges instead of values? (The same pattern gives Diameter of Binary Tree.)

## Related problems

- [Maximum Subarray](/interview/problems/maximum-subarray/)
- Diameter of Binary Tree
- Path Sum III
- Longest Univalue Path

## Solutions

```python
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = float('-inf')

        def gain(node):
            nonlocal best
            if not node:
                return 0
            left = max(0, gain(node.left))    # drop a negative branch
            right = max(0, gain(node.right))
            best = max(best, node.val + left + right)  # path that tops out here
            return node.val + max(left, right)         # parent can extend one branch

        gain(root)
        return best
```

```java
class Solution {
    private int best;

    public int maxPathSum(TreeNode root) {
        best = Integer.MIN_VALUE;
        gain(root);
        return best;
    }

    private int gain(TreeNode node) {
        if (node == null) {
            return 0;
        }
        int left = Math.max(0, gain(node.left)); // drop a negative branch
        int right = Math.max(0, gain(node.right));
        best = Math.max(best, node.val + left + right); // path that tops out here
        return node.val + Math.max(left, right);        // parent can extend one branch
    }
}
```

```cpp
class Solution {
    int best = INT_MIN;

    int gain(TreeNode* node) {
        if (!node) {
            return 0;
        }
        int left = max(0, gain(node->left));  // drop a negative branch
        int right = max(0, gain(node->right));
        best = max(best, node->val + left + right);  // path that tops out here
        return node->val + max(left, right);         // parent can extend one branch
    }

public:
    int maxPathSum(TreeNode* root) {
        best = INT_MIN;
        gain(root);
        return best;
    }
};
```

```javascript
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxPathSum = function (root) {
  let best = -Infinity;
  const gain = (node) => {
    if (!node) return 0;
    const left = Math.max(0, gain(node.left)); // drop a negative branch
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right); // path that tops out here
    return node.val + Math.max(left, right);        // parent can extend one branch
  };
  gain(root);
  return best;
};
```

```go
import "math"

func maxPathSum(root *TreeNode) int {
	best := math.MinInt
	var gain func(node *TreeNode) int
	gain = func(node *TreeNode) int {
		if node == nil {
			return 0
		}
		left := max(0, gain(node.Left)) // drop a negative branch
		right := max(0, gain(node.Right))
		best = max(best, node.Val+left+right) // path that tops out here
		return node.Val + max(left, right)    // parent can extend one branch
	}
	gain(root)
	return best
}
```
