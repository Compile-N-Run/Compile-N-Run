package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	cases := []struct {
		arr      []int
		expected [][]int
	}{
		{[]int{4, 2, 1, 3}, [][]int{{1, 2}, {2, 3}, {3, 4}}},
		{[]int{1, 3, 6, 10, 15}, [][]int{{1, 3}}},
		{[]int{3, 8, -10, 23, 19, -4, -14, 27}, [][]int{{-14, -10}, {19, 23}, {23, 27}}},
		{[]int{10, 1, 100, 7}, [][]int{{7, 10}}},
		{[]int{1, 2}, [][]int{{1, 2}}},
		{[]int{-5, 5}, [][]int{{-5, 5}}},
		{[]int{1000000, -1000000}, [][]int{{-1000000, 1000000}}},
		{[]int{-3, -1, -2}, [][]int{{-3, -2}, {-2, -1}}},
		{[]int{40, 11, 26, 27, 10}, [][]int{{10, 11}, {26, 27}}},
	}
	var evens, squares []int // evens: every neighbouring gap is 2; squares: only 0 and 1 are 1 apart
	var evensWant [][]int
	for i := 999; i >= 0; i-- {
		evens = append(evens, 2*i)
		squares = append(squares, i*i)
	}
	for i := 0; i < 999; i++ {
		evensWant = append(evensWant, []int{2 * i, 2*i + 2})
	}
	cases = append(cases,
		struct {
			arr      []int
			expected [][]int
		}{evens, evensWant},
		struct {
			arr      []int
			expected [][]int
		}{squares, [][]int{{0, 1}}})
	failed := false
	for n, c := range cases {
		got := minimumAbsDifference(append([]int{}, c.arr...))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Printf("case %d (length %d): expected %v, got %v\n", n, len(c.arr), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
