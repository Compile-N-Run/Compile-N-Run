package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	big := []int{}
	for v := -2500; v < 2500; v++ {
		big = append(big, v)
	}
	cases := [][]int{{1, 2, 3, 4}, {8, 5}, {7}, {}, {3, 3, 1}, {-5, 0, 5, -5}, big}
	failed := false
	for _, values := range cases {
		expected := make([]int, len(values))
		for i, v := range values {
			expected[len(values)-1-i] = v
		}
		got := listValues(reverseList(buildList(values)))
		if !reflect.DeepEqual(got, expected) {
			fmt.Println("size", len(values), "expected", expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
