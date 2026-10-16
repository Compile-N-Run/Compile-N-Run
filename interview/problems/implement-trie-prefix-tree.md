---
title: Implement Trie (Prefix Tree)
leetcode: implement-trie-prefix-tree
description: "Implement Trie (Prefix Tree) explained: build a tree of characters that inserts words and answers whole-word and prefix lookups in time proportional to the word length, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `Trie` that stores lowercase words and supports three operations:

- **insert(word):** add `word` to the trie.
- **search(word):** return `true` if exactly this word was inserted before, `false` otherwise.
- **startsWith(prefix):** return `true` if at least one inserted word begins with `prefix`.

All strings consist of lowercase English letters only and are non-empty. Inserting the same word twice is allowed and changes nothing. In Go the constructor is a function named `Constructor` and the methods are `Insert`, `Search` and `StartsWith`.

## Examples

Starting from an empty trie:

- `insert("card")`, then `search("card")` → `true`, `search("car")` → `false` (only a prefix was inserted, not the word), `startsWith("car")` → `true`.
- `insert("car")`, then `search("car")` → `true`. The shorter word now exists on its own.
- `startsWith("cat")` → `false`, `startsWith("c")` → `true`, `search("cards")` → `false`.
- On an empty trie, `search("a")` and `startsWith("a")` both return `false`.

## Key idea

A trie is a tree where each edge is a letter and each path from the root spells a prefix. Words that share a prefix share the same path, so `startsWith` is just "walk the path; does it exist?". To tell a whole word apart from a prefix of a longer word, every node carries an `end` flag that is set only on the last letter of an inserted word. `search` walks the path and then checks the flag; `startsWith` walks the path and ignores the flag.

Because the alphabet is just 26 lowercase letters, each node can hold a fixed array of 26 child slots indexed by `letter - 'a'`, which is faster and simpler than a hash map per node.

## Approach

1. Define a node with `children` (26 slots, initially empty) and a boolean `end`.
2. **insert(word):** start at the root. For each letter, if the child slot for it is empty, create a new node there; move to that child. After the last letter set `end = true` on the current node.
3. Write a helper `walk(s)` that follows the letters of `s` from the root and returns the node where the path ends, or nothing if some slot along the way is empty.
4. **search(word):** `node = walk(word)`; return `node` exists and `node.end` is `true`.
5. **startsWith(prefix):** `node = walk(prefix)`; return whether `node` exists.

A hash set of words would make `search` just as fast, but `startsWith` would need to scan every word, which is O(total length). The trie answers both in O(length of the query).

## Complexity

- **Time:** O(L) for each operation, where `L` is the length of the word or prefix; every step does one array lookup.
- **Space:** O(total letters inserted · 26) in the worst case, when no words share prefixes. Each node holds 26 pointers; a map per node trades speed for memory when the alphabet is large or the trie is sparse.

## Common mistakes

- Having `search` return `true` as soon as the path exists. `"car"` must not be found after only `"card"` was inserted; the `end` flag makes the difference.
- Setting `end` on every node along the path instead of only the last one.
- Forgetting to create the missing child during `insert`, or creating a fresh node even when the slot is already filled, which silently throws away earlier words that went through it.
- Putting the `end` flag at the root or on the edge instead of on the node that completes the word.

## Follow-up questions

- How would you support `delete(word)`? (Walk down, clear the flag, then remove nodes bottom-up while they have no children and are not an end.)
- How would you support `.` as a wildcard in search? (Design Add and Search Words Data Structure: branch into every child when you meet a `.`.)
- How many words start with a prefix? (Store a `count` in each node and increase it on every insert that passes through.)
- Use a trie to solve Word Search II: walk the board and the trie together so you only follow prefixes that exist.

## Related problems

- [Word Search](/interview/problems/word-search/)
- [Word Break](/interview/problems/word-break/)
- Design Add and Search Words Data Structure
- Word Search II

## Solutions

```python
class TrieNode:
    def __init__(self):
        self.children = [None] * 26
        self.end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            i = ord(ch) - ord('a')
            if node.children[i] is None:
                node.children[i] = TrieNode()
            node = node.children[i]
        node.end = True

    def _walk(self, s: str) -> Optional[TrieNode]:
        node = self.root
        for ch in s:
            node = node.children[ord(ch) - ord('a')]
            if node is None:
                return None
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None
```

```java
class Trie {
    private static class Node {
        Node[] children = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    public Trie() {}

    public void insert(String word) {
        Node node = root;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) {
                node.children[i] = new Node();
            }
            node = node.children[i];
        }
        node.end = true;
    }

    private Node walk(String s) {
        Node node = root;
        for (char ch : s.toCharArray()) {
            node = node.children[ch - 'a'];
            if (node == null) {
                return null;
            }
        }
        return node;
    }

    public boolean search(String word) {
        Node node = walk(word);
        return node != null && node.end;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }
}
```

```cpp
class Trie {
    struct Node {
        Node* children[26] = {};
        bool end = false;
    };

    Node* root;

    Node* walk(const string& s) const {
        Node* node = root;
        for (char ch : s) {
            node = node->children[ch - 'a'];
            if (node == nullptr) {
                return nullptr;
            }
        }
        return node;
    }

    static void destroy(Node* node) {
        for (Node* child : node->children) {
            if (child) destroy(child);
        }
        delete node;
    }

public:
    Trie() : root(new Node()) {}

    ~Trie() { destroy(root); }

    void insert(const string& word) {
        Node* node = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (node->children[i] == nullptr) {
                node->children[i] = new Node();
            }
            node = node->children[i];
        }
        node->end = true;
    }

    bool search(const string& word) const {
        Node* node = walk(word);
        return node != nullptr && node->end;
    }

    bool startsWith(const string& prefix) const {
        return walk(prefix) != nullptr;
    }
};
```

```javascript
var Trie = function () {
  this.root = { children: new Array(26).fill(null), end: false };
};

/**
 * @param {string} word
 * @return {void}
 */
Trie.prototype.insert = function (word) {
  let node = this.root;
  for (const ch of word) {
    const i = ch.charCodeAt(0) - 97;
    if (node.children[i] === null) {
      node.children[i] = { children: new Array(26).fill(null), end: false };
    }
    node = node.children[i];
  }
  node.end = true;
};

Trie.prototype.walk = function (s) {
  let node = this.root;
  for (const ch of s) {
    node = node.children[ch.charCodeAt(0) - 97];
    if (node === null) {
      return null;
    }
  }
  return node;
};

/**
 * @param {string} word
 * @return {boolean}
 */
Trie.prototype.search = function (word) {
  const node = this.walk(word);
  return node !== null && node.end;
};

/**
 * @param {string} prefix
 * @return {boolean}
 */
Trie.prototype.startsWith = function (prefix) {
  return this.walk(prefix) !== null;
};
```

```go
type trieNode struct {
	children [26]*trieNode
	end      bool
}

type Trie struct {
	root *trieNode
}

func Constructor() Trie {
	return Trie{root: &trieNode{}}
}

func (this *Trie) Insert(word string) {
	node := this.root
	for i := 0; i < len(word); i++ {
		c := word[i] - 'a'
		if node.children[c] == nil {
			node.children[c] = &trieNode{}
		}
		node = node.children[c]
	}
	node.end = true
}

func (this *Trie) walk(s string) *trieNode {
	node := this.root
	for i := 0; i < len(s); i++ {
		node = node.children[s[i]-'a']
		if node == nil {
			return nil
		}
	}
	return node
}

func (this *Trie) Search(word string) bool {
	node := this.walk(word)
	return node != nil && node.end
}

func (this *Trie) StartsWith(prefix string) bool {
	return this.walk(prefix) != nil
}
```
