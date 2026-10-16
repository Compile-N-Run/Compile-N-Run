package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	big, bigExpected := []int{}, []int{}
	for v := -500; v < 500; v++ {
		bigExpected = append(bigExpected, v)
		for c := 0; c <= ((v%3)+3)%3; c++ {
			big = append(big, v)
		}
	}
	cases := []struct{ nums, expected []int }{{[]int{2, 2, 5, 7, 7, 7}, []int{2, 5, 7}}, {[]int{-4, -4, -4}, []int{-4}},
		{[]int{1, 3, 8}, []int{1, 3, 8}}, {[]int{6}, []int{6}}, {[]int{0, 0, 1, 1, 1, 2, 2, 3, 3, 4}, []int{0, 1, 2, 3, 4}},
		{[]int{-100, 100}, []int{-100, 100}}, {big, bigExpected}}
	failed := false
	for _, c := range cases {
		arr := append([]int(nil), c.nums...)
		k := removeDuplicates(arr)
		if k != len(c.expected) || !reflect.DeepEqual(arr[:k], c.expected) {
			fmt.Println("size", len(c.nums), "expected", c.expected, "got k =", k)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
