---
title: Asteroid Collision
leetcode: asteroid-collision
description: "Asteroid Collision explained: simulate asteroids moving left and right in a row and find which survive the crashes, using a stack in one pass, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `asteroids` describing asteroids lined up in a row, all moving at the same speed. The absolute value of each number is the asteroid's size and the sign is its direction: positive means it moves right, negative means it moves left. No value is zero.

When a right-moving asteroid meets a left-moving one, they collide. The smaller one explodes. If both have the same size, both explode. Two asteroids moving in the same direction never meet, and neither do a left-mover that is to the left of a right-mover (they fly apart).

Return the asteroids that are left after every possible collision has happened, in their original left-to-right order. The result can be empty.

## Examples

- `asteroids = [4, 9, -6]` → `[4, 9]`. The `-6` flies left into `9`, which is bigger, so `-6` explodes. `4` and `9` both move right and never meet.
- `asteroids = [7, -7]` → `[]`. Same size, so both explode.
- `asteroids = [-3, -1, 2, 5]` → `[-3, -1, 2, 5]`. The left-movers are already on the left and the right-movers on the right, so nothing collides.
- `asteroids = [3, 5, -8, 2]` → `[-8, 2]`. The `-8` destroys `5`, then `3`, and keeps flying left. The `2` behind it moves right, away from it.

## Key idea

A collision only happens when a left-moving asteroid arrives *after* (to the right of) a right-moving one. So read the asteroids from left to right and keep the survivors so far on a **stack**. When a new left-mover comes in, the only asteroid it can hit is the one on top of the stack, the closest survivor to its left. It keeps smashing through the top while the top is a smaller right-mover. This is the same pattern as matching brackets: the newest unresolved item is always the one that interacts next.

## Approach

1. Create an empty stack `stack` of survivors.
2. For each asteroid `a` from left to right:
   1. Assume it survives (`alive = true`).
   2. While `alive`, `a < 0` (moving left), and the top of the stack is positive (moving right):
      - If `top < -a`, the top explodes: pop it and keep checking.
      - If `top == -a`, both explode: pop the top, set `alive = false`.
      - Otherwise (`top > -a`) only `a` explodes: set `alive = false`.
   3. If `a` is still alive, push it.
3. The stack, read from bottom to top, is the answer.

A brute-force simulation scans the row again and again, removing one colliding pair per pass. That can take O(n²) time when a big asteroid has to plough through many small ones.

## Complexity

- **Time:** O(n). Every asteroid is pushed at most once and popped at most once.
- **Space:** O(n) for the stack (which is also the output).

## Common mistakes

- Treating `[-2, 3]` as a collision. A left-mover on the left and a right-mover on the right move apart. Only "positive on the stack, negative incoming" collides.
- Stopping after one collision. A large left-mover can destroy several right-movers in a row, so use a loop, not an `if`.
- Forgetting the equal-size case, where both asteroids are removed.
- Pushing the incoming asteroid after it has already exploded. Track whether it is still alive.

## Follow-up questions

- What if asteroids had different speeds? (Then order of collisions depends on time, and you need an event-based simulation instead of a single stack pass.)
- Can you do it without extra space? (Yes, by using the input array itself as the stack with a write pointer.)

## Related problems

- Valid Parentheses (the same stack-matching pattern)
- Daily Temperatures
- Remove All Adjacent Duplicates In String

## Solutions

```python
class Solution:
    def asteroidCollision(self, asteroids: List[int]) -> List[int]:
        stack = []
        for a in asteroids:
            alive = True
            # Only a left-mover (a < 0) arriving at a right-mover (top > 0) collides.
            while alive and a < 0 and stack and stack[-1] > 0:
                top = stack[-1]
                if top < -a:
                    stack.pop()          # top explodes, keep going
                elif top == -a:
                    stack.pop()          # both explode
                    alive = False
                else:
                    alive = False        # a explodes
            if alive:
                stack.append(a)
        return stack
```

```java
class Solution {
    public int[] asteroidCollision(int[] asteroids) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (int a : asteroids) {
            boolean alive = true;
            // Only a left-mover (a < 0) arriving at a right-mover (top > 0) collides.
            while (alive && a < 0 && !stack.isEmpty() && stack.peek() > 0) {
                int top = stack.peek();
                if (top < -a) {
                    stack.pop();          // top explodes, keep going
                } else if (top == -a) {
                    stack.pop();          // both explode
                    alive = false;
                } else {
                    alive = false;        // a explodes
                }
            }
            if (alive) {
                stack.push(a);
            }
        }
        int[] result = new int[stack.size()];
        for (int i = result.length - 1; i >= 0; i--) {
            result[i] = stack.pop();      // the top of the stack is the rightmost survivor
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<int> asteroidCollision(vector<int>& asteroids) {
        vector<int> stack;
        for (int a : asteroids) {
            bool alive = true;
            // Only a left-mover (a < 0) arriving at a right-mover (top > 0) collides.
            while (alive && a < 0 && !stack.empty() && stack.back() > 0) {
                int top = stack.back();
                if (top < -a) {
                    stack.pop_back();     // top explodes, keep going
                } else if (top == -a) {
                    stack.pop_back();     // both explode
                    alive = false;
                } else {
                    alive = false;        // a explodes
                }
            }
            if (alive) {
                stack.push_back(a);
            }
        }
        return stack;
    }
};
```

```javascript
/**
 * @param {number[]} asteroids
 * @return {number[]}
 */
var asteroidCollision = function (asteroids) {
  const stack = [];
  for (const a of asteroids) {
    let alive = true;
    // Only a left-mover (a < 0) arriving at a right-mover (top > 0) collides.
    while (alive && a < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -a) {
        stack.pop(); // top explodes, keep going
      } else if (top === -a) {
        stack.pop(); // both explode
        alive = false;
      } else {
        alive = false; // a explodes
      }
    }
    if (alive) {
      stack.push(a);
    }
  }
  return stack;
};
```

```go
func asteroidCollision(asteroids []int) []int {
	stack := []int{}
	for _, a := range asteroids {
		alive := true
		// Only a left-mover (a < 0) arriving at a right-mover (top > 0) collides.
		for alive && a < 0 && len(stack) > 0 && stack[len(stack)-1] > 0 {
			top := stack[len(stack)-1]
			if top < -a {
				stack = stack[:len(stack)-1] // top explodes, keep going
			} else if top == -a {
				stack = stack[:len(stack)-1] // both explode
				alive = false
			} else {
				alive = false // a explodes
			}
		}
		if alive {
			stack = append(stack, a)
		}
	}
	return stack
}
```
