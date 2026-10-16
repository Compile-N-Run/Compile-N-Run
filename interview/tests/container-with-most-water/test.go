package main

import (
	"fmt"
	"os"
)

func main() {
	// Larger case: 100000 lines rising to 10000 and then staying flat; best pair is index 10000 with the last line.
	big := make([]int, 100000)
	for i := range big {
		big[i] = min(i, 10000)
	}
	cases := []struct {
		height   []int
		expected int
	}{{[]int{2, 7, 4, 1, 6, 3}, 18}, {[]int{5, 5}, 5}, {[]int{1, 8, 1, 1, 8, 1}, 24}, {[]int{0, 0}, 0}, {[]int{3, 1}, 1},
		{[]int{1, 2, 3, 4, 5}, 6}, {[]int{4, 3, 2, 1, 4}, 16}, {[]int{10000, 10000}, 10000}, {big, 10000 * 89999}}
	failed := false
	for _, c := range cases {
		if got := maxArea(append([]int(nil), c.height...)); got != c.expected {
			fmt.Println("size", len(c.height), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
