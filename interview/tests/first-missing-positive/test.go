package main

import (
	"fmt"
	"math"
	"os"
)

func main() {
	big := []int{}
	for v := 100000; v >= 1; v-- {
		if v == 77777 {
			big = append(big, -1) // 77777 removed
		} else {
			big = append(big, v)
		}
	}
	cases := []struct {
		nums     []int
		expected int
	}{{[]int{2, 5, 1, 9}, 3}, {[]int{-4, 0, 6}, 1}, {[]int{3, 1, 2, 2}, 4}, {[]int{1}, 2}, {[]int{2}, 1}, {[]int{1, 1}, 2},
		{[]int{0}, 1}, {[]int{7, 8, 9, 11, 12}, 1}, {[]int{math.MinInt32, math.MaxInt32, 1, 2}, 3}, {[]int{4, 3, 2, 1}, 5}, {big, 77777}}
	failed := false
	for _, c := range cases {
		if got := firstMissingPositive(append([]int(nil), c.nums...)); got != c.expected {
			fmt.Println("size", len(c.nums), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
