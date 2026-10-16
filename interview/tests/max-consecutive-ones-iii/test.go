package main

import (
	"fmt"
	"os"
)

func main() {
	alternating := make([]int, 10000)
	ones := make([]int, 10000)
	for i := range alternating {
		alternating[i] = 1 - i%2
		ones[i] = 1
	}
	cases := []struct {
		nums        []int
		k, expected int
	}{
		{[]int{1, 1, 0, 0, 1, 1, 1, 0, 1}, 2, 7},
		{[]int{0, 0, 0}, 1, 1},
		{[]int{0, 0, 0}, 0, 0},
		{[]int{1, 1, 1}, 0, 3},
		{[]int{1, 0, 1, 0, 1}, 5, 5},
		{[]int{1}, 0, 1},
		{[]int{0}, 0, 0},
		{[]int{0}, 1, 1},
		{[]int{1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1}, 2, 7},
		{[]int{0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1}, 0, 3},
		{alternating, 100, 201},
		{ones, 0, 10000},
		{make([]int, 10000), 10000, 10000},
	}
	failed := false
	for n, c := range cases {
		if got := longestOnes(append([]int(nil), c.nums...), c.k); got != c.expected {
			fmt.Printf("case %d k=%d: expected %d, got %d\n", n, c.k, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
