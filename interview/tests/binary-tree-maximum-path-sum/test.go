package main

import (
	"fmt"
	"os"
)

func main() {
	ones, negatives := make([]int, 1023), make([]int, 1023)
	for i := range ones {
		ones[i] = 1
		negatives[i] = -(i%5 + 1)
	}
	cases := []struct {
		values   []int
		expected int
	}{{[]int{2, 1, 3}, 6}, {[]int{-8, 4, 6, NUL, NUL, 5, 7}, 18}, {[]int{-3}, -3}, {[]int{-2, -5, -1}, -1},
		{[]int{1, -2, 3}, 4}, {[]int{5, 4, 8, 11, NUL, 13, 4, 7, 2, NUL, NUL, NUL, 1}, 48},
		{[]int{-10, 9, 20, NUL, NUL, 15, -7}, 35}, {ones, 19}, {negatives, -1}}
	failed := false
	for n, c := range cases {
		if got := maxPathSum(buildTree(c.values)); got != c.expected {
			fmt.Println("case", n+1, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
