package main

import (
	"fmt"
	"os"
)

func main() {
	big := make([]int, 50000)
	for i := range big {
		big[i] = i%500 + 1
	}
	cases := []struct {
		weights        []int
		days, expected int
	}{
		{[]int{3, 2, 2, 4, 1, 4}, 3, 6},
		{[]int{7, 3, 5}, 1, 15},
		{[]int{7, 3, 5}, 3, 7},
		{[]int{5}, 1, 5},
		{[]int{1, 1, 1, 1}, 2, 2},
		{[]int{1, 1, 1, 1}, 4, 1},
		{[]int{1, 1, 1, 1}, 3, 2},
		{[]int{10, 1, 1, 1, 1, 10}, 2, 12},
		{[]int{6, 2, 9, 3, 8, 1}, 4, 9},
		{[]int{500, 500, 500}, 50, 500},
		{big, 100, 125250},
		{big, 1, 12525000},
		{big, 50000, 500},
	}
	failed := false
	for n, c := range cases {
		got := shipWithinDays(append([]int{}, c.weights...), c.days)
		if got != c.expected {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
