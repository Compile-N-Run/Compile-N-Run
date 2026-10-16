package main

import (
	"fmt"
	"os"
)

func main() {
	var big []int
	for i := 99999; i >= 0; i -= 2 {
		big = append(big, i)
	}
	for i := 0; i < 100000; i += 2 {
		big = append(big, i)
	}
	big = append(big, 200000, -5)
	cases := []struct {
		nums     []int
		expected int
	}{{[]int{10, 4, 20, 1, 3, 2}, 4}, {[]int{5, -1, 0, 7, 1, 6, 1}, 3}, {[]int{42}, 1}, {[]int{}, 0},
		{[]int{7, 7, 7}, 1}, {[]int{1, 3, 5, 7}, 1}, {[]int{-1000000000, 1000000000, 0, -999999999}, 2},
		{[]int{9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6}, 7}, {big, 100000}}
	failed := false
	for _, c := range cases {
		got := longestConsecutive(append([]int(nil), c.nums...))
		if got != c.expected {
			fmt.Println("size", len(c.nums), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
