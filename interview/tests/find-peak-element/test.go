package main

import (
	"fmt"
	"math"
	"os"
)

func isPeak(nums []int, i int) bool {
	n := len(nums)
	return i >= 0 && i < n && (i == 0 || nums[i] > nums[i-1]) && (i == n-1 || nums[i] > nums[i+1])
}

func main() {
	zigzag, mountain := make([]int, 10001), make([]int, 10000)
	for i := range zigzag {
		zigzag[i] = i % 2
	}
	for i := range mountain {
		if i < 7000 {
			mountain[i] = i
		} else {
			mountain[i] = 14000 - i
		}
	}
	cases := [][]int{{2, 5, 3}, {1, 3, 2, 6, 4}, {9, 7, 4}, {1, 2, 3, 4}, {7}, {math.MinInt32},
		{math.MinInt32, math.MinInt32 + 1}, {3, 1}, {math.MaxInt32, math.MinInt32, math.MaxInt32}, zigzag, mountain}
	failed := false
	for n, nums := range cases {
		got := findPeakElement(append([]int(nil), nums...))
		if !isPeak(nums, got) {
			fmt.Println("case", n, "returned", got, "which is not a peak")
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
