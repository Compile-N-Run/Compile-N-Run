package main

import (
	"fmt"
	"os"
)

func main() {
	full := []int{} // complete tree of 1023 nodes: 9 edges down each side
	for i := 1; i <= 1023; i++ {
		full = append(full, i)
	}
	chain := []int{0} // 0 -> 1 -> ... -> 999 down the left side
	for i := 1; i < 1000; i++ {
		chain = append(chain, i, NUL)
	}
	cases := []struct {
		values   []int
		expected int
	}{
		{[]int{1, 2, 3, 4, 5}, 3},
		{[]int{1}, 0},
		{[]int{1, NUL, 2}, 1},
		{[]int{1, 2, NUL, 3, 4, 5, NUL, NUL, 6, 7}, 5}, // longest path avoids the root
		{[]int{1, 2, 3}, 2},
		{[]int{1, 2, NUL, 3, NUL, 4}, 3}, // a chain of four
		{[]int{1, 2, 3, 4, 5, 6, 7}, 4},
		{[]int{1, 2, 3, 4, NUL, NUL, 5}, 4},
		{[]int{-7, -7, -7, NUL, 3}, 3}, // values do not matter
		{[]int{}, 0},                    // no tree at all
		{full, 18},
		{chain, 999},
	}
	failed := false
	for _, c := range cases {
		got := diameterOfBinaryTree(buildTree(c.values))
		if got != c.expected {
			head := c.values
			if len(head) > 10 {
				head = head[:10]
			}
			fmt.Printf("tree=%v (%d entries): expected %d, got %d\n", head, len(c.values), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
