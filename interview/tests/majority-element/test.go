package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		nums     []int
		expected int
	}{{[]int{2, 7, 2}, 2}, {[]int{5}, 5}, {[]int{-1, -1, 4, 4, -1}, -1}, {[]int{3, 3, 8, 8, 3, 8, 8}, 8},
		{[]int{1000000000, -1000000000, 1000000000}, 1000000000}, {[]int{0, 0, 0, 0}, 0}, {[]int{1, 2, 1, 3, 1, 4, 1}, 1}}
	// Larger case: 25001 copies of -7 interleaved with 24999 distinct other values.
	big := []int{}
	for i := 0; i < 25000; i++ {
		big = append(big, -7, i)
	}
	big[len(big)-1] = -7
	big = append(big, 99)
	cases = append(cases, struct {
		nums     []int
		expected int
	}{big, -7})
	failed := false
	for _, c := range cases {
		if got := majorityElement(append([]int(nil), c.nums...)); got != c.expected {
			fmt.Println("size", len(c.nums), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
