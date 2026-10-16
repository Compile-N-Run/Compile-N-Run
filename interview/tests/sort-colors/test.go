package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func main() {
	cases := [][]int{{2, 1, 0, 2, 0, 1}, {1, 2, 1}, {2, 2, 0}, {1}, {2, 0}, {1, 0}, {0, 0, 0}, {2, 1, 0}}
	big := []int{}
	for i := 0; i < 1000; i++ {
		big = append(big, (i*7+i/3)%3)
	}
	cases = append(cases, big)
	failed := false
	for n, nums := range cases {
		got := append([]int(nil), nums...)
		expected := append([]int(nil), nums...)
		sort.Ints(expected)
		sortColors(got)
		if !reflect.DeepEqual(got, expected) {
			fmt.Println("case", n, "expected", expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
