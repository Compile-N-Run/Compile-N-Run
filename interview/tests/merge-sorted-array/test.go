package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func main() {
	cases := [][2][]int{{{2, 5, 9}, {4, 10}}, {{1, 1}, {1}}, {{}, {-3, 6}}, {{7}, {}}, {{4, 5, 6}, {1, 2, 3}},
		{{1, 2, 3}, {4, 5, 6}}, {{-5, 0, 0}, {-5, 0}}}
	big1, big2 := []int{}, []int{}
	for i := 0; i < 1000; i++ {
		big1 = append(big1, 2*i)
		big2 = append(big2, 2*i-1)
	}
	cases = append(cases, [2][]int{big1, big2})
	failed := false
	for c, pair := range cases {
		a, b := pair[0], pair[1]
		nums1 := append(append([]int{}, a...), make([]int, len(b))...)
		expected := append(append([]int{}, a...), b...)
		sort.Ints(expected)
		merge(nums1, len(a), append([]int{}, b...), len(b))
		if !reflect.DeepEqual(nums1, expected) {
			fmt.Println("case", c, "expected", expected, "got", nums1)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
