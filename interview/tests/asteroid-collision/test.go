package main

import (
	"fmt"
	"os"
)

func sameInts(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func main() {
	big1 := make([]int, 5001)
	for i := range big1 {
		big1[i] = 1
	}
	big1[5000] = -2
	big2 := make([]int, 5001)
	for i := range big2 {
		big2[i] = -1
	}
	big2[0] = 1000
	cases := []struct{ asteroids, expected []int }{
		{[]int{4, 9, -6}, []int{4, 9}}, {[]int{7, -7}, []int{}}, {[]int{-3, -1, 2, 5}, []int{-3, -1, 2, 5}},
		{[]int{3, 5, -8, 2}, []int{-8, 2}}, {[]int{10, 2, -5}, []int{10}}, {[]int{1, -2, -3, 4}, []int{-2, -3, 4}},
		{[]int{5}, []int{5}}, {[]int{-4}, []int{-4}}, {[]int{6, 6, -6, -6}, []int{}},
		{big1, []int{-2}}, {big2, []int{1000}}}
	failed := false
	for n, c := range cases {
		got := asteroidCollision(append([]int(nil), c.asteroids...))
		if !sameInts(got, c.expected) {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
