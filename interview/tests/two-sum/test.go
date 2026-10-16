package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func main() {
	cases := []struct {
		nums     []int
		target   int
		expected []int
	}{{[]int{3, 8, 11, 5}, 13, []int{1, 3}}, {[]int{4, 6, 4}, 8, []int{0, 2}}, {[]int{-2, 7, 1}, -1, []int{0, 2}},
		{[]int{2, 7, 11, 15}, 9, []int{0, 1}}, {[]int{0, 4, 3, 0}, 0, []int{0, 3}}, {[]int{1, 2}, 3, []int{0, 1}}}
	failed := false
	for _, c := range cases {
		got := twoSum(append([]int(nil), c.nums...), c.target)
		sort.Ints(got)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.nums, c.target, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
