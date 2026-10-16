package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func sortLists(lists [][]int) {
	sort.Slice(lists, func(a, b int) bool {
		for i := range lists[a] {
			if lists[a][i] != lists[b][i] {
				return lists[a][i] < lists[b][i]
			}
		}
		return false
	})
}

func main() {
	failed := false
	exact := []struct {
		nums     []int
		expected [][]int
	}{{[]int{4, 9}, [][]int{{4, 9}, {9, 4}}},
		{[]int{1, 2, 3}, [][]int{{1, 2, 3}, {1, 3, 2}, {2, 1, 3}, {2, 3, 1}, {3, 1, 2}, {3, 2, 1}}},
		{[]int{-5}, [][]int{{-5}}}, {[]int{0, -10}, [][]int{{-10, 0}, {0, -10}}}}
	for _, c := range exact {
		got := permute(append([]int(nil), c.nums...))
		sortLists(got)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.nums, "expected", c.expected, "got", got)
			failed = true
		}
	}
	big := []struct {
		nums  []int
		count int
	}{{[]int{0, -1, 7, 2}, 24}, {[]int{6, -2, 3, 10, -8, 1}, 720}}
	for _, c := range big {
		got := permute(append([]int(nil), c.nums...))
		want := append([]int(nil), c.nums...)
		sort.Ints(want)
		seen := map[string]bool{}
		for _, p := range got {
			seen[fmt.Sprint(p)] = true
			q := append([]int(nil), p...)
			sort.Ints(q)
			if !reflect.DeepEqual(q, want) {
				fmt.Println(c.nums, "not a permutation:", p)
				failed = true
			}
		}
		if len(got) != c.count || len(seen) != c.count {
			fmt.Println(c.nums, "expected", c.count, "distinct lists, got", len(got), len(seen))
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
