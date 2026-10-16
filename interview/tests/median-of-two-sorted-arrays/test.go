package main

import (
	"fmt"
	"math"
	"os"
	"sort"
)

func referenceMedian(a, b []int) float64 {
	m := append(append([]int(nil), a...), b...)
	sort.Ints(m)
	t := len(m)
	if t%2 == 1 {
		return float64(m[t/2])
	}
	return float64(m[t/2-1]+m[t/2]) / 2
}

func main() {
	big1, big2 := []int{}, []int{}
	for i := 0; i < 999; i++ {
		big1 = append(big1, (i*7919)%2001-1000)
	}
	for i := 0; i < 1000; i++ {
		big2 = append(big2, (i*104729)%1999-1000)
	}
	sort.Ints(big1)
	sort.Ints(big2)
	cases := []struct {
		a, b     []int
		expected float64
	}{{[]int{1, 4, 9}, []int{2, 3}, 3}, {[]int{5, 8}, []int{1, 2, 10, 12}, 6.5}, {[]int{}, []int{7}, 7}, {[]int{2, 2}, []int{2, 2}, 2},
		{[]int{3}, []int{}, 3}, {[]int{1, 2}, []int{3, 4}, 2.5}, {[]int{10, 20, 30}, []int{1, 2, 3, 4, 5, 6}, 5},
		{[]int{-5, -3}, []int{-4}, -4}, {[]int{1000000}, []int{-1000000}, 0}, {big1, big2, referenceMedian(big1, big2)}}
	failed := false
	for i, c := range cases {
		got := findMedianSortedArrays(append([]int(nil), c.a...), append([]int(nil), c.b...))
		if math.Abs(got-c.expected) > 1e-6 {
			fmt.Println("case", i, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
