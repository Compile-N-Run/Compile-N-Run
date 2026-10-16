---
title: Simulation
topic: Simulation
group: math
description: "Simulation problems ask you to act out a process exactly as described: model the state, apply the rules one step at a time, and keep the code organised so the many small details stay correct."
---

## What it is

A simulation problem hands you a set of rules and asks what happens when you follow them. There is no clever trick to discover; the challenge is to translate the rules into code faithfully. A robot follows commands on a grid, asteroids drift and collide, a bank processes transfers, a word processor wraps and justifies lines. You write a loop that takes the current **state**, applies one **step** of the rules, and repeats until the input is used up or the process settles.

That sounds easy, and the algorithmic part usually is. What makes these problems fail in interviews is sloppiness: a direction table with one entry wrong, an off-by-one in the grid bounds, an edge case the statement mentioned in a subordinate clause. The skill being tested is translating a prose specification into clean, correct code under time pressure.

## When to use it

- The statement describes a process in steps: "each second...", "for each command...", "repeat until no more changes".
- There are explicit rules for what happens in each situation, often a bulleted list, with no hint that a formula exists.
- Constraints are small enough that acting out every step fits in time (the number of steps times the cost of one step is at most around 10^7 or 10^8).
- The words *robot*, *grid*, *game*, *turn*, *round*, *queue of customers*, *spiral*, *rotate*, *collide* appear.
- A design problem (bank, parking lot, text editor) is really a simulation with a state that persists across calls.

The opposite signal: if the step count is huge (10^9 rounds) or the statement asks about a final state that clearly repeats, the problem wants you to find the cycle or formula instead of simulating everything.

## How it works

The recipe is always the same:

1. **Name the state.** Write down every variable that describes "where we are": position, direction, the grid, a score, a stack of things in flight. If you cannot list them, you do not yet understand the rules.
2. **Write one step.** A function or loop body that takes the state and one input (a command, a tick of time) and produces the next state. Handle the rules in the order the statement gives them.
3. **Loop.** Run the step for each input, or until the stopping condition holds.
4. **Report.** Return whatever the problem asks about the final state.

Trace the template on `"GGRGGLG"`. The state is `(x, y, facing)`, starting at `(0, 0)` facing north (index 0 in the direction table `north, east, south, west`):

| command | action            | state after      |
|---------|-------------------|------------------|
| G       | move north        | (0, 1), north    |
| G       | move north        | (0, 2), north    |
| R       | turn right        | (0, 2), east     |
| G       | move east         | (1, 2), east     |
| G       | move east         | (2, 2), east     |
| L       | turn left         | (2, 2), north    |
| G       | move north        | (2, 3), north    |

Two small habits make this clean. First, directions live in a table in clockwise order, so turning right is `(facing + 1) % 4` and turning left is `(facing + 3) % 4`; no `if` chain over four cases. Second, movement reads `dx, dy` from the table instead of hard-coding four separate updates. Both habits remove the places where typos hide.

## Template

```python
# Directions in clockwise order: north, east, south, west.
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]


def simulate(commands: str) -> tuple[int, int]:
    """Walk a robot on a grid: 'G' moves one step, 'L'/'R' turn 90 degrees."""
    x, y = 0, 0            # the state: position...
    facing = 0             # ...and direction (index into DIRS), starts facing north
    for c in commands:     # one step of the simulation per command
        if c == "L":
            facing = (facing + 3) % 4   # same as -1, without going negative
        elif c == "R":
            facing = (facing + 1) % 4
        else:
            dx, dy = DIRS[facing]
            x, y = x + dx, y + dy
            # problem-specific checks go here: walls, visited cells, bounds...
    return x, y


if __name__ == "__main__":
    print(simulate("GGRGGLG"))    # (2, 3)
    print(simulate("GLGLGLG"))    # (0, 0): a full square brings it home
```

```java
public class Template {
    // Directions in clockwise order: north, east, south, west.
    static final int[][] DIRS = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

    // Walk a robot on a grid: 'G' moves one step, 'L'/'R' turn 90 degrees.
    static int[] simulate(String commands) {
        int x = 0, y = 0;   // the state: position...
        int facing = 0;     // ...and direction (index into DIRS), starts facing north
        for (char c : commands.toCharArray()) {   // one step of the simulation per command
            if (c == 'L') {
                facing = (facing + 3) % 4;        // same as -1, without going negative
            } else if (c == 'R') {
                facing = (facing + 1) % 4;
            } else {
                x += DIRS[facing][0];
                y += DIRS[facing][1];
                // problem-specific checks go here: walls, visited cells, bounds...
            }
        }
        return new int[] {x, y};
    }

    public static void main(String[] args) {
        int[] p = simulate("GGRGGLG");
        System.out.println(p[0] + " " + p[1]);   // 2 3
        p = simulate("GLGLGLG");
        System.out.println(p[0] + " " + p[1]);   // 0 0: a full square brings it home
    }
}
```

```cpp
#include <iostream>
#include <string>
#include <utility>

// Directions in clockwise order: north, east, south, west.
const int DIRS[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

// Walk a robot on a grid: 'G' moves one step, 'L'/'R' turn 90 degrees.
std::pair<int, int> simulate(const std::string& commands) {
    int x = 0, y = 0;   // the state: position...
    int facing = 0;     // ...and direction (index into DIRS), starts facing north
    for (char c : commands) {              // one step of the simulation per command
        if (c == 'L') {
            facing = (facing + 3) % 4;     // same as -1, without going negative
        } else if (c == 'R') {
            facing = (facing + 1) % 4;
        } else {
            x += DIRS[facing][0];
            y += DIRS[facing][1];
            // problem-specific checks go here: walls, visited cells, bounds...
        }
    }
    return {x, y};
}

int main() {
    auto [x, y] = simulate("GGRGGLG");
    std::cout << x << ' ' << y << "\n";   // 2 3
    auto [hx, hy] = simulate("GLGLGLG");
    std::cout << hx << ' ' << hy << "\n"; // 0 0: a full square brings it home
}
```

```javascript
// Directions in clockwise order: north, east, south, west.
const DIRS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

// Walk a robot on a grid: 'G' moves one step, 'L'/'R' turn 90 degrees.
function simulate(commands) {
  let x = 0;
  let y = 0; // the state: position...
  let facing = 0; // ...and direction (index into DIRS), starts facing north
  for (const c of commands) {
    // one step of the simulation per command
    if (c === "L") {
      facing = (facing + 3) % 4; // same as -1, without going negative
    } else if (c === "R") {
      facing = (facing + 1) % 4;
    } else {
      x += DIRS[facing][0];
      y += DIRS[facing][1];
      // problem-specific checks go here: walls, visited cells, bounds...
    }
  }
  return [x, y];
}

console.log(simulate("GGRGGLG")); // [ 2, 3 ]
console.log(simulate("GLGLGLG")); // [ 0, 0 ]: a full square brings it home
```

```go
package main

import "fmt"

// Directions in clockwise order: north, east, south, west.
var dirs = [4][2]int{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}

// simulate walks a robot on a grid: 'G' moves one step, 'L'/'R' turn 90 degrees.
func simulate(commands string) (int, int) {
	x, y := 0, 0 // the state: position...
	facing := 0  // ...and direction (index into dirs), starts facing north
	for _, c := range commands { // one step of the simulation per command
		switch c {
		case 'L':
			facing = (facing + 3) % 4 // same as -1, without going negative
		case 'R':
			facing = (facing + 1) % 4
		default:
			x += dirs[facing][0]
			y += dirs[facing][1]
			// problem-specific checks go here: walls, visited cells, bounds...
		}
	}
	return x, y
}

func main() {
	fmt.Println(simulate("GGRGGLG")) // 2 3
	fmt.Println(simulate("GLGLGLG")) // 0 0: a full square brings it home
}
```

## Variations

- **Grid walks** (Spiral Matrix, Walking Robot Simulation): a position, a direction table, and a rule for when to turn. Obstacles go in a hash set of `(x, y)` pairs so each move checks in O(1).
- **Stack-based collisions** (Asteroid Collision, Baseball Game): the "state" is a stack of things still alive; each new item fights the top of the stack until it is destroyed or settles.
- **Two-phase grids** (Game of Life): every cell's next value depends on the *old* neighbours, so either write to a copy or encode "old and new" in the same cell with extra bit values, and apply in a second pass.
- **Time-ordered events** (Average Waiting Time, Car Pooling): keep a clock; each event starts at `max(clock, arrival)`. When events are not sorted, sort them or use a heap.
- **Stateful design classes** (Simple Bank System, Design Parking System): the simulation state lives in fields and each method is one step. Validate the inputs first (account exists, enough balance), then mutate.
- **Formatting** (Text Justification, String Compression): simulation over characters. Build output with a list of pieces or a string builder, not repeated string concatenation.
- **Find the cycle instead** (Robot Bounded In Circle): one pass of the commands tells you the net displacement and rotation; from those you deduce the infinite behaviour without running forever.

## Common mistakes

- A wrong entry in the direction table, or `(facing - 1) % 4` going negative in languages where `%` keeps the sign.
- Mutating a grid in place while still reading neighbours from it.
- Checking bounds after writing instead of before: index the grid only after confirming `0 <= r < rows` and `0 <= c < cols`.
- Mis-ordering the rules. If the statement says "if the account does not exist, return false; otherwise...", check existence first, every time.
- Forgetting the final flush: the last line of a text layout, the last run of a compression, the carry after the last digit.
- Simulating when the constraints forbid it. If `k` moves can be 10^9, reduce `k mod cycle` first (Rotate Array uses `k mod n`).
- Writing one giant loop body. Split the step into small helpers (`turn`, `move`, `canMove`) so each can be checked on its own and tested with a tiny example.

## Complexity

Usually O(steps * cost per step). For a command string that is O(n); for a grid process it is O(rows * cols) per round times the number of rounds. Memory is the size of the state, typically O(1) beyond the input, plus a hash set of obstacles or a stack of live objects when those are part of the rules. Before coding, multiply the step count by the per-step cost and check it is under about 10^8; if not, look for a cycle or a formula.

## Where to start

1. 657. Robot Return to Origin: the smallest possible simulation, four commands and two counters.
2. 682. Baseball Game: the state is a stack and each token is one rule.
3. [54. Spiral Matrix](/interview/problems/spiral-matrix/): a grid walk with shrinking bounds; get the four edges right.
4. 59. Spiral Matrix II: the same walk, now writing numbers instead of reading them.
5. [735. Asteroid Collision](/interview/problems/asteroid-collision/): collisions resolved against a stack, with careful handling of equal sizes.
6. [2043. Simple Bank System](/interview/problems/simple-bank-system/): a design class whose methods are validated steps on shared state.
7. 289. Game of Life: in-place two-phase update of a grid.
8. [68. Text Justification](/interview/problems/text-justification/): the classic test of patience; many small rules, one line at a time.
