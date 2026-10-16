package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	cases := []struct {
		nums     []int
		expected int
	}{
		{[]int{2, 5, 1, 4, 3, 5}, 5},
		{[]int{1, 3, 4, 2, 2}, 2},
		{[]int{3, 1, 3, 4, 2}, 3},
		{[]int{4, 4, 4, 4, 4, 4}, 4},
		{[]int{1, 1}, 1},
		{[]int{2, 2, 1}, 2},
		{[]int{2, 5, 9, 6, 9, 3, 8, 9, 7, 1}, 9},
		{[]int{9, 8, 7, 6, 5, 4, 3, 2, 1, 9}, 9},
	}
	big := []int{777}
	for i := 100000; i >= 1; i-- {
		big = append(big, i)
	}
	ones := make([]int, 50001)
	for i := range ones {
		ones[i] = 1
	}
	cases = append(cases, struct {
		nums     []int
		expected int
	}{big, 777}, struct {
		nums     []int
		expected int
	}{ones, 1})
	failed := false
	for n, c := range cases {
		original := append([]int(nil), c.nums...)
		if got := findDuplicate(c.nums); got != c.expected {
			fmt.Printf("case %d: expected %d, got %d\n", n, c.expected, got)
			failed = true
		}
		if !reflect.DeepEqual(c.nums, original) {
			fmt.Printf("case %d: input was modified\n", n)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
