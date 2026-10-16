package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	asc, ascNext, desc := make([]int, 1000), make([]int, 1000), make([]int, 1000)
	for i := 0; i < 1000; i++ {
		asc[i], ascNext[i], desc[i] = i, i, 999-i
	}
	ascNext[998], ascNext[999] = 999, 998
	cases := []struct{ nums, expected []int }{
		{[]int{1, 3, 2}, []int{2, 1, 3}}, {[]int{5, 4, 3}, []int{3, 4, 5}}, {[]int{2, 2, 7}, []int{2, 7, 2}},
		{[]int{1, 5, 8, 4, 7, 6, 5, 3, 1}, []int{1, 5, 8, 5, 1, 3, 4, 6, 7}}, {[]int{1}, []int{1}},
		{[]int{1, 1}, []int{1, 1}}, {[]int{1, 2}, []int{2, 1}}, {[]int{3, 1, 2}, []int{3, 2, 1}},
		{[]int{1, 5, 1}, []int{5, 1, 1}}, {[]int{2, 3, 1, 3, 3}, []int{2, 3, 3, 1, 3}}, {[]int{0, -1, 4}, []int{0, 4, -1}},
		{asc, ascNext}, {desc, asc}}
	failed := false
	for n, c := range cases {
		arr := append([]int(nil), c.nums...)
		nextPermutation(arr)
		if !reflect.DeepEqual(arr, c.expected) {
			fmt.Println("case", n, "expected", c.expected, "got", arr)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
