---
title: Binary Tree Zigzag Level Order Traversal
leetcode: binary-tree-zigzag-level-order-traversal
description: "Binary Tree Zigzag Level Order Traversal explained: list a tree's values level by level, alternating left-to-right and right-to-left, with a breadth-first search that reverses every other level, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `root` of a binary tree, which may be empty. Return its values grouped by level, as a list of lists, but **alternate the direction** of each level: the first level (the root) is read left to right, the second level right to left, the third left to right again, and so on.

The result for an empty tree is an empty list.

## Examples

Trees are written level by level with `null` for a missing child, the way LeetCode prints them.

- `[]` → `[]`.
- `[8]` → `[[8]]`.
- `[1, 2, 3, 4, 5, 6, 7]` → `[[1], [3, 2], [4, 5, 6, 7]]`. The second level is reversed, the third is not.
- `[4, 2, 7, 1, null, null, 9]` → `[[4], [7, 2], [1, 9]]`. Missing children simply do not appear; the third level still reads left to right.
- `[1, 2, null, 3, null, 4]` → `[[1], [2], [3], [4]]`. One node per level, so reversing changes nothing.

## Key idea

This is an ordinary level-order traversal with one twist. A **breadth-first search** with a queue visits nodes level by level: if you note how many nodes are in the queue at the start of a level, exactly that many pops belong to the level, and their children, pushed in the meantime, form the next level. Collect each level left to right as usual, then **reverse every second level** before storing it. Flipping the finished list is simpler and less error-prone than trying to pop from alternating ends of a deque.

## Approach

1. If `root` is null, return an empty list.
2. Put `root` in a queue and set a flag `leftToRight = true`.
3. While the queue is not empty:
   1. Let `size` be the queue's current length; this is the number of nodes in the current level.
   2. Pop `size` nodes, appending each value to a `level` list and pushing the node's non-null children.
   3. If `leftToRight` is false, reverse `level`.
   4. Append `level` to the result and flip the flag.
4. Return the result.

Alternatives: write values into a pre-sized level array at index `size - 1 - i` when going right to left, which avoids the reverse; or do a depth-first search that passes the depth down and appends to `result[depth]`, reversing odd levels at the end. All are O(n).

## Complexity

- **Time:** O(n). Each node is pushed and popped once; the reversals add up to at most n element moves.
- **Space:** O(w) for the queue, where `w` is the widest level (up to about n/2 for a full tree), plus the output.

## Common mistakes

- Reversing the wrong levels: the root level is level 0 and reads left to right, so levels 1, 3, 5, … are the reversed ones.
- Not snapshotting the queue length before the inner loop, so children pushed during a level get counted as part of it.
- Changing the order in which children are *pushed* for alternate levels. That breaks the levels that follow; only the output order of a level should change.
- Forgetting the empty tree, which must return `[]`, not `[[]]`.

## Follow-up questions

- *Can you avoid the reversal?* Yes: use a deque for the level and append to the front when going right to left, or fill a fixed-size array from the end.
- *How would you return the levels bottom-up?* Build them normally and reverse the outer list (Binary Tree Level Order Traversal II).
- *How would you print only the rightmost value of each level?* Same BFS; keep the last value of each level (Binary Tree Right Side View).

## Related problems

- [Maximum Depth of Binary Tree](/interview/problems/maximum-depth-of-binary-tree/)
- [Serialize and Deserialize Binary Tree](/interview/problems/serialize-and-deserialize-binary-tree/)
- Binary Tree Level Order Traversal
- Binary Tree Right Side View

## Solutions

```python
class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if root is None:
            return []
        result, queue, left_to_right = [], deque([root]), True
        while queue:
            level = []
            for _ in range(len(queue)):  # exactly the nodes of this level
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            if not left_to_right:
                level.reverse()
            result.append(level)
            left_to_right = not left_to_right
        return result
```

```java
class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) {
            return result;
        }
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        boolean leftToRight = true;
        while (!queue.isEmpty()) {
            int size = queue.size(); // exactly the nodes of this level
            List<Integer> level = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            if (!leftToRight) {
                Collections.reverse(level);
            }
            result.add(level);
            leftToRight = !leftToRight;
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (root == nullptr) {
            return result;
        }
        queue<TreeNode*> q;
        q.push(root);
        bool leftToRight = true;
        while (!q.empty()) {
            int size = q.size();  // exactly the nodes of this level
            vector<int> level;
            level.reserve(size);
            for (int i = 0; i < size; i++) {
                TreeNode* node = q.front();
                q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            if (!leftToRight) {
                reverse(level.begin(), level.end());
            }
            result.push_back(level);
            leftToRight = !leftToRight;
        }
        return result;
    }
};
```

```javascript
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var zigzagLevelOrder = function (root) {
  const result = [];
  if (root === null) {
    return result;
  }
  let queue = [root];
  let leftToRight = true;
  while (queue.length) {
    const level = [];
    const next = []; // the children form the next level
    for (const node of queue) {
      level.push(node.val);
      if (node.left !== null) next.push(node.left);
      if (node.right !== null) next.push(node.right);
    }
    if (!leftToRight) {
      level.reverse();
    }
    result.push(level);
    leftToRight = !leftToRight;
    queue = next;
  }
  return result;
};
```

```go
func zigzagLevelOrder(root *TreeNode) [][]int {
	result := [][]int{}
	if root == nil {
		return result
	}
	queue := []*TreeNode{root}
	leftToRight := true
	for len(queue) > 0 {
		size := len(queue) // exactly the nodes of this level
		level := make([]int, 0, size)
		for i := 0; i < size; i++ {
			node := queue[0]
			queue = queue[1:]
			level = append(level, node.Val)
			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}
		if !leftToRight {
			for i, j := 0, len(level)-1; i < j; i, j = i+1, j-1 {
				level[i], level[j] = level[j], level[i]
			}
		}
		result = append(result, level)
		leftToRight = !leftToRight
	}
	return result
}
```
