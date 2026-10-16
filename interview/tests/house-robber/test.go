package main

import (
	"fmt"
	"os"
)

func main() {
	big, flat := make([]int, 100), make([]int, 100)
	for i := range big {
		big[i] = (i * 37) % 401
		flat[i] = 400
	}
	cases := []struct {
		nums     []int
		expected int
	}{{[]int{3, 10, 3, 1, 8}, 18}, {[]int{6, 1, 1, 6}, 12}, {[]int{4, 1, 2, 7, 5, 3, 1}, 14}, {[]int{9}, 9},
		{[]int{0, 0, 0}, 0}, {[]int{2, 1}, 2}, {[]int{1, 2}, 2}, {[]int{5, 0, 0, 5, 0, 0, 5}, 15}, {flat, 20000}, {big, 10569}}
	failed := false
	for _, c := range cases {
		got := rob(append([]int(nil), c.nums...))
		if got != c.expected {
			fmt.Println("size", len(c.nums), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
