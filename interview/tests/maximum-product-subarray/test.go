package main

import (
	"fmt"
	"os"
)

func main() {
	negatives := make([]int, 9999) // odd count of negatives: drop one end
	for i := range negatives {
		negatives[i] = -1
	}
	ends := make([]int, 10000) // the whole array is the answer
	for i := range ends {
		ends[i] = 1
	}
	ends[0], ends[9999] = -2, -2
	cases := []struct {
		nums     []int
		expected int
	}{
		{[]int{2, -3, 4}, 4},
		{[]int{-2, 3, -4}, 24},
		{[]int{2, -5, -2, -4, 3}, 24},
		{[]int{0, -1}, 0},
		{[]int{-5}, -5},
		{[]int{2, 0, 3, 4}, 12},
		{[]int{-1, -2, -3, 0, 5}, 6},
		{[]int{3, -1, 4}, 4},
		{[]int{-3, 0, -2, -1}, 2},
		{[]int{0, 0, 0}, 0},
		{[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1}, 3628800},
		{negatives, 1},
		{ends, 4},
	}
	failed := false
	for n, c := range cases {
		if got := maxProduct(append([]int{}, c.nums...)); got != c.expected {
			fmt.Printf("case %d (n=%d): expected %d, got %d\n", n, len(c.nums), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
