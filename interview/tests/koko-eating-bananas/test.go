package main

import (
	"fmt"
	"os"
)

func main() {
	same, seq := make([]int, 10000), make([]int, 10000)
	for i := range same {
		same[i] = 1000000000
		seq[i] = i + 1
	}
	cases := []struct {
		piles    []int
		h        int
		expected int
	}{{[]int{5, 9, 2}, 6, 3}, {[]int{10, 10}, 2, 10}, {[]int{7}, 7, 1}, {[]int{4, 1, 8}, 5, 4}, {[]int{2, 2, 2}, 3, 2},
		{[]int{1, 1, 1, 1}, 10, 1}, {[]int{1000000000}, 2, 500000000}, {same, 1000000000, 10000}, {seq, 10000, 10000}}
	failed := false
	for _, c := range cases {
		if got := minEatingSpeed(append([]int(nil), c.piles...), c.h); got != c.expected {
			fmt.Println("h", c.h, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
