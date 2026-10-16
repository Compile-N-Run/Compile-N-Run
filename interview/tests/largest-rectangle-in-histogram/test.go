package main

import (
	"fmt"
	"os"
)

func main() {
	inc, flat := []int{}, make([]int, 100000)
	for i := 1; i <= 1000; i++ {
		inc = append(inc, i)
	}
	for i := range flat {
		flat[i] = 10000
	}
	cases := []struct {
		heights  []int
		expected int
	}{{[]int{2, 1, 4, 5, 1, 3}, 8}, {[]int{3, 3, 3}, 9}, {[]int{1, 2, 3, 4, 5}, 9}, {[]int{6, 0, 6}, 6}, {[]int{7}, 7},
		{[]int{0, 0}, 0}, {[]int{5, 4, 1, 2}, 8}, {[]int{2, 4, 2, 4, 2}, 10}, {inc, 250500}, {flat, 1000000000}}
	failed := false
	for _, c := range cases {
		if got := largestRectangleArea(append([]int(nil), c.heights...)); got != c.expected {
			fmt.Println("n =", len(c.heights), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
