package main

import (
	"fmt"
	"os"
)

func main() {
	big := make([]int, 10000)
	for i := range big {
		big[i] = i % 10 // 1000 climbs from 0 to 9
	}
	cases := []struct {
		prices   []int
		expected int
	}{{[]int{3, 1, 4, 2, 6}, 7}, {[]int{2, 3, 5, 8}, 6}, {[]int{9, 7, 4, 1}, 0}, {[]int{5}, 0}, {[]int{4, 4, 4}, 0},
		{[]int{0, 10000}, 10000}, {[]int{7, 1, 5, 3, 6, 4}, 7}, {[]int{1, 5, 5, 2, 8}, 10}, {big, 9000}}
	failed := false
	for _, c := range cases {
		if got := maxProfit(append([]int(nil), c.prices...)); got != c.expected {
			fmt.Println("size", len(c.prices), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
