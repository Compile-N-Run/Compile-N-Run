package main

import (
	"fmt"
	"os"
)

func main() {
	bigGas, bigCost := make([]int, 1000), make([]int, 1000)
	for i := range bigGas {
		bigGas[i], bigCost[i] = 1, 1
	}
	bigGas[700], bigCost[699] = 2, 2
	cases := []struct {
		gas, cost []int
		expected  int
	}{{[]int{2, 5, 1, 4}, []int{3, 2, 4, 1}, 1}, {[]int{1, 1, 1}, []int{2, 1, 1}, -1}, {[]int{0, 0, 7}, []int{2, 3, 2}, 2},
		{[]int{3}, []int{3}, 0}, {[]int{5}, []int{6}, -1}, {[]int{4, 0, 2}, []int{1, 3, 2}, 0}, {bigGas, bigCost, 700}}
	failed := false
	for _, c := range cases {
		got := canCompleteCircuit(append([]int(nil), c.gas...), append([]int(nil), c.cost...))
		if got != c.expected {
			fmt.Println("n =", len(c.gas), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
