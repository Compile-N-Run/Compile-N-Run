package main

import (
	"fmt"
	"math"
	"os"
)

func main() {
	// Each op is {0, value} for push, {1, 0} for pop, {2, expected} for top or {3, expected} for getMin.
	big := [][2]int{}
	for v := 1000; v >= 1; v-- {
		big = append(big, [2]int{0, v})
	}
	for v := 1; v < 1000; v++ {
		big = append(big, [2]int{3, v}, [2]int{2, v}, [2]int{1, 0})
	}
	big = append(big, [2]int{3, 1000})
	for v := 2000; v < 3000; v++ {
		big = append(big, [2]int{0, v})
	}
	big = append(big, [2]int{3, 1000}, [2]int{2, 2999})
	cases := [][][2]int{
		{{0, 4}, {0, 2}, {0, 7}, {3, 2}, {2, 7}, {1, 0}, {1, 0}, {3, 4}, {2, 4}},
		{{0, 3}, {0, 3}, {1, 0}, {3, 3}, {2, 3}},
		{{0, -1}, {0, 5}, {3, -1}, {2, 5}},
		{{0, 9}, {3, 9}, {2, 9}},
		{{0, math.MinInt32}, {0, math.MaxInt32}, {3, math.MinInt32}, {2, math.MaxInt32}, {1, 0}, {2, math.MinInt32}},
		{{0, 1}, {0, 2}, {0, 0}, {3, 0}, {1, 0}, {3, 1}, {0, -3}, {3, -3}, {1, 0}, {1, 0}, {3, 1}, {2, 1}},
		{{0, 5}, {1, 0}, {0, 8}, {3, 8}, {0, 6}, {3, 6}, {2, 6}},
		big,
	}
	failed := false
	for n, ops := range cases {
		stack := Constructor()
		for step, op := range ops {
			switch op[0] {
			case 0:
				stack.Push(op[1])
			case 1:
				stack.Pop()
			case 2:
				if got := stack.Top(); got != op[1] {
					fmt.Printf("case %d step %d top: expected %d, got %d\n", n, step, op[1], got)
					failed = true
				}
			default:
				if got := stack.GetMin(); got != op[1] {
					fmt.Printf("case %d step %d getMin: expected %d, got %d\n", n, step, op[1], got)
					failed = true
				}
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
