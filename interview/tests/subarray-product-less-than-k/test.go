package main

import (
	"fmt"
	"os"
)

func repeat(value, n int) []int {
	out := make([]int, n)
	for i := range out {
		out[i] = value
	}
	return out
}

func main() {
	cases := []struct {
		nums        []int
		k, expected int
	}{
		{[]int{2, 3, 4}, 10, 4},
		{[]int{1, 1, 1}, 2, 6},
		{[]int{5, 5}, 5, 0},
		{[]int{3}, 0, 0},
		{[]int{3}, 1, 0},
		{[]int{3}, 4, 1},
		{[]int{10, 5, 2, 6}, 100, 8},
		{[]int{1, 2, 3, 4, 5}, 20, 9},
		{[]int{4, 1, 1, 8, 2}, 9, 10},
		{repeat(2, 20), 1024, 144},
		{repeat(1, 30000), 2, 450015000},
		{repeat(1000, 30000), 1000000, 30000},
	}
	failed := false
	for n, c := range cases {
		got := numSubarrayProductLessThanK(append([]int{}, c.nums...), c.k)
		if got != c.expected {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
