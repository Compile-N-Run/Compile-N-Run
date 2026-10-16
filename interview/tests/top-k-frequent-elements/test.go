package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func main() {
	big := []int{}
	for v := 0; v < 100; v++ {
		for i := 0; i <= v; i++ {
			big = append(big, v) // value v appears v + 1 times
		}
	}
	cases := []struct {
		nums     []int
		k        int
		expected []int
	}{{[]int{5, 7, 5, 9, 7, 5}, 2, []int{5, 7}}, {[]int{-3, -3, 4}, 1, []int{-3}}, {[]int{8, 2, 6}, 3, []int{2, 6, 8}},
		{[]int{1}, 1, []int{1}}, {[]int{4, 4, 4, 4}, 1, []int{4}}, {[]int{-1, -1, 0, 0, 0, 2}, 2, []int{-1, 0}},
		{big, 5, []int{95, 96, 97, 98, 99}}}
	failed := false
	for _, c := range cases {
		got := topKFrequent(append([]int(nil), c.nums...), c.k)
		sort.Ints(got)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(len(c.nums), c.k, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
