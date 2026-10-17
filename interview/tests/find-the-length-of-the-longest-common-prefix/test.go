package main

import (
	"fmt"
	"os"
)

func main() {
	oneTo50000, evens50000 := []int{}, []int{}
	for i := 1; i <= 50000; i++ {
		oneTo50000 = append(oneTo50000, i)
		evens50000 = append(evens50000, 2*i)
	}
	cases := []struct {
		arr1, arr2 []int
		expected   int
	}{
		{[]int{1, 10, 100}, []int{1000}, 3},
		{[]int{123, 456}, []int{1234, 45}, 3},
		{[]int{12}, []int{123, 124, 125}, 2},
		{[]int{1, 2, 3}, []int{4, 4, 4}, 0},
		{[]int{100000000}, []int{100000000}, 9},
		{[]int{5}, []int{5}, 1},
		{[]int{7, 77, 777}, []int{7777}, 3},
		{[]int{100}, []int{1000, 10}, 3},
		{[]int{13, 27}, []int{2, 1}, 1},
		{[]int{987654321}, []int{98765, 9876543}, 7},
		{[]int{21, 210}, []int{2100, 20}, 3},
		{oneTo50000, []int{49999}, 5},     // 49999 itself is in arr1
		{oneTo50000, []int{100000000}, 5}, // prefix 10000 is in arr1 but 100000 is not
		{evens50000, []int{99999999}, 4},  // 9999 is a prefix of 99990, but no even number below 100001 starts with 99999
	}
	failed := false
	for n, c := range cases {
		got := longestCommonPrefix(c.arr1, c.arr2)
		if got != c.expected {
			fmt.Printf("case %d (arr1 length %d, arr2 %v): expected %d, got %d\n", n, len(c.arr1), c.arr2, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
