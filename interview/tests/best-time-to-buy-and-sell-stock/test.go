package main

import (
	"fmt"
	"os"
)

func main() {
	// Large case: prices fall from 50000 to 1, then rise from 1 to 50000.
	big := []int{}
	for i := 0; i < 50000; i++ {
		big = append(big, 50000-i)
	}
	for i := 0; i < 50000; i++ {
		big = append(big, i+1)
	}
	cases := []struct {
		prices   []int
		expected int
	}{{[]int{9, 2, 6, 1, 4}, 4}, {[]int{2, 9, 1, 8}, 7}, {[]int{8, 6, 5, 3}, 0}, {[]int{5}, 0}, {[]int{3, 3, 3}, 0},
		{[]int{0, 10000}, 10000}, {[]int{4, 1, 7, 0, 2}, 6}, {big, 49999}}
	failed := false
	for n, c := range cases {
		if got := maxProfit(append([]int(nil), c.prices...)); got != c.expected {
			fmt.Printf("case %d: expected %d, got %d\n", n, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
