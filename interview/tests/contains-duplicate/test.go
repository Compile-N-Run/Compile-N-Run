package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		nums     []int
		expected bool
	}{
		{[]int{4, 1, 7, 1}, true},
		{[]int{3, 8, -2, 5}, false},
		{[]int{0, 0}, true},
		{[]int{42}, false},
		{[]int{-1, 1, -1}, true},
		{[]int{2147483647, -2147483648, 0}, false},
		{[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 5}, true},
	}
	distinct := make([]int, 100000)
	for i := range distinct {
		distinct[i] = i
	}
	cases = append(cases, struct {
		nums     []int
		expected bool
	}{distinct, false})
	cases = append(cases, struct {
		nums     []int
		expected bool
	}{append(append([]int{}, distinct...), 99999), true})
	failed := false
	for n, c := range cases {
		got := containsDuplicate(append([]int{}, c.nums...))
		if got != c.expected {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
