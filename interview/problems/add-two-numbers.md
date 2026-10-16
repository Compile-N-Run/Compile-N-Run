---
title: Add Two Numbers
leetcode: add-two-numbers
description: "Add Two Numbers explained: add two non-negative integers stored as linked lists of digits in reverse order, digit by digit with a carry, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Two non-negative integers are each stored as a singly linked list of digits, with the **ones digit first**: the number 512 is the list `2 → 1 → 5`. Every node holds one digit from 0 to 9. Return the sum of the two numbers as a new linked list in the same reversed format.

Each list has between 1 and 100 nodes, and neither number has leading zeros, except the number 0 itself, which is the single node `0`. The lists can have different lengths.

## Examples

- `l1 = 2 → 1 → 5` (512), `l2 = 8 → 4` (48) → `0 → 6 → 5` (560).
- `l1 = 9 → 9` (99), `l2 = 1` (1) → `0 → 0 → 1` (100). The carry ripples all the way through and creates a new last digit.
- `l1 = 0`, `l2 = 0` → `0`.
- `l1 = 3`, `l2 = 4` → `7`.

## Key idea

This is exactly the addition you learned at school, done column by column from the right. The reversed order is a gift: the ones digits are at the heads of the lists, so you can walk both lists from the front, add the two digits plus the **carry** from the previous column, write down `sum % 10` and carry `sum / 10` (which is 0 or 1) to the next column.

## Approach

1. Create a dummy node to hang the result from, a pointer `tail` to the end of the result, and `carry = 0`.
2. While `l1` is not finished, or `l2` is not finished, or `carry` is not 0:
   1. Let `sum = carry`, plus `l1.val` if `l1` still has a node, plus `l2.val` if `l2` still has a node. Advance whichever lists you used.
   2. Append a new node with digit `sum % 10` after `tail`, and move `tail` to it.
   3. Set `carry = sum / 10` (integer division).
3. Return `dummy.next`, the first real digit.

Converting both lists to integers, adding and converting back looks simpler, but a 100-digit number overflows 64-bit integers in most languages. Digit-by-digit addition works for any length.

## Complexity

- **Time:** O(max(m, n)), where m and n are the lengths of the lists. Each loop iteration produces one digit.
- **Space:** O(max(m, n)) for the result list (at most one digit longer than the longer input). Apart from the output, only a few variables are used.

## Common mistakes

- Forgetting the final carry: `99 + 1` must produce three digits. Keeping `carry != 0` in the loop condition handles it.
- Stopping when the shorter list ends. Treat a finished list as contributing 0 and keep going.
- Turning the lists into numbers first, which overflows for long inputs.
- Reversing the output. The result is stored ones digit first, the same order you build it in.

## Follow-up questions

- What if the digits were stored with the most significant digit first? (Add Two Numbers II: reverse both lists first, or push the digits onto two stacks.)
- Can you reuse the nodes of the input lists instead of allocating new ones? (Yes, but it changes the inputs, which you should ask about first.)

## Related problems

- Add Two Numbers II
- Add Binary
- Multiply Strings

## Solutions

```python
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        carry = 0
        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next
            tail.next = ListNode(total % 10)
            tail = tail.next
            carry = total // 10
        return dummy.next
```

```java
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(), tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry;
            if (l1 != null) {
                sum += l1.val;
                l1 = l1.next;
            }
            if (l2 != null) {
                sum += l2.val;
                l2 = l2.next;
            }
            tail.next = new ListNode(sum % 10);
            tail = tail.next;
            carry = sum / 10;
        }
        return dummy.next;
    }
}
```

```cpp
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy;
        ListNode* tail = &dummy;
        int carry = 0;
        while (l1 || l2 || carry) {
            int sum = carry;
            if (l1) {
                sum += l1->val;
                l1 = l1->next;
            }
            if (l2) {
                sum += l2->val;
                l2 = l2->next;
            }
            tail->next = new ListNode(sum % 10);
            tail = tail->next;
            carry = sum / 10;
        }
        return dummy.next;
    }
};
```

```javascript
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
  const dummy = new ListNode();
  let tail = dummy;
  let carry = 0;
  while (l1 || l2 || carry) {
    let sum = carry;
    if (l1) {
      sum += l1.val;
      l1 = l1.next;
    }
    if (l2) {
      sum += l2.val;
      l2 = l2.next;
    }
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    carry = Math.floor(sum / 10);
  }
  return dummy.next;
};
```

```go
func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {
	dummy := &ListNode{}
	tail := dummy
	carry := 0
	for l1 != nil || l2 != nil || carry != 0 {
		sum := carry
		if l1 != nil {
			sum += l1.Val
			l1 = l1.Next
		}
		if l2 != nil {
			sum += l2.Val
			l2 = l2.Next
		}
		tail.Next = &ListNode{Val: sum % 10}
		tail = tail.Next
		carry = sum / 10
	}
	return dummy.Next
}
```
