package main

import (
	"fmt"
	"os"
)

func main() {
	cases := [][2]int{{1, 1}, {2, 2}, {3, 3}, {4, 5}, {6, 13}, {10, 89}, {20, 10946}, {45, 1836311903}}
	failed := false
	for _, c := range cases {
		if got := climbStairs(c[0]); got != c[1] {
			fmt.Printf("n=%d: expected %d, got %d\n", c[0], c[1], got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
