package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	const n = 100000
	big, bigExpected := make([]int, n), make([]int, n)
	for i := 0; i < n; i++ {
		big[i] = i
		bigExpected[i] = (i - 23456 + n) % n // k = 123456 is 23456 after wrapping
	}
	cases := []struct {
		nums     []int
		k        int
		expected []int
	}{{[]int{10, 20, 30, 40, 50}, 2, []int{40, 50, 10, 20, 30}}, {[]int{1, 2, 3}, 4, []int{3, 1, 2}}, {[]int{-5, 8}, 0, []int{-5, 8}},
		{[]int{9}, 7, []int{9}}, {[]int{1, 2, 3, 4}, 4, []int{1, 2, 3, 4}}, {[]int{1, 2, 3, 4, 5, 6, 7}, 3, []int{5, 6, 7, 1, 2, 3, 4}},
		{[]int{1, 2}, 1, []int{2, 1}}, {[]int{4, 4, 1, 4}, 3, []int{4, 1, 4, 4}}, {big, 123456, bigExpected}}
	failed := false
	for _, c := range cases {
		arr := append([]int(nil), c.nums...)
		rotate(arr, c.k)
		if !reflect.DeepEqual(arr, c.expected) {
			fmt.Println("size", len(c.nums), "k", c.k, "got", arr[:min(len(arr), 10)])
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
