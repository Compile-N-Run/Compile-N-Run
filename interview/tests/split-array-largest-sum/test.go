package main

import (
	"fmt"
	"os"
)

func main() {
	ramp := make([]int, 1000)
	for i := range ramp {
		ramp[i] = i + 1
	}
	big := make([]int, 1000)
	for i := range big {
		big[i] = 1000000
	}
	cases := []struct {
		nums        []int
		k, expected int
	}{
		{[]int{7, 2, 5, 10, 8}, 2, 18},
		{[]int{1, 2, 3, 4, 5}, 2, 9},
		{[]int{1, 4, 4}, 3, 4},
		{[]int{5}, 1, 5},
		{[]int{1, 1, 1, 1}, 4, 1},
		{[]int{0, 0, 0}, 2, 0},
		{[]int{10, 1, 1, 1, 10}, 3, 10},
		{[]int{2, 3, 1, 2, 4, 3}, 5, 4},
		{ramp, 1, 500500},
		{ramp, 2, 250278},
		{big, 3, 334000000},
	}
	failed := false
	for n, c := range cases {
		if got := splitArray(append([]int(nil), c.nums...), c.k); got != c.expected {
			fmt.Printf("case %d k=%d: expected %d, got %d\n", n, c.k, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
