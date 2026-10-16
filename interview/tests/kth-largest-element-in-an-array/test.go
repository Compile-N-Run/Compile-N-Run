package main

import (
	"fmt"
	"os"
	"sort"
)

func main() {
	big := make([]int, 100000)
	for i := range big {
		big[i] = (i*7919)%20001 - 10000
	}
	desc := append([]int(nil), big...)
	sort.Sort(sort.Reverse(sort.IntSlice(desc)))
	cases := []struct {
		nums     []int
		k        int
		expected int
	}{{[]int{7, 2, 9, 4}, 2, 7}, {[]int{5, 5, 1}, 2, 5}, {[]int{-1, -8, -3}, 3, -8}, {[]int{6}, 1, 6},
		{[]int{1, 2, 3, 4, 5}, 1, 5}, {[]int{3, 3, 3, 3}, 3, 3}, {[]int{10, -10, 0}, 2, 0}, {big, 500, desc[499]},
		{big, 100000, desc[99999]}}
	failed := false
	for _, c := range cases {
		if got := findKthLargest(append([]int(nil), c.nums...), c.k); got != c.expected {
			fmt.Println("k", c.k, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
