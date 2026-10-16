---
title: Trie
topic: Trie
group: structures
description: "A trie stores words as a tree of characters so shared prefixes are stored once: the structure for autocomplete, prefix counts, wildcard search and pruning a word search on a grid."
---

## What it is

A trie (from re*trie*val, usually said "try") is a tree where every edge is one character. Walking down from the root spells a string, and a flag on a node says "a word ends here". Words that share a prefix share the path for it: `car`, `card` and `care` use the same three nodes and then branch.

Insert `car`, `card`, `care` and `dog` and you get:

```
root
├─ c ─ a ─ r*          (car)
│          ├─ d*       (card)
│          └─ e*       (care)
└─ d ─ o ─ g*          (dog)
```

The asterisks mark word ends. Looking up a word costs one step per character, however many words are stored. That is the point: a hash set tells you whether a whole word exists, but a trie also tells you whether a *prefix* exists, lets you list everything below a prefix, and lets you explore with wildcards, all without scanning the dictionary.

## When to use it

- Many words and many *prefix* queries: "does any word start with ...", autocomplete, search suggestions.
- You want to check characters one at a time and stop early when no word matches, for example while exploring a grid in Word Search II.
- Wildcards: "find a word matching `b.d`" is a small DFS over the trie.
- Counting: how many stored words start with a given prefix, or the sum of prefix scores.
- Numbers treated as bit strings: a *binary trie* answers "which stored number XORs best with x" in 32 steps.
- Replacing words by their shortest stored root, or finding the longest word built from other words.

## How it works

Each node holds a map (or a fixed array of 26 slots) from character to child, plus `isEnd`. The root is an empty node.

**Insert** starts at the root. For each character, follow the child for it, creating the child if it is missing. Mark the last node as a word end.

**Find a prefix** follows the same path but creates nothing: if the child is missing, the prefix is not there. **Search** is "find, then check `isEnd`"; **startsWith** is "find succeeded".

Trace on the trie above with `search("ca")`: root → `c` → `a`, both exist, but the `a` node has no end mark, so the answer is false. `startsWith("ca")` stops at the same node and answers true. `search("cat")`: root → `c` → `a`, then no `t` child, so false.

Anything per node can live beside `isEnd`: a count of words passing through (for prefix frequency), the whole word stored at the end node (so a grid search can report it without rebuilding the string), or an index into the original list.

## Template

```python
class TrieNode:
    def __init__(self):
        self.children = {}      # char -> TrieNode
        self.is_end = False     # a word ends at this node
        # add per-node data here when the problem needs it (count, word, ...)


def insert(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_end = True


def find(root, prefix):
    """The node where prefix ends, or None if the trie has no such path."""
    node = root
    for ch in prefix:
        node = node.children.get(ch)
        if node is None:
            return None
    return node


def search(root, word):
    node = find(root, word)
    return node is not None and node.is_end


def starts_with(root, prefix):
    return find(root, prefix) is not None


root = TrieNode()
for w in ["car", "card", "care", "dog"]:
    insert(root, w)
print(search(root, "card"), search(root, "ca"), starts_with(root, "ca"))  # True False True
```

```java
import java.util.*;

public class Main {
    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>(); // or TrieNode[26] for a-z
        boolean isEnd;                                       // a word ends at this node
        // add per-node data here when the problem needs it (count, word, ...)
    }

    static void insert(TrieNode root, String word) {
        TrieNode node = root;
        for (char ch : word.toCharArray()) {
            node = node.children.computeIfAbsent(ch, c -> new TrieNode());
        }
        node.isEnd = true;
    }

    // The node where prefix ends, or null if the trie has no such path.
    static TrieNode find(TrieNode root, String prefix) {
        TrieNode node = root;
        for (char ch : prefix.toCharArray()) {
            node = node.children.get(ch);
            if (node == null) return null;
        }
        return node;
    }

    static boolean search(TrieNode root, String word) {
        TrieNode node = find(root, word);
        return node != null && node.isEnd;
    }

    static boolean startsWith(TrieNode root, String prefix) {
        return find(root, prefix) != null;
    }

    public static void main(String[] args) {
        TrieNode root = new TrieNode();
        for (String w : new String[]{"car", "card", "care", "dog"}) insert(root, w);
        System.out.println(search(root, "card") + " " + search(root, "ca") + " " + startsWith(root, "ca")); // true false true
    }
}
```

```cpp
#include <iostream>
#include <string>
#include <unordered_map>

struct TrieNode {
    std::unordered_map<char, TrieNode*> children;  // or TrieNode* next[26] for a-z
    bool isEnd = false;                            // a word ends at this node
    // add per-node data here when the problem needs it (count, word, ...)
};

void insert(TrieNode* root, const std::string& word) {
    TrieNode* node = root;
    for (char ch : word) {
        if (!node->children.count(ch)) node->children[ch] = new TrieNode();
        node = node->children[ch];
    }
    node->isEnd = true;
}

// The node where prefix ends, or nullptr if the trie has no such path.
TrieNode* find(TrieNode* root, const std::string& prefix) {
    TrieNode* node = root;
    for (char ch : prefix) {
        auto it = node->children.find(ch);
        if (it == node->children.end()) return nullptr;
        node = it->second;
    }
    return node;
}

bool search(TrieNode* root, const std::string& word) {
    TrieNode* node = find(root, word);
    return node != nullptr && node->isEnd;
}

bool startsWith(TrieNode* root, const std::string& prefix) {
    return find(root, prefix) != nullptr;
}

int main() {
    TrieNode* root = new TrieNode();
    for (const char* w : {"car", "card", "care", "dog"}) insert(root, w);
    std::cout << std::boolalpha << search(root, "card") << ' ' << search(root, "ca") << ' '
              << startsWith(root, "ca") << '\n';  // true false true
}
```

```javascript
class TrieNode {
  constructor() {
    this.children = new Map();  // char -> TrieNode
    this.isEnd = false;         // a word ends at this node
    // add per-node data here when the problem needs it (count, word, ...)
  }
}

function insert(root, word) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch);
  }
  node.isEnd = true;
}

// The node where prefix ends, or null if the trie has no such path.
function find(root, prefix) {
  let node = root;
  for (const ch of prefix) {
    node = node.children.get(ch);
    if (node === undefined) return null;
  }
  return node;
}

function search(root, word) {
  const node = find(root, word);
  return node !== null && node.isEnd;
}

function startsWith(root, prefix) {
  return find(root, prefix) !== null;
}

const root = new TrieNode();
for (const w of ["car", "card", "care", "dog"]) insert(root, w);
console.log(search(root, "card"), search(root, "ca"), startsWith(root, "ca")); // true false true
```

```go
package main

import "fmt"

type TrieNode struct {
	children map[rune]*TrieNode // or [26]*TrieNode for a-z
	isEnd    bool               // a word ends at this node
	// add per-node data here when the problem needs it (count, word, ...)
}

func newNode() *TrieNode { return &TrieNode{children: map[rune]*TrieNode{}} }

func insert(root *TrieNode, word string) {
	node := root
	for _, ch := range word {
		if node.children[ch] == nil {
			node.children[ch] = newNode()
		}
		node = node.children[ch]
	}
	node.isEnd = true
}

// find returns the node where prefix ends, or nil if the trie has no such path.
func find(root *TrieNode, prefix string) *TrieNode {
	node := root
	for _, ch := range prefix {
		node = node.children[ch]
		if node == nil {
			return nil
		}
	}
	return node
}

func search(root *TrieNode, word string) bool {
	node := find(root, word)
	return node != nil && node.isEnd
}

func startsWith(root *TrieNode, prefix string) bool {
	return find(root, prefix) != nil
}

func main() {
	root := newNode()
	for _, w := range []string{"car", "card", "care", "dog"} {
		insert(root, w)
	}
	fmt.Println(search(root, "card"), search(root, "ca"), startsWith(root, "ca")) // true false true
}
```

## Variations

- **Array children** (`[26]` for lower-case letters) are faster and smaller than a map when the alphabet is fixed; index with `ch - 'a'`.
- **Counts per node**: increment on insert, decrement on delete, and "how many words start with p" is the count at p's node.
- **Wildcard search**: when the pattern character is `.`, try every child recursively; otherwise follow the one child.
- **Trie plus DFS on a grid**: walk the board and the trie together; when the trie has no child for the next cell, stop. This turns Word Search into Word Search II.
- **Binary trie for XOR**: insert each number's bits from the top bit down; for a query, at every level prefer the child with the opposite bit.
- **Deletion**: unmark the end node and, walking back up, remove children that have become empty, or simply keep counts and let empty nodes sit.

## Common mistakes

- Returning true from `search` when only a prefix matches. The end flag is the whole difference between `search` and `startsWith`.
- Creating nodes during a search (using an "insert if missing" accessor in both paths). Search must only read.
- Off-by-one with `ch - 'a'` when the input turns out to contain upper-case letters or digits; ask what the alphabet is.
- Rebuilding the trie for every query. Build once, query many times; that is where the speed comes from.
- Using a trie where a hash set of words would do. If there are no prefix queries, the trie is extra code for nothing.
- Recursion depth in wildcard search is bounded by the word length, which is fine, but a DFS over a grid *and* a trie needs a visited mark on the grid or it will revisit cells.

## Complexity

Insert, search and startsWith each cost O(L) for a word of length L, independent of how many words are stored. Space is O(total characters × alphabet size) in the worst case with array children, or O(total characters) with maps; sharing prefixes usually makes it much less.

## Where to start

1. 208. Implement Trie (Prefix Tree): insert, search and startsWith, the template itself.
2. [14. Longest Common Prefix](/interview/problems/longest-common-prefix/): solvable by scanning, but building a trie and walking down while every node has one child makes the idea concrete.
3. 211. Design Add and Search Words Data Structure: the wildcard DFS.
4. 648. Replace Words: walk each word down the trie and stop at the first end mark.
5. 1268. Search Suggestions System: collect up to three words under a prefix with a bounded DFS.
6. [139. Word Break](/interview/problems/word-break/): dynamic programming over a set of words; a trie lets you extend a match one character at a time instead of testing every substring.
7. 212. Word Search II: grid DFS pruned by the trie; the classic "why a trie" problem.
8. 421. Maximum XOR of Two Numbers in an Array: the binary trie.
