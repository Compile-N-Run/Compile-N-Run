package main

import (
	"fmt"
	"os"
)

type jobCase struct {
	start, end, profit []int
	expected           int
}

func main() {
	cases := []jobCase{
		{[]int{1, 2, 4}, []int{3, 5, 6}, []int{50, 10, 70}, 120},
		{[]int{1, 1, 1}, []int{2, 3, 4}, []int{5, 6, 4}, 6},
		{[]int{1, 3, 5}, []int{3, 5, 7}, []int{10, 10, 10}, 30},
		{[]int{2, 5, 1, 6}, []int{4, 7, 8, 9}, []int{30, 25, 100, 20}, 100},
		{[]int{4}, []int{9}, []int{7}, 7},
		{[]int{1, 2}, []int{10, 3}, []int{5, 5}, 5},
		{[]int{1, 2, 3}, []int{4, 5, 6}, []int{3, 3, 3}, 3},
		{[]int{1, 4, 2}, []int{4, 6, 6}, []int{5, 6, 10}, 11},
		{[]int{1, 999999999}, []int{1000000000, 1000000000}, []int{1, 2}, 2},
	}
	// 10000 unit jobs in reverse order: all of them fit.
	units := jobCase{expected: 10000}
	for i := 9999; i >= 0; i-- {
		units.start = append(units.start, i)
		units.end = append(units.end, i+1)
		units.profit = append(units.profit, 1)
	}
	cases = append(cases, units)
	// Unit jobs plus length-2 jobs worth 3: one unit job (0..1) then 5000 long jobs at 1, 3, ..., 9999.
	mixed := jobCase{expected: 15001}
	mixed.start = append(mixed.start, units.start...)
	mixed.end = append(mixed.end, units.end...)
	mixed.profit = append(mixed.profit, units.profit...)
	for i := 0; i < 10000; i++ {
		mixed.start = append(mixed.start, i)
		mixed.end = append(mixed.end, i+2)
		mixed.profit = append(mixed.profit, 3)
	}
	cases = append(cases, mixed)
	failed := false
	for n, c := range cases {
		got := jobScheduling(append([]int{}, c.start...), append([]int{}, c.end...), append([]int{}, c.profit...))
		if got != c.expected {
			fmt.Printf("case %d (n=%d): expected %d, got %d\n", n, len(c.start), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
