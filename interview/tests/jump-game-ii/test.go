package main

import (
	"fmt"
	"os"
)

func filled(n, value int) []int {
	out := make([]int, n)
	for i := range out {
		out[i] = value
	}
	return out
}

func main() {
	oneThenOnes := filled(10000, 1)
	oneThenOnes[0] = 10000
	cases := []struct {
		nums     []int
		expected int
	}{
		{[]int{3, 1, 1, 4, 1, 1, 1}, 2},
		{[]int{1, 1, 1, 1}, 3},
		{[]int{4, 1, 1, 1, 1}, 1},
		{[]int{1, 3, 0, 0, 2, 0, 1}, 3},
		{[]int{5}, 0},
		{[]int{0}, 0},
		{[]int{2, 1}, 1},
		{[]int{1, 2, 3}, 2},
		{[]int{3, 0, 0, 1, 0}, 2},
		{filled(10000, 1), 9999},
		{oneThenOnes, 1},
		{filled(10001, 2), 5000},
	}
	failed := false
	for n, c := range cases {
		if got := jump(append([]int{}, c.nums...)); got != c.expected {
			fmt.Printf("case %d (n=%d): expected %d, got %d\n", n, len(c.nums), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
