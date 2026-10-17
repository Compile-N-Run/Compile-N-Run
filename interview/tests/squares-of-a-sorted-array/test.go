package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func main() {
	cases := []struct{ nums, expected []int }{
		{[]int{-4, -1, 0, 3, 10}, []int{0, 1, 9, 16, 100}},
		{[]int{-7, -3, 2, 3, 11}, []int{4, 9, 9, 49, 121}},
		{[]int{1, 2, 3}, []int{1, 4, 9}},
		{[]int{-3, -2, -1}, []int{1, 4, 9}},
		{[]int{0}, []int{0}},
		{[]int{-5}, []int{25}},
		{[]int{0, 0, 0}, []int{0, 0, 0}},
		{[]int{-2, -2, 2, 2}, []int{4, 4, 4, 4}},
		{[]int{-10000, 10000}, []int{100000000, 100000000}},
	}
	big, bigWant := []int{}, []int{}
	for i := -500; i < 500; i++ {
		big = append(big, i)
		bigWant = append(bigWant, i*i)
	}
	sort.Ints(bigWant)
	cases = append(cases, struct{ nums, expected []int }{big, bigWant})
	failed := false
	for n, c := range cases {
		copied := append([]int{}, c.nums...)
		if got := sortedSquares(copied); !reflect.DeepEqual(got, c.expected) {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
