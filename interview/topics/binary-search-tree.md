---
title: Binary Search Tree
topic: Binary Search Tree
group: graphs
description: "Binary search trees explained for interviews: the left-smaller, right-larger rule, why in-order traversal gives sorted values, how to search, insert and delete in O(height), with a template in Python, Java, C++, JavaScript and Go."
---

## What it is

A binary search tree (BST) is a binary tree with one extra rule: for every node, everything in its left subtree is smaller than the node's value and everything in its right subtree is larger. The rule applies to the *whole* subtree, not just the immediate children.

That single rule buys a lot. To find a value you start at the root and, at every node, go left if your target is smaller and right if it is larger, so a search touches one node per level: O(height) instead of O(n). Walking the tree in in-order (left, node, right) visits the values in sorted order. And "the k-th smallest", "the closest value", "the successor of x" all become short walks.

Everything from [Binary Tree](/interview/topics/binary-tree/) still applies: recursion with a base case, the three traversal orders, level order with a queue. This guide covers what the ordering rule adds.

## When to use it

- The problem says "binary search tree" or "BST" anywhere in the statement.
- You are asked to search, insert, or delete a value in a tree, or to check whether a tree is a valid BST.
- The question involves order: k-th smallest, closest value, range sum, successor or predecessor, "two nodes that sum to a target".
- You need to build a balanced tree from sorted input (a sorted array or linked list).
- Something sorted must support fast insertions as well as lookups. In an interview you would usually reach for a language's built-in ordered map, but the BST is what is underneath.

## How it works

**Search.** Start at the root. If the target equals the node's value, done. If it is smaller, move to the left child; if larger, to the right. Falling off the tree (reaching an empty child) means the value is absent. In this tree, searching for 7 goes 8 → 3 → 6 → 7, three comparisons for nine nodes:

```
          8
        /   \
       3     10
      / \      \
     1   6      14
        / \     /
       4   7   13
```

**Insert.** Search for the value; where the search falls off the tree, attach a new leaf there. Inserting 5 goes 8 → 3 → 6 → 4, then becomes 4's right child. Insertion never moves existing nodes.

**In-order gives sorted order.** Recursively visit the left subtree, then the node, then the right subtree: 1, 3, 4, 6, 7, 8, 10, 13, 14. This is the key to most BST questions. The k-th smallest value is the k-th value in-order; "is this a valid BST?" can be checked by confirming the in-order sequence is strictly increasing; the range sum of `[low, high]` is an in-order walk that skips subtrees entirely outside the range.

**Validation with bounds.** The other way to check validity is to carry a `(low, high)` window downwards: the root may be anything, its left child must be in `(low, root.val)`, its right child in `(root.val, high)`. Checking only `left.val < node.val < right.val` is the classic wrong answer, because a grandchild can break the rule while every parent-child pair looks fine.

**Delete.** Find the node. If it has no children, remove it. If it has one child, replace it with that child. If it has two, find its in-order successor (the smallest value in its right subtree: go right once, then left as far as possible), copy that value into the node, and delete the successor from the right subtree instead; the successor has at most one child, so that deletion is one of the easy cases.

**Balance.** All of these are O(height). A tree built from sorted input by repeated insertion is a chain, so height is n. Self-balancing trees (AVL, red-black) fix this by rotating after updates; interviews almost never ask you to implement one, but they do expect you to know that "O(log n)" assumes a balanced tree. To build a balanced BST from a sorted array, make the middle element the root and recurse on both halves.

## Template

Insert, search and an in-order walk, the three operations most BST problems are built from.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right


def insert(root, val):
    """Return the root after inserting val: smaller values go left, larger go right."""
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root


def search(root, target):
    """Walk down from the root, choosing a side at every step: O(height)."""
    node = root
    while node is not None and node.val != target:
        node = node.left if target < node.val else node.right
    return node  # None when target is absent


def inorder(root, out):
    """Left, node, right: visits a BST's values in sorted order."""
    if root is None:
        return
    inorder(root.left, out)
    out.append(root.val)  # problem-specific: do something with each value in sorted order
    inorder(root.right, out)


if __name__ == "__main__":
    root = None
    for v in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
        root = insert(root, v)
    values = []
    inorder(root, values)
    print(values)  # [1, 3, 4, 6, 7, 8, 10, 13, 14]
    print(search(root, 7) is not None, search(root, 5) is not None)  # True False
```

```java
import java.util.*;

public class Main {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // Return the root after inserting val: smaller values go left, larger go right.
    static TreeNode insert(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insert(root.left, val);
        else root.right = insert(root.right, val);
        return root;
    }

    // Walk down from the root, choosing a side at every step: O(height).
    static TreeNode search(TreeNode root, int target) {
        TreeNode node = root;
        while (node != null && node.val != target) {
            node = target < node.val ? node.left : node.right;
        }
        return node; // null when target is absent
    }

    // Left, node, right: visits a BST's values in sorted order.
    static void inorder(TreeNode root, List<Integer> out) {
        if (root == null) return;
        inorder(root.left, out);
        out.add(root.val); // problem-specific: do something with each value in sorted order
        inorder(root.right, out);
    }

    public static void main(String[] args) {
        TreeNode root = null;
        for (int v : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) root = insert(root, v);
        List<Integer> values = new ArrayList<>();
        inorder(root, values);
        System.out.println(values); // [1, 3, 4, 6, 7, 8, 10, 13, 14]
        System.out.println(search(root, 7) != null); // true
        System.out.println(search(root, 5) != null); // false
    }
}
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left = nullptr;
    TreeNode* right = nullptr;
    TreeNode(int v) : val(v) {}
};

// Return the root after inserting val: smaller values go left, larger go right.
TreeNode* insert(TreeNode* root, int val) {
    if (root == nullptr) return new TreeNode(val);
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}

// Walk down from the root, choosing a side at every step: O(height).
TreeNode* search(TreeNode* root, int target) {
    TreeNode* node = root;
    while (node != nullptr && node->val != target) {
        node = target < node->val ? node->left : node->right;
    }
    return node;  // nullptr when target is absent
}

// Left, node, right: visits a BST's values in sorted order.
void inorder(TreeNode* root, vector<int>& out) {
    if (root == nullptr) return;
    inorder(root->left, out);
    out.push_back(root->val);  // problem-specific: do something with each value in sorted order
    inorder(root->right, out);
}

int main() {
    TreeNode* root = nullptr;
    for (int v : {8, 3, 10, 1, 6, 14, 4, 7, 13}) root = insert(root, v);
    vector<int> values;
    inorder(root, values);
    for (int v : values) cout << v << ' ';
    cout << endl;  // 1 3 4 6 7 8 10 13 14
    cout << (search(root, 7) != nullptr) << ' ' << (search(root, 5) != nullptr) << endl;  // 1 0
}
```

```javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Return the root after inserting val: smaller values go left, larger go right.
function insert(root, val) {
  if (root === null) return new TreeNode(val);
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}

// Walk down from the root, choosing a side at every step: O(height).
function search(root, target) {
  let node = root;
  while (node !== null && node.val !== target) {
    node = target < node.val ? node.left : node.right;
  }
  return node; // null when target is absent
}

// Left, node, right: visits a BST's values in sorted order.
function inorder(root, out) {
  if (root === null) return;
  inorder(root.left, out);
  out.push(root.val); // problem-specific: do something with each value in sorted order
  inorder(root.right, out);
}

let root = null;
for (const v of [8, 3, 10, 1, 6, 14, 4, 7, 13]) root = insert(root, v);
const values = [];
inorder(root, values);
console.log(values); // [1, 3, 4, 6, 7, 8, 10, 13, 14]
console.log(search(root, 7) !== null, search(root, 5) !== null); // true false
```

```go
package main

import "fmt"

type TreeNode struct {
	Val         int
	Left, Right *TreeNode
}

// Return the root after inserting val: smaller values go left, larger go right.
func insert(root *TreeNode, val int) *TreeNode {
	if root == nil {
		return &TreeNode{Val: val}
	}
	if val < root.Val {
		root.Left = insert(root.Left, val)
	} else {
		root.Right = insert(root.Right, val)
	}
	return root
}

// Walk down from the root, choosing a side at every step: O(height).
func search(root *TreeNode, target int) *TreeNode {
	node := root
	for node != nil && node.Val != target {
		if target < node.Val {
			node = node.Left
		} else {
			node = node.Right
		}
	}
	return node // nil when target is absent
}

// Left, node, right: visits a BST's values in sorted order.
func inorder(root *TreeNode, out *[]int) {
	if root == nil {
		return
	}
	inorder(root.Left, out)
	*out = append(*out, root.Val) // problem-specific: do something with each value in sorted order
	inorder(root.Right, out)
}

func main() {
	var root *TreeNode
	for _, v := range []int{8, 3, 10, 1, 6, 14, 4, 7, 13} {
		root = insert(root, v)
	}
	var values []int
	inorder(root, &values)
	fmt.Println(values)                                     // [1 3 4 6 7 8 10 13 14]
	fmt.Println(search(root, 7) != nil, search(root, 5) != nil) // true false
}
```

## Variations

- **Early stopping in in-order.** For the k-th smallest, count visits during the in-order walk and stop at k. For "closest value", keep the best so far and prune: if the target is smaller than the node, the right subtree cannot contain anything closer than the node itself.
- **Iterative in-order with a stack.** Push nodes while going left; pop, visit, then go right. This is also how a BST iterator (`next()` and `hasNext()`) works, with O(height) memory.
- **Successor and predecessor.** The successor of x is the leftmost node of x's right subtree if it exists; otherwise it is the nearest ancestor for which x is in the left subtree. Walking down from the root while remembering the last time you turned left finds it without parent pointers.
- **Lowest common ancestor in a BST.** Walk from the root: if both targets are smaller go left, if both are larger go right, otherwise the current node is the answer. The general binary-tree version needs full recursion; the BST version is a single walk.

## Common mistakes

- Validating a BST by comparing each node only with its own children. Carry bounds downwards or check the in-order sequence.
- Using `<=` where the problem says values are distinct and strictly ordered (or the other way round). Read how duplicates are defined before writing the comparison.
- Assuming O(log n). A skewed BST has height n; say "O(h)" and explain when h is log n.
- Deleting a node with two children by cutting it out. Replace its value with the successor's and delete the successor instead.
- Forgetting to return the (possibly new) root from insert and delete, so the caller keeps the old pointer.

## Complexity

Search, insert and delete are O(h) where h is the height: O(log n) for a balanced tree, O(n) for a chain. In-order traversal is O(n). Building a balanced BST from a sorted array of n items is O(n) with the middle-element recursion.

## Where to start

1. 700. Search in a Binary Search Tree: the basic walk.
2. 701. Insert into a Binary Search Tree: the same walk, attaching a leaf at the end.
3. 98. Validate Binary Search Tree: bounds or in-order; the most-asked BST question.
4. 230. Kth Smallest Element in a BST: in-order with a counter.
5. 235. Lowest Common Ancestor of a Binary Search Tree: one walk using the ordering, then compare with [236. Lowest Common Ancestor of a Binary Tree](/interview/problems/lowest-common-ancestor-of-a-binary-tree/) to see what the rule saved you.
6. 108. Convert Sorted Array to Binary Search Tree: middle element as root, recurse on halves.
7. 450. Delete Node in a BST: all three deletion cases.
8. 173. Binary Search Tree Iterator: the stack-based in-order walk, paused between calls.
