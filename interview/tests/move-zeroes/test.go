package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	big, bigExpected, zeros := []int{}, []int{}, 0
	for i := 0; i < 10000; i++ {
		if i%3 == 0 {
			big = append(big, 0)
			zeros++
		} else {
			big = append(big, i)
			bigExpected = append(bigExpected, i)
		}
	}
	bigExpected = append(bigExpected, make([]int, zeros)...)
	cases := []struct{ nums, expected []int }{{[]int{4, 0, 5, 0, 0, 9}, []int{4, 5, 9, 0, 0, 0}}, {[]int{0, 0, 7}, []int{7, 0, 0}},
		{[]int{-3, 2}, []int{-3, 2}}, {[]int{0}, []int{0}}, {[]int{5}, []int{5}}, {[]int{0, 0, 0}, []int{0, 0, 0}},
		{[]int{0, 1, 0, 3, 12}, []int{1, 3, 12, 0, 0}}, {[]int{2, 0, 2, 0, -1}, []int{2, 2, -1, 0, 0}}, {big, bigExpected}}
	failed := false
	for _, c := range cases {
		arr := append([]int(nil), c.nums...)
		moveZeroes(arr)
		if !reflect.DeepEqual(arr, c.expected) {
			fmt.Println("size", len(c.nums), "expected", c.expected, "got", arr)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
