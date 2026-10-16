package main

import (
	"fmt"
	"os"
)

func main() {
	big := make([]int, 20000)
	big[0], big[19999] = 100000, 100000
	cases := []struct {
		height   []int
		expected int
	}{{[]int{3, 0, 2, 0, 4}, 7}, {[]int{1, 2, 3, 4}, 0}, {[]int{5, 1, 1, 5, 2, 4}, 10}, {[]int{6}, 0},
		{[]int{2, 0, 2}, 2}, {[]int{0, 0, 0}, 0}, {[]int{5, 4, 3, 2, 1}, 0}, {[]int{2, 1, 3, 1, 2}, 2}, {big, 100000 * 19998}}
	failed := false
	for _, c := range cases {
		if got := trap(append([]int(nil), c.height...)); got != c.expected {
			fmt.Println("size", len(c.height), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
