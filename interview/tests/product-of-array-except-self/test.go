package main

import (
	"fmt"
	"os"
	"reflect"
)

func bruteProduct(nums []int) []int {
	out := []int{}
	for i := range nums {
		p := 1
		for j, x := range nums {
			if j != i {
				p *= x
			}
		}
		out = append(out, p)
	}
	return out
}

func main() {
	big := []int{}
	for i := 0; i < 1000; i++ {
		v := 1
		if i%100 == 0 {
			v = 2
		} else if i%7 == 0 {
			v = -1
		}
		big = append(big, v)
	}
	cases := [][2][]int{{{2, 3, 4, 5}, {60, 40, 30, 24}}, {{3, 0, 4}, {0, 12, 0}}, {{0, 5, 0}, {0, 0, 0}},
		{{-1, 2, -3}, {-6, 3, -2}}, {{7, 9}, {9, 7}}, {{0, 0}, {0, 0}}, {{1, 1, 1, 1}, {1, 1, 1, 1}}, {big, bruteProduct(big)}}
	failed := false
	for c, tc := range cases {
		got := productExceptSelf(append([]int(nil), tc[0]...))
		if !reflect.DeepEqual(got, tc[1]) {
			fmt.Println("case", c, "expected", tc[1], "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
