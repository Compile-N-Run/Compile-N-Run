package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		coins    []int
		amount   int
		expected int
	}{{[]int{2, 5, 10}, 27, 4}, {[]int{1, 3, 4}, 6, 2}, {[]int{3, 7}, 5, -1}, {[]int{4}, 0, 0}, {[]int{1}, 1, 1},
		{[]int{2}, 3, -1}, {[]int{2147483647}, 2, -1}, {[]int{3, 7, 405, 436}, 8839, 25}, {[]int{37, 233, 91, 512}, 9999, 28},
		{[]int{2, 7}, 10000, 1430}}
	failed := false
	for _, c := range cases {
		if got := coinChange(append([]int(nil), c.coins...), c.amount); got != c.expected {
			fmt.Println(c.coins, c.amount, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
