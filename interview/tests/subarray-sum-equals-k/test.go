package main

import (
	"fmt"
	"os"
)

func bruteCount(nums []int, k int) int {
	total := 0
	for i := range nums {
		s := 0
		for j := i; j < len(nums); j++ {
			s += nums[j]
			if s == k {
				total++
			}
		}
	}
	return total
}

func main() {
	big := []int{}
	x := int64(3)
	for i := 0; i < 2000; i++ {
		x = x * 48271 % 2147483647
		big = append(big, int(x%21)-10)
	}
	cases := []struct {
		nums     []int
		k        int
		expected int
	}{{[]int{1, 2, 3}, 3, 2}, {[]int{1, 1, 1, 1}, 2, 3}, {[]int{2, -2, 2, -2}, 0, 4}, {[]int{5}, 5, 1}, {[]int{5}, 4, 0},
		{[]int{-1, -1, 1}, 0, 1}, {[]int{0, 0, 0}, 0, 6}, {[]int{3, 4, 7, 2, -3, 1, 4, 2}, 7, 4}, {[]int{1, -1, 0}, 0, 3},
		{[]int{-3, -2}, -5, 1}, {make([]int, 2000), 0, 2001000}, {big, 5, bruteCount(big, 5)}}
	failed := false
	for i, c := range cases {
		if got := subarraySum(append([]int(nil), c.nums...), c.k); got != c.expected {
			fmt.Println("case", i, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
