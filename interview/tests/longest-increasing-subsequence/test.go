package main

import (
	"fmt"
	"os"
)

func main() {
	inc, pairs := []int{}, []int{}
	for i := 0; i < 2500; i++ {
		inc = append(inc, i)
	}
	for i := 0; i < 2000; i++ {
		pairs = append(pairs, i/2)
	}
	cases := []struct {
		nums     []int
		expected int
	}{{[]int{4, 1, 6, 2, 7, 3, 8}, 4}, {[]int{5, 5, 5}, 1}, {[]int{9, 7, 4, 2}, 1}, {[]int{-3, 10, -1, 0, 2}, 4}, {[]int{7}, 1},
		{[]int{1, 3, 2, 3, 4, 0}, 4}, {inc, 2500}, {pairs, 1000}}
	failed := false
	for _, c := range cases {
		if got := lengthOfLIS(append([]int(nil), c.nums...)); got != c.expected {
			fmt.Println("n =", len(c.nums), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
