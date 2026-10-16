package main

import (
	"fmt"
	"math"
	"os"
)

const samples = 100000

var failed = false

// checkWeights draws many picks; every index must be valid and frequencies must match the weights.
// Indexes are bucketed by i % buckets so long arrays can be checked with fewer samples.
func checkWeights(w []int, buckets int) {
	n := len(w)
	if buckets == 0 {
		buckets = n
	}
	s := Constructor(append([]int(nil), w...))
	total := 0.0
	for _, x := range w {
		total += float64(x)
	}
	expected, counts := make([]float64, buckets), make([]int, buckets)
	for i, x := range w {
		expected[i%buckets] += float64(x) / total
	}
	for t := 0; t < samples; t++ {
		i := s.PickIndex()
		if i < 0 || i >= n {
			fmt.Println("size", n, "invalid index", i)
			failed = true
			return
		}
		counts[i%buckets]++
	}
	for g := 0; g < buckets; g++ {
		got := float64(counts[g]) / samples
		// 6 standard deviations (+ a little slack): a false alarm is about one in a billion,
		// but an off-by-one that moves a whole slot between indexes is still caught.
		p := expected[g]
		tolerance := 6*math.Sqrt(p*(1-p)/samples) + 0.0005
		if math.Abs(got-p) > tolerance {
			fmt.Println("size", n, "group", g, "expected", expected[g], "got", got)
			failed = true
		}
	}
}

func main() {
	checkWeights([]int{2, 5, 3}, 0)
	s := Constructor([]int{7})
	for t := 0; t < 100; t++ {
		if got := s.PickIndex(); got != 0 {
			fmt.Println("single weight: got", got)
			failed = true
		}
	}
	checkWeights([]int{1, 1, 1, 1}, 0)
	checkWeights([]int{1, 99}, 0)
	checkWeights([]int{100000, 1, 100000}, 0)
	checkWeights([]int{5, 1, 1, 1, 1, 1, 1, 1, 1, 5}, 0)
	// Larger case: 10000 weights up to 100000, checked in 10 buckets.
	big := make([]int, 10000)
	for i := range big {
		big[i] = i*7919%100000 + 1
	}
	checkWeights(big, 10)
	if failed {
		os.Exit(1)
	}
}
