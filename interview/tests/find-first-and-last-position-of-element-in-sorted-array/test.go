package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	big := make([]int, 100000)
	for i := range big {
		big[i] = i / 10 // each value 0..9999 appears 10 times
	}
	cases := []struct {
		nums     []int
		target   int
		expected []int
	}{{[]int{1, 3, 3, 3, 6, 9}, 3, []int{1, 3}}, {[]int{2, 4, 4, 8}, 5, []int{-1, -1}}, {[]int{7}, 7, []int{0, 0}},
		{[]int{}, 0, []int{-1, -1}}, {[]int{5, 5, 5, 5}, 5, []int{0, 3}}, {[]int{1, 2, 3}, 0, []int{-1, -1}},
		{[]int{1, 2, 3}, 4, []int{-1, -1}}, {[]int{-3, -1, -1, 0}, -1, []int{1, 2}}, {[]int{1, 2, 3, 3}, 3, []int{2, 3}},
		{big, 4321, []int{43210, 43219}}, {big, 10000, []int{-1, -1}}}
	failed := false
	for _, c := range cases {
		if got := searchRange(append([]int(nil), c.nums...), c.target); !reflect.DeepEqual(got, c.expected) {
			fmt.Println("target", c.target, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
