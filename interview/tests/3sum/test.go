package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func normalise(ts [][]int) [][]int {
	out := [][]int{}
	for _, t := range ts {
		c := append([]int(nil), t...)
		sort.Ints(c)
		out = append(out, c)
	}
	sort.Slice(out, func(i, j int) bool {
		for k := 0; k < 3; k++ {
			if out[i][k] != out[j][k] {
				return out[i][k] < out[j][k]
			}
		}
		return false
	})
	return out
}

func main() {
	// Larger case: values -6..6, each at least 15 times, so every value triple summing to 0 is present.
	big := []int{}
	for i := 0; i < 200; i++ {
		big = append(big, (i*7)%13-6)
	}
	bigExpected := [][]int{}
	for a := -6; a <= 6; a++ {
		for b := a; b <= 6; b++ {
			if b <= -a-b && -a-b <= 6 {
				bigExpected = append(bigExpected, []int{a, b, -a - b})
			}
		}
	}
	cases := []struct {
		nums     []int
		expected [][]int
	}{{[]int{-4, 1, 3, 2, -1, -2}, [][]int{{-4, 1, 3}, {-2, -1, 3}}}, {[]int{-2, 1, 1, -2, 4, 0}, [][]int{{-2, -2, 4}, {-2, 1, 1}}},
		{[]int{0, 0, 0, 0}, [][]int{{0, 0, 0}}}, {[]int{2, 5, -1}, [][]int{}}, {[]int{-2, 0, 0, 2, 2}, [][]int{{-2, 0, 2}}},
		{[]int{-1, 0, 1, 2, -1, -4}, [][]int{{-1, -1, 2}, {-1, 0, 1}}}, {[]int{1, 2, -2, -1}, [][]int{}}, {big, bigExpected}}
	failed := false
	for _, c := range cases {
		got := normalise(threeSum(append([]int(nil), c.nums...)))
		if !reflect.DeepEqual(got, normalise(c.expected)) {
			fmt.Println(len(c.nums), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
