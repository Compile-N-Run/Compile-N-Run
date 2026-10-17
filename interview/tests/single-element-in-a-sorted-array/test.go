package main

import (
	"fmt"
	"os"
)

// Pairs 0,0,1,1,...,n-1,n-1 with the lone value `single` kept once, in sorted order.
func withSingle(n, single int) []int {
	values := []int{}
	for v := 0; v < n; v++ {
		values = append(values, v)
		if v != single {
			values = append(values, v)
		}
	}
	return values
}

func main() {
	cases := []struct {
		nums     []int
		expected int
	}{
		{[]int{1, 1, 2, 3, 3, 4, 4}, 2},
		{[]int{0, 0, 5, 5, 9}, 9},
		{[]int{2, 3, 3}, 2},
		{[]int{-4, -4, -1, -1, 0, 6, 6}, 0},
		{[]int{7}, 7},
		{[]int{1, 1, 2, 2, 3}, 3},
		{[]int{1, 2, 2, 3, 3}, 1},
		{[]int{1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6}, 3},
		{[]int{-7, -7, -3, -3, -2, -1, -1}, -2},
		{withSingle(1000, 0), 0},     // the lone value first among 1999 elements
		{withSingle(1000, 999), 999}, // the lone value last
		{withSingle(1000, 617), 617}, // the lone value somewhere in the middle
	}
	failed := false
	for _, c := range cases {
		nums := append([]int{}, c.nums...)
		got := singleNonDuplicate(nums)
		if got != c.expected {
			head := c.nums
			if len(head) > 8 {
				head = head[:8]
			}
			fmt.Printf("nums=%v (%d elements): expected %d, got %d\n", head, len(c.nums), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
