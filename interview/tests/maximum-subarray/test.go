package main

import (
	"fmt"
	"os"
)

func main() {
	// Larger case: 100000 values alternating 10000, -9999; the best run stops at the last 10000.
	big := make([]int, 100000)
	for i := range big {
		if i%2 == 0 {
			big[i] = 10000
		} else {
			big[i] = -9999
		}
	}
	cases := []struct {
		nums     []int
		expected int
	}{{[]int{2, -5, 3, -1, 4, -6, 1}, 6}, {[]int{-4, -2, -7}, -2}, {[]int{1, 2, 3}, 6}, {[]int{7}, 7}, {[]int{0}, 0},
		{[]int{-1, 0, -2}, 0}, {[]int{5, -10, 5}, 5}, {[]int{-3, 4, -1, 2, 1, -5}, 6}, {[]int{-10000}, -10000}, {big, 59999}}
	failed := false
	for _, c := range cases {
		if got := maxSubArray(append([]int(nil), c.nums...)); got != c.expected {
			fmt.Println("size", len(c.nums), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
