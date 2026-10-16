---
title: LRU Cache
leetcode: lru-cache
description: "LRU Cache explained: build a fixed-size key-value cache that evicts the least recently used key, with O(1) get and put using a hash map plus a doubly linked list, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `LRUCache` that stores integer keys and integer values, and holds at most `capacity` entries (capacity is at least 1). It supports three operations:

- **Constructor(capacity):** create an empty cache with room for `capacity` entries.
- **get(key):** return the value stored for `key`, or `-1` if the key is not in the cache. A successful `get` counts as *using* the key.
- **put(key, value):** store `value` under `key`. If the key already exists, overwrite its value. Either way the key becomes the most recently used one. If adding a new key makes the cache hold more than `capacity` entries, remove the entry that was used *least recently*.

Both `get` and `put` must run in O(1) average time. In Go the constructor is a function named `Constructor` and the methods are `Get` and `Put`.

## Examples

Capacity `2`:

- `put(1, 10)`, `put(2, 20)` → the cache holds keys 1 and 2.
- `get(1)` → `10`. Key 1 is now the most recently used, so key 2 is the oldest.
- `put(3, 30)` → the cache is over capacity, so key 2 (least recently used) is evicted.
- `get(2)` → `-1` because it was evicted; `get(3)` → `30`; `get(1)` → `10`.

Capacity `1`: `put(5, 50)`, `put(6, 60)`, then `get(5)` → `-1` and `get(6)` → `60`. With room for one entry, every new key pushes out the previous one.

## Key idea

We need two things at once: find a key's value quickly, and know which key was used longest ago. A **hash map** gives fast lookup by key, and a **doubly linked list** keeps the entries ordered by recency: most recent at the front, least recent at the back. The map stores a pointer to each key's list node, so we can jump straight to a node and unlink it in O(1), because a doubly linked node knows both of its neighbours. "Using" a key means moving its node to the front; evicting means removing the node at the back.

## Approach

1. Create a doubly linked list with two dummy (sentinel) nodes, `head` and `tail`. Real entries live between them, newest right after `head`, oldest right before `tail`. The sentinels mean you never have to special-case an empty list.
2. Keep a hash map `nodes` from key to its list node.
3. Write two small helpers: `remove(node)` links the node's neighbours to each other, and `addFront(node)` inserts the node right after `head`.
4. **get(key):** if the key is not in `nodes`, return `-1`. Otherwise move its node to the front (`remove` then `addFront`) and return its value.
5. **put(key, value):**
   1. If the key exists, update the node's value and move it to the front.
   2. Otherwise create a node, add it to the map and to the front of the list.
   3. If the map now holds more than `capacity` entries, take the node just before `tail` (the least recently used), remove it from the list and delete its key from the map. This is why each node stores its key, not just its value.

A simpler idea keeps keys in an array or a plain list ordered by use, but moving a key to the front then means searching for it, which is O(n) per operation.

## Complexity

- **Time:** O(1) average for both `get` and `put`. Each does a constant number of hash map operations and pointer updates.
- **Space:** O(capacity) for the map and the list nodes.

## Common mistakes

- Forgetting that `get` also counts as a use. A key that was just read must not be the next one evicted.
- Forgetting to move an existing key to the front when `put` overwrites it.
- Evicting before inserting when the key already exists: an overwrite never changes the size, so nothing should be evicted.
- Removing the node from the list but not its key from the map (or the other way round). The two structures must always hold the same keys.
- Storing only the value in the list node. When you evict the last node you need its key to delete it from the map.

## Follow-up questions

- Many languages have a built-in ordered map (`OrderedDict` in Python, `LinkedHashMap` in Java). Interviewers usually accept it only after you can explain the map-plus-list design it hides.
- How would you make the cache safe to use from several threads? (Guard both structures with one lock, or shard the cache.)
- How would an LFU (least *frequently* used) cache differ?

## Related problems

- LFU Cache
- Design HashMap

## Solutions

```python
class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.nodes = {}  # key -> Node
        self.head, self.tail = Node(), Node()  # sentinels: newest after head, oldest before tail
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node: Node) -> None:
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node: Node) -> None:
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        node = self.nodes.get(key)
        if node is None:
            return -1
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        node = self.nodes.get(key)
        if node is not None:
            node.val = value
            self._remove(node)
            self._add_front(node)
            return
        node = Node(key, value)
        self.nodes[key] = node
        self._add_front(node)
        if len(self.nodes) > self.capacity:
            oldest = self.tail.prev
            self._remove(oldest)
            del self.nodes[oldest.key]
```

```java
class LRUCache {
    private static class Node {
        int key, val;
        Node prev, next;
        Node(int key, int val) { this.key = key; this.val = val; }
    }

    private final int capacity;
    private final Map<Integer, Node> nodes = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0); // sentinels

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addFront(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {
        Node node = nodes.get(key);
        if (node == null) {
            return -1;
        }
        remove(node);
        addFront(node);
        return node.val;
    }

    public void put(int key, int value) {
        Node node = nodes.get(key);
        if (node != null) {
            node.val = value;
            remove(node);
            addFront(node);
            return;
        }
        node = new Node(key, value);
        nodes.put(key, node);
        addFront(node);
        if (nodes.size() > capacity) {
            Node oldest = tail.prev;
            remove(oldest);
            nodes.remove(oldest.key);
        }
    }
}
```

```cpp
class LRUCache {
    struct Node {
        int key, val;
        Node *prev = nullptr, *next = nullptr;
        Node(int k, int v) : key(k), val(v) {}
    };

    int capacity;
    unordered_map<int, Node*> nodes;
    Node *head, *tail;  // sentinels: newest after head, oldest before tail

    void remove(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void addFront(Node* node) {
        node->prev = head;
        node->next = head->next;
        head->next->prev = node;
        head->next = node;
    }

public:
    LRUCache(int capacity) : capacity(capacity), head(new Node(0, 0)), tail(new Node(0, 0)) {
        head->next = tail;
        tail->prev = head;
    }

    ~LRUCache() {
        for (Node* node = head; node;) {
            Node* next = node->next;
            delete node;
            node = next;
        }
    }

    int get(int key) {
        auto it = nodes.find(key);
        if (it == nodes.end()) {
            return -1;
        }
        Node* node = it->second;
        remove(node);
        addFront(node);
        return node->val;
    }

    void put(int key, int value) {
        auto it = nodes.find(key);
        if (it != nodes.end()) {
            Node* node = it->second;
            node->val = value;
            remove(node);
            addFront(node);
            return;
        }
        Node* node = new Node(key, value);
        nodes[key] = node;
        addFront(node);
        if ((int)nodes.size() > capacity) {
            Node* oldest = tail->prev;
            remove(oldest);
            nodes.erase(oldest->key);
            delete oldest;
        }
    }
};
```

```javascript
/**
 * @param {number} capacity
 */
var LRUCache = function (capacity) {
  this.capacity = capacity;
  this.nodes = new Map(); // key -> node
  this.head = { key: 0, val: 0, prev: null, next: null }; // sentinels
  this.tail = { key: 0, val: 0, prev: null, next: null };
  this.head.next = this.tail;
  this.tail.prev = this.head;
};

LRUCache.prototype.remove = function (node) {
  node.prev.next = node.next;
  node.next.prev = node.prev;
};

LRUCache.prototype.addFront = function (node) {
  node.prev = this.head;
  node.next = this.head.next;
  this.head.next.prev = node;
  this.head.next = node;
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function (key) {
  const node = this.nodes.get(key);
  if (node === undefined) {
    return -1;
  }
  this.remove(node);
  this.addFront(node);
  return node.val;
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function (key, value) {
  let node = this.nodes.get(key);
  if (node !== undefined) {
    node.val = value;
    this.remove(node);
    this.addFront(node);
    return;
  }
  node = { key, val: value, prev: null, next: null };
  this.nodes.set(key, node);
  this.addFront(node);
  if (this.nodes.size > this.capacity) {
    const oldest = this.tail.prev;
    this.remove(oldest);
    this.nodes.delete(oldest.key);
  }
};
```

```go
type lruNode struct {
	key, val   int
	prev, next *lruNode
}

type LRUCache struct {
	capacity   int
	nodes      map[int]*lruNode
	head, tail *lruNode // sentinels: newest after head, oldest before tail
}

func Constructor(capacity int) LRUCache {
	head, tail := &lruNode{}, &lruNode{}
	head.next, tail.prev = tail, head
	return LRUCache{capacity: capacity, nodes: make(map[int]*lruNode), head: head, tail: tail}
}

func (this *LRUCache) remove(node *lruNode) {
	node.prev.next = node.next
	node.next.prev = node.prev
}

func (this *LRUCache) addFront(node *lruNode) {
	node.prev, node.next = this.head, this.head.next
	this.head.next.prev = node
	this.head.next = node
}

func (this *LRUCache) Get(key int) int {
	node, ok := this.nodes[key]
	if !ok {
		return -1
	}
	this.remove(node)
	this.addFront(node)
	return node.val
}

func (this *LRUCache) Put(key int, value int) {
	if node, ok := this.nodes[key]; ok {
		node.val = value
		this.remove(node)
		this.addFront(node)
		return
	}
	node := &lruNode{key: key, val: value}
	this.nodes[key] = node
	this.addFront(node)
	if len(this.nodes) > this.capacity {
		oldest := this.tail.prev
		this.remove(oldest)
		delete(this.nodes, oldest.key)
	}
}
```
