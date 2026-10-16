package main

import (
	"fmt"
	"os"
	"reflect"
)

func bruteWindowMax(nums []int, k int) []int {
	out := []int{}
	for i := 0; i+k <= len(nums); i++ {
		m := nums[i]
		for _, v := range nums[i : i+k] {
			if v > m {
				m = v
			}
		}
		out = append(out, m)
	}
	return out
}

func generateNums(n int, seed int64) []int {
	out := make([]int, n)
	x := seed
	for i := range out {
		x = x * 48271 % 2147483647
		out[i] = int(x%2001) - 1000
	}
	return out
}

func main() {
	big := generateNums(5000, 7)
	cases := []struct {
		nums     []int
		k        int
		expected []int
	}{{[]int{2, 5, 1, 3, 4, 0}, 3, []int{5, 5, 4, 4}}, {[]int{6, 4, 2}, 1, []int{6, 4, 2}}, {[]int{-3, -1, -7, -2}, 4, []int{-1}},
		{[]int{1, 3, 3, 2}, 2, []int{3, 3, 3}}, {[]int{1, 3, -1, -3, 5, 3, 6, 7}, 3, []int{3, 3, 5, 5, 6, 7}},
		{[]int{9, 8, 7, 6, 5}, 2, []int{9, 8, 7, 6}}, {[]int{4}, 1, []int{4}}, {[]int{7, 7, 7, 7}, 3, []int{7, 7}},
		{big, 137, bruteWindowMax(big, 137)}}
	failed := false
	for _, c := range cases {
		got := maxSlidingWindow(append([]int(nil), c.nums...), c.k)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println("n", len(c.nums), "k", c.k, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
