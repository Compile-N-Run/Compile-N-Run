package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	big := make([][]int, 50) // 50 interleaved lists covering 0..4999
	for j := 0; j < 50; j++ {
		for x := j; x < 5000; x += 50 {
			big[j] = append(big[j], x)
		}
	}
	bigExpected := make([]int, 5000)
	for i := range bigExpected {
		bigExpected[i] = i
	}
	cases := []struct {
		lists    [][]int
		expected []int
	}{{[][]int{{1, 4, 9}, {2, 3}, {5, 6, 10}}, []int{1, 2, 3, 4, 5, 6, 9, 10}}, {[][]int{{}, {-3, 0}}, []int{-3, 0}},
		{[][]int{{7}, {7, 8}}, []int{7, 7, 8}}, {[][]int{}, []int{}}, {[][]int{{}}, []int{}}, {[][]int{{5}}, []int{5}},
		{[][]int{{-2, -1}, {-3}, {0, 0}, {}, {-5, 10}}, []int{-5, -3, -2, -1, 0, 0, 10}}, {big, bigExpected}}
	failed := false
	for _, c := range cases {
		lists := []*ListNode{}
		for _, v := range c.lists {
			lists = append(lists, buildList(v))
		}
		got := listValues(mergeKLists(lists))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println("k", len(c.lists), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
