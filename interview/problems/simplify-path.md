---
title: Simplify Path
leetcode: simplify-path
description: "Simplify Path explained: turn a messy absolute Unix path with '.', '..' and repeated slashes into its canonical form by splitting on '/' and using a stack of directory names, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an absolute Unix-style file path `path` (it always starts with `/`). Return its simplified, *canonical* form.

The rules for reading the input:

- `/` separates directory names, and several slashes in a row (`//`, `///`) count as one.
- `.` means "the current directory" and can be ignored.
- `..` means "the parent directory": go up one level. Going up from the root `/` keeps you at the root.
- Any other name is a normal directory name. That includes names made only of periods, such as `...` or `....`.

The canonical path must start with a single `/`, separate names with exactly one `/`, have no trailing `/` (unless the whole path is just `/`), and contain no `.` or `..` parts. The input contains letters, digits, periods, underscores and slashes, and is at most a few thousand characters long.

## Examples

- `path = "/docs/./drafts//final/"` → `"/docs/drafts/final"`. The `.` disappears, `//` becomes one slash and the trailing slash is removed.
- `path = "/a/b/../../c"` → `"/c"`. Each `..` cancels one directory: `b`, then `a`.
- `path = "/../.."` → `"/"`. You cannot go above the root.
- `path = "/x/.../y/.."` → `"/x/..."`. Three periods is an ordinary name; the final `..` only removes `y`.

## Key idea

Split the path on `/` and walk through the pieces from left to right, keeping the directories you are currently "inside" on a **stack**. A normal name means you step into a directory: push it. `..` means you step back out: pop the most recent directory, if there is one. Empty pieces (from repeated or trailing slashes) and `.` change nothing.

A stack fits because `..` always undoes the *most recent* directory that is still open, which is exactly last in, first out. At the end, the stack holds the canonical path from the root down; join it with `/` and put a `/` in front.

## Approach

1. Split `path` on `/`. For `"/docs/./drafts//final/"` the pieces are `"", "docs", ".", "drafts", "", "final", ""`.
2. Create an empty stack. For each piece:
   1. If it is empty or `.`, skip it.
   2. If it is `..`, pop from the stack if the stack is not empty.
   3. Otherwise push it.
3. Return `"/"` followed by the stack's names joined with `"/"`. An empty stack gives `"/"`.

## Complexity

- **Time:** O(n), where n is the length of `path`. Splitting, the single pass and the final join each touch every character a constant number of times.
- **Space:** O(n) for the pieces and the stack.

## Common mistakes

- Treating any piece that starts with `.` as special. Only exactly `.` and `..` are; `...` or `.hidden` are names.
- Popping from an empty stack on `..` at the root, which crashes in most languages.
- Returning an empty string instead of `"/"` when everything cancels out.
- Trying to edit the string in place with search-and-replace (for example replacing `/../`), which misses cases like a trailing `/..` or repeated `..`.

## Follow-up questions

- How would you handle a relative path together with a current working directory? (Start the stack with the directories of the working directory, then process the relative path the same way.)
- How would you support symbolic links? (When a name is a link, replace it with the link's target path and continue; you also need cycle detection.)

## Related problems

- [Decode String](/interview/problems/decode-string/)
- [Valid Parentheses](/interview/problems/valid-parentheses/)
- Backspace String Compare
- Crawler Log Folder

## Solutions

```python
class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = []
        for part in path.split('/'):
            if part == '' or part == '.':
                continue  # repeated slash or "current directory"
            if part == '..':
                if stack:
                    stack.pop()  # go up one level (stay at the root if empty)
            else:
                stack.append(part)
        return '/' + '/'.join(stack)
```

```java
class Solution {
    public String simplifyPath(String path) {
        Deque<String> stack = new ArrayDeque<>();
        for (String part : path.split("/")) {
            if (part.isEmpty() || part.equals(".")) {
                continue; // repeated slash or "current directory"
            }
            if (part.equals("..")) {
                if (!stack.isEmpty()) {
                    stack.pollLast(); // go up one level (stay at the root if empty)
                }
            } else {
                stack.addLast(part);
            }
        }
        return "/" + String.join("/", stack);
    }
}
```

```cpp
class Solution {
public:
    string simplifyPath(string path) {
        vector<string> stack;
        stringstream ss(path);
        string part;
        while (getline(ss, part, '/')) {
            if (part.empty() || part == ".") {
                continue;  // repeated slash or "current directory"
            }
            if (part == "..") {
                if (!stack.empty()) {
                    stack.pop_back();  // go up one level (stay at the root if empty)
                }
            } else {
                stack.push_back(part);
            }
        }
        string result;
        for (const string& name : stack) {
            result += "/" + name;
        }
        return result.empty() ? "/" : result;
    }
};
```

```javascript
/**
 * @param {string} path
 * @return {string}
 */
var simplifyPath = function (path) {
  const stack = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue; // repeated slash or "current directory"
    if (part === '..') {
      stack.pop(); // go up one level; pop on an empty array does nothing
    } else {
      stack.push(part);
    }
  }
  return '/' + stack.join('/');
};
```

```go
import "strings"

func simplifyPath(path string) string {
	stack := []string{}
	for _, part := range strings.Split(path, "/") {
		switch part {
		case "", ".":
			// repeated slash or "current directory"
		case "..":
			if len(stack) > 0 {
				stack = stack[:len(stack)-1] // go up one level (stay at the root if empty)
			}
		default:
			stack = append(stack, part)
		}
	}
	return "/" + strings.Join(stack, "/")
}
```
