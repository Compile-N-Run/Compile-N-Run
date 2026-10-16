---
title: Serialize and Deserialize Binary Tree
leetcode: serialize-and-deserialize-binary-tree
description: "Serialize and Deserialize Binary Tree explained: turn any binary tree into a string and back with a preorder walk that writes a marker for every missing child, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `Codec` with two methods:

- **serialize(root):** turn a binary tree into a single string.
- **deserialize(data):** turn such a string back into a tree with the same shape and the same values in every position.

You choose the format. The only requirement is that `deserialize(serialize(root))` rebuilds the original tree exactly, including for an empty tree (`root` is null). Node values are integers and may be negative, and the tree can have up to ten thousand nodes. In Go the class is `type Codec struct` with a `Constructor()` function and the methods `serialize` and `deserialize`.

## Examples

Below, trees are written level by level as LeetCode prints them, with `null` for a missing child.

- `[1, 2, 3, null, null, 4, 5]`: a root with children 2 and 3, where 3 has children 4 and 5. `serialize` returns some string, and `deserialize` of that string returns a tree that prints as `[1, 2, 3, null, null, 4, 5]` again.
- `[-5, null, 7]`: negative values and a one-sided tree must survive the round trip.
- `[]` (an empty tree): `serialize` returns a string (for the format below, `"#"`) and `deserialize` of it returns null.
- `[100, 20, 300]`: values with several digits must not be split into single characters.

With the format used here, `[1, 2, 3, null, null, 4, 5]` becomes `"1,2,#,#,3,4,#,#,5,#,#"`.

## Key idea

A plain preorder list of values is **not** enough to rebuild a tree: `[1, 2]` could be a root with a left child or with a right child. The fix is to record the missing children too. Write the tree in preorder (node, then left subtree, then right subtree) and write a marker such as `#` wherever a child is null. Now the string is unambiguous: when reading it back, the first token is the root, the tokens after it describe the entire left subtree, and whatever remains describes the right subtree. The same recursion that wrote the string reads it, consuming tokens from left to right.

## Approach

1. **serialize:** walk the tree in preorder and append tokens to a list: the value for a node, `#` for a null. Join the tokens with commas. Commas keep multi-digit and negative values intact.
2. **deserialize:** split the string on commas and keep a pointer to the next unread token. Define `build()`:
   1. Take the next token. If it is `#`, return null.
   2. Otherwise create a node with that value, then set `node.left = build()` and `node.right = build()`. The order matters: the left subtree's tokens come first in the string.
   3. Return the node.
3. The result of `deserialize` is `build()` called once; it consumes every token.

An equally good format is level order with null markers (what LeetCode's own test harness uses); it needs a queue instead of recursion. Preorder is shorter to write and the recursion mirrors the tree. For very deep trees (a chain of ten thousand nodes) replace the recursion with an explicit stack, or raise the recursion limit in Python.

## Complexity

- **Time:** O(n) for both methods. Each node and each null slot is written once and read once.
- **Space:** O(n) for the string and the token list, plus O(h) recursion depth where `h` is the height of the tree.

## Common mistakes

- Omitting the null markers and trying to rebuild from values alone, which cannot distinguish left from right children.
- Using no separator, so `12` and `1, 2` look the same, or so a minus sign merges with the previous token.
- Building the right subtree before the left one in `deserialize`, or reading tokens with a global index that is not advanced inside the recursion.
- Appending to a string in a loop in languages where strings are immutable (Java, Python), which is quadratic; collect tokens in a list and join once.
- Forgetting that `serialize(null)` must return something `deserialize` accepts (here `"#"`).

## Follow-up questions

- *Can you make the string shorter?* For a binary search tree the null markers are unnecessary: preorder alone rebuilds it using value bounds (Serialize and Deserialize BST). For general trees, a leaf could use a single marker for both of its missing children, or the values could be stored in binary.
- *How would you do it without recursion?* Use an explicit stack in preorder, or switch to level order with a queue.
- *How do you handle a tree whose values are strings that may contain the separator?* Length-prefix each value (`5:hello`) or escape the separator; this is the Encode and Decode Strings problem.

## Related problems

- [Lowest Common Ancestor of a Binary Tree](/interview/problems/lowest-common-ancestor-of-a-binary-tree/)
- [Binary Tree Maximum Path Sum](/interview/problems/binary-tree-maximum-path-sum/)
- Serialize and Deserialize BST
- Construct Binary Tree from Preorder and Inorder Traversal
- Encode and Decode Strings

## Solutions

```python
class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
        tokens = []

        def walk(node):
            if node is None:
                tokens.append('#')
                return
            tokens.append(str(node.val))
            walk(node.left)
            walk(node.right)

        walk(root)
        return ','.join(tokens)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        tokens = iter(data.split(','))

        def build():
            token = next(tokens)
            if token == '#':
                return None
            node = TreeNode(int(token))
            node.left = build()  # the left subtree's tokens come first
            node.right = build()
            return node

        return build()
```

```java
class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        walk(root, sb);
        sb.setLength(sb.length() - 1); // drop the trailing comma
        return sb.toString();
    }

    private void walk(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("#,");
            return;
        }
        sb.append(node.val).append(',');
        walk(node.left, sb);
        walk(node.right, sb);
    }

    private int next; // index of the next unread token

    public TreeNode deserialize(String data) {
        String[] tokens = data.split(",");
        next = 0;
        return build(tokens);
    }

    private TreeNode build(String[] tokens) {
        String token = tokens[next++];
        if (token.equals("#")) {
            return null;
        }
        TreeNode node = new TreeNode(Integer.parseInt(token));
        node.left = build(tokens); // the left subtree's tokens come first
        node.right = build(tokens);
        return node;
    }
}
```

```cpp
class Codec {
    void walk(TreeNode* node, string& out) {
        if (!node) {
            out += "#,";
            return;
        }
        out += to_string(node->val) + ',';
        walk(node->left, out);
        walk(node->right, out);
    }

    TreeNode* build(istringstream& in) {
        string token;
        getline(in, token, ',');
        if (token == "#") {
            return nullptr;
        }
        TreeNode* node = new TreeNode(stoi(token));
        node->left = build(in);  // the left subtree's tokens come first
        node->right = build(in);
        return node;
    }

public:
    string serialize(TreeNode* root) {
        string out;
        walk(root, out);
        out.pop_back();  // drop the trailing comma
        return out;
    }

    TreeNode* deserialize(string data) {
        istringstream in(data);
        return build(in);
    }
};
```

```javascript
/**
 * @param {TreeNode} root
 * @return {string}
 */
var serialize = function (root) {
  const tokens = [];
  const walk = (node) => {
    if (node === null) {
      tokens.push('#');
      return;
    }
    tokens.push(String(node.val));
    walk(node.left);
    walk(node.right);
  };
  walk(root);
  return tokens.join(',');
};

/**
 * @param {string} data
 * @return {TreeNode}
 */
var deserialize = function (data) {
  const tokens = data.split(',');
  let next = 0; // index of the next unread token
  const build = () => {
    const token = tokens[next++];
    if (token === '#') {
      return null;
    }
    const node = new TreeNode(Number(token));
    node.left = build(); // the left subtree's tokens come first
    node.right = build();
    return node;
  };
  return build();
};
```

```go
import (
	"strconv"
	"strings"
)

type Codec struct{}

func Constructor() Codec {
	return Codec{}
}

func (this *Codec) serialize(root *TreeNode) string {
	var tokens []string
	var walk func(node *TreeNode)
	walk = func(node *TreeNode) {
		if node == nil {
			tokens = append(tokens, "#")
			return
		}
		tokens = append(tokens, strconv.Itoa(node.Val))
		walk(node.Left)
		walk(node.Right)
	}
	walk(root)
	return strings.Join(tokens, ",")
}

func (this *Codec) deserialize(data string) *TreeNode {
	tokens := strings.Split(data, ",")
	next := 0 // index of the next unread token
	var build func() *TreeNode
	build = func() *TreeNode {
		token := tokens[next]
		next++
		if token == "#" {
			return nil
		}
		val, _ := strconv.Atoi(token)
		node := &TreeNode{Val: val}
		node.Left = build() // the left subtree's tokens come first
		node.Right = build()
		return node
	}
	return build()
}
```
