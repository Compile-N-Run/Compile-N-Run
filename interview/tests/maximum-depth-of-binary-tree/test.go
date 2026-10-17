package main

import (
	"fmt"
	"os"
)

func main() {
	full := []int{} // complete tree of 1023 nodes
	for i := 1; i <= 1023; i++ {
		full = append(full, i)
	}
	chain := []int{0} // 0 -> 1 -> ... -> 499 down the left side
	for i := 1; i < 500; i++ {
		chain = append(chain, i, NUL)
	}
	cases := []struct {
		values   []int
		expected int
	}{
		{[]int{}, 0},
		{[]int{7}, 1},
		{[]int{5, 3, 8, NUL, 4}, 3},
		{[]int{1, NUL, 2, NUL, 3, NUL, 4}, 4},
		{[]int{1, 2, 3, 4, 5, 6, 7}, 3},
		{[]int{1, 2}, 2},
		{[]int{1, 2, 3, 4, 5, 6, 7, 8}, 4},
		{[]int{-1, -2, NUL, -3, NUL, NUL, -4}, 4},
		{full, 10},
		{chain, 500},
	}
	failed := false
	for n, c := range cases {
		if got := maxDepth(buildTree(c.values)); got != c.expected {
			fmt.Printf("case %d (%d entries): expected %d, got %d\n", n, len(c.values), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
