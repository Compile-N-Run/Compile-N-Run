package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	var evens, odds, all []int
	for i := -100; i < 100; i += 2 {
		evens = append(evens, i)
	}
	for i := -99; i < 101; i += 2 {
		odds = append(odds, i)
	}
	for i := -100; i < 100; i++ {
		all = append(all, i)
	}
	cases := []struct{ a, b, expected []int }{
		{[]int{2, 5, 9}, []int{1, 6}, []int{1, 2, 5, 6, 9}},
		{[]int{3, 3, 4}, []int{3}, []int{3, 3, 3, 4}},
		{[]int{}, []int{7, 8}, []int{7, 8}},
		{[]int{}, []int{}, []int{}},
		{[]int{1, 2, 3}, []int{}, []int{1, 2, 3}},
		{[]int{-5, 0}, []int{-10, -5, 20}, []int{-10, -5, -5, 0, 20}},
		{[]int{1}, []int{2}, []int{1, 2}},
		{[]int{10, 11, 12}, []int{1, 2, 3}, []int{1, 2, 3, 10, 11, 12}},
		{evens, odds, all},
	}
	failed := false
	for _, c := range cases {
		got := listValues(mergeTwoLists(buildList(c.a), buildList(c.b)))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.a, "+", c.b, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
