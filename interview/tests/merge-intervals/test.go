package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func main() {
	cases := []struct{ intervals, expected [][]int }{
		{[][]int{{6, 8}, {1, 4}, {3, 5}}, [][]int{{1, 5}, {6, 8}}},
		{[][]int{{2, 4}, {4, 7}}, [][]int{{2, 7}}},
		{[][]int{{1, 10}, {2, 3}, {4, 5}}, [][]int{{1, 10}}},
		{[][]int{{5, 5}}, [][]int{{5, 5}}},
		{[][]int{{1, 2}, {3, 4}}, [][]int{{1, 2}, {3, 4}}},
		{[][]int{{0, 0}, {0, 0}}, [][]int{{0, 0}}},
		{[][]int{{4, 9}, {1, 3}, {2, 4}}, [][]int{{1, 9}}},
	}
	var disjoint, disjointWant, chain [][]int
	for i := 999; i >= 0; i-- {
		disjoint = append(disjoint, []int{2 * i, 2*i + 1})
		chain = append(chain, []int{i, i + 1})
	}
	for i := 0; i < 1000; i++ {
		disjointWant = append(disjointWant, []int{2 * i, 2*i + 1})
	}
	cases = append(cases, struct{ intervals, expected [][]int }{disjoint, disjointWant},
		struct{ intervals, expected [][]int }{chain, [][]int{{0, 1000}}})
	failed := false
	for n, c := range cases {
		copied := make([][]int, len(c.intervals))
		for i, iv := range c.intervals {
			copied[i] = []int{iv[0], iv[1]}
		}
		got := merge(copied)
		sort.Slice(got, func(i, j int) bool {
			return got[i][0] < got[j][0] || (got[i][0] == got[j][0] && got[i][1] < got[j][1])
		})
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
