---
title: Stack
topic: Stack
group: structures
description: "Stacks in coding interviews: last-in first-out storage, why it matches nesting and undo problems, the push-or-pop loop that solves most of them, and which problems to practise first."
---

## What it is

A stack is a list you only touch at one end. You `push` an item on top, `pop` the top item off, and `peek` at the top without removing it. The last thing pushed is the first thing popped, so people say LIFO: last in, first out.

That one rule is enough to model anything that nests or that must be undone in reverse order. An opening bracket waits on the stack until its closing bracket arrives; the most recent opening bracket is the one that must close first. A function call waits on the call stack until the function it called returns. A text editor's undo history pops the most recent edit first. Whenever you catch yourself thinking "I need to remember this until something later resolves it, and the most recent one resolves first", you want a stack.

There is no special library type needed. A dynamic array with `append`/`pop` (Python list, Java `ArrayDeque`, C++ `std::vector` or `std::stack`, JavaScript array, Go slice) is a stack.

## When to use it

- Brackets, tags, or quotes that must be balanced and properly nested.
- Expressions to evaluate or parse: operators with precedence, nested `k[...]` encodings, file paths with `..`.
- "Process in reverse order of arrival": undo, backtracking without recursion, reversing a list.
- Pairs of things that cancel each other on contact: asteroids moving towards each other, adjacent duplicate letters, backspaces in typed text.
- Recursion that is forbidden or too deep: an explicit stack holds the frames you would otherwise put on the call stack (iterative tree traversals, DFS).
- "Nearest element to the left/right that is larger/smaller": that is the monotonic stack, a cousin with its own guide.

## How it works

The core loop looks at each token in order and decides: does this token *open* something (push it), or does it *resolve* something already on the stack (pop and check)? At the end the stack should be in a known state, usually empty.

Check whether `"{[()]}("` has balanced brackets. Opening brackets are pushed; a closing bracket must match the top.

| token | action | stack after |
|---|---|---|
| `{` | push | `{` |
| `[` | push | `{ [` |
| `(` | push | `{ [ (` |
| `)` | top is `(`, matches, pop | `{ [` |
| `]` | top is `[`, matches, pop | `{` |
| `}` | top is `{`, matches, pop | empty |
| `(` | push | `(` |

End of input with a non-empty stack: not balanced. Two other failures can happen mid-loop: a closing bracket arrives when the stack is empty, or the top does not match (`"(]"`).

The same loop with different "resolve" rules handles the rest of the tag. For `k[encoded]` decoding, `[` pushes the current count and the string built so far; `]` pops them and repeats. For a calculator, a digit extends the current number, an operator decides whether the previous number is pushed as is, negated, or multiplied into the top. For a path simplifier, `..` pops a directory and a name pushes one. For colliding asteroids, a left-moving asteroid keeps popping smaller right-moving ones until it survives or dies.

## Template

The skeleton is the push-or-resolve loop with the two rules left as comments. The `main` runs the bracket example.

```python
def process(tokens):
    """Walk the tokens once; push the ones that open, pop for the ones that resolve."""
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}   # problem-specific pairing
    for tok in tokens:
        if tok in pairs:                     # problem-specific: does this token resolve something?
            if not stack or stack[-1] != pairs[tok]:
                return False                 # nothing to resolve, or the wrong thing
            stack.pop()
        else:                                # otherwise it opens something: remember it
            stack.append(tok)
    return not stack                         # problem-specific: what the final stack must look like


if __name__ == "__main__":
    print(process("{[()]}"))   # True
    print(process("{[()]}("))  # False
```

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    /** Walks the tokens once; pushes the ones that open, pops for the ones that resolve. */
    static boolean process(String tokens) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char tok : tokens.toCharArray()) {
            char opens = opener(tok);                // problem-specific: does this token resolve something?
            if (opens != 0) {
                if (stack.isEmpty() || stack.peek() != opens) {
                    return false;                    // nothing to resolve, or the wrong thing
                }
                stack.pop();
            } else {                                 // otherwise it opens something: remember it
                stack.push(tok);
            }
        }
        return stack.isEmpty();                      // problem-specific: what the final stack must look like
    }

    /** The opener a closing token resolves, or 0 if the token is not a closer. */
    static char opener(char tok) {
        switch (tok) {
            case ')': return '(';
            case ']': return '[';
            case '}': return '{';
            default: return 0;
        }
    }

    public static void main(String[] args) {
        System.out.println(process("{[()]}"));  // true
        System.out.println(process("{[()]}(")); // false
    }
}
```

```cpp
#include <iostream>
#include <string>
#include <vector>

// The opener a closing token resolves, or 0 if the token is not a closer.
char opener(char tok) {
    if (tok == ')') return '(';
    if (tok == ']') return '[';
    if (tok == '}') return '{';
    return 0;
}

// Walks the tokens once; pushes the ones that open, pops for the ones that resolve.
bool process(const std::string& tokens) {
    std::vector<char> stack;
    for (char tok : tokens) {
        char opens = opener(tok);            // problem-specific: does this token resolve something?
        if (opens != 0) {
            if (stack.empty() || stack.back() != opens) {
                return false;                // nothing to resolve, or the wrong thing
            }
            stack.pop_back();
        } else {                             // otherwise it opens something: remember it
            stack.push_back(tok);
        }
    }
    return stack.empty();                    // problem-specific: what the final stack must look like
}

int main() {
    std::cout << std::boolalpha << process("{[()]}") << '\n';   // true
    std::cout << std::boolalpha << process("{[()]}(") << '\n';  // false
}
```

```javascript
// Walks the tokens once; pushes the ones that open, pops for the ones that resolve.
function process(tokens) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" }; // problem-specific pairing
  for (const tok of tokens) {
    if (tok in pairs) {                            // problem-specific: does this token resolve something?
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[tok]) {
        return false;                              // nothing to resolve, or the wrong thing
      }
      stack.pop();
    } else {                                       // otherwise it opens something: remember it
      stack.push(tok);
    }
  }
  return stack.length === 0;                       // problem-specific: what the final stack must look like
}

console.log(process("{[()]}"));  // true
console.log(process("{[()]}(")); // false
```

```go
package main

import "fmt"

// opener returns the opener a closing token resolves, or 0 if the token is not a closer.
func opener(tok byte) byte {
	switch tok {
	case ')':
		return '('
	case ']':
		return '['
	case '}':
		return '{'
	}
	return 0
}

// process walks the tokens once; pushes the ones that open, pops for the ones that resolve.
func process(tokens string) bool {
	stack := []byte{}
	for i := 0; i < len(tokens); i++ {
		tok := tokens[i]
		if opens := opener(tok); opens != 0 { // problem-specific: does this token resolve something?
			if len(stack) == 0 || stack[len(stack)-1] != opens {
				return false // nothing to resolve, or the wrong thing
			}
			stack = stack[:len(stack)-1]
		} else { // otherwise it opens something: remember it
			stack = append(stack, tok)
		}
	}
	return len(stack) == 0 // problem-specific: what the final stack must look like
}

func main() {
	fmt.Println(process("{[()]}"))  // true
	fmt.Println(process("{[()]}(")) // false
}
```

## Variations

- **Stack of pairs.** Push `(count, partialString)` or `(value, minSoFar)` when one item on its own is not enough context. A min-stack is a stack where every entry remembers the minimum beneath it.
- **Stack of indices** instead of values when you will need positions later (longest valid parentheses, next greater element).
- **Two stacks.** A queue built from two stacks moves everything from the "in" stack to the "out" stack once, giving amortised O(1) operations.
- **Explicit DFS.** Replace recursion with a stack of frames: push the children, pop the next node. Order of pushing determines visit order.
- **Collision loop.** Instead of "pop once", `while` the top conflicts with the new item, resolve the conflict and pop again; only push the new item if it survives.

## Common mistakes

- Popping or peeking an empty stack. Check `isEmpty` before every pop that the input could trigger.
- Forgetting the end-of-input check. A balanced-bracket function that returns true after the loop without testing that the stack is empty accepts `"(("`.
- Mixing up `pop` return values across languages: Java `Deque.pop()` removes and returns; `Stack.peek()` only looks; Go has no built-in and you must slice.
- Using Java's `java.util.Stack`. It works but is a synchronized legacy class; interviewers expect `ArrayDeque`.
- Pushing the wrong thing. If you push the *closing* bracket you must compare it against openers later; pick one convention and keep it.
- Off-by-one when a closing token should pop *and* produce output (`]` in decode string). Finish the pop, then build.

## Complexity

Push, pop and peek are O(1). A single pass that pushes each item at most once and pops it at most once is O(n) time even when a `while` loop pops many items in one step, because the total number of pops cannot exceed the total number of pushes. Space is O(n) in the worst case (every token opens something and nothing resolves it).

## Where to start

1. [20. Valid Parentheses](/interview/problems/valid-parentheses/) — the template with nothing added.
2. [155. Min Stack](/interview/problems/min-stack/) — a stack of pairs; each entry remembers the minimum so far.
3. [71. Simplify Path](/interview/problems/simplify-path/) — split into pieces, push names, pop on `..`.
4. [735. Asteroid Collision](/interview/problems/asteroid-collision/) — the collision loop: keep popping while the top loses.
5. [394. Decode String](/interview/problems/decode-string/) — push the partial string and count at `[`, rebuild at `]`.
6. [227. Basic Calculator II](/interview/problems/basic-calculator-ii/) — operator precedence by delaying `+` and `-` and applying `*` and `/` immediately.
7. [739. Daily Temperatures](/interview/problems/daily-temperatures/) — a stack of indices; the first monotonic stack problem.
8. [84. Largest Rectangle in Histogram](/interview/problems/largest-rectangle-in-histogram/) — the hardest stack classic; every bar pops when a shorter one arrives.
