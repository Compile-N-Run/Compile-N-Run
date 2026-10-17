package main

import (
	"fmt"
	"os"
)

type busCase struct {
	routes                   [][]int
	source, target, expected int
}

func main() {
	cases := []busCase{
		{[][]int{{10, 20, 30}, {30, 40, 50}}, 10, 50, 2},
		{[][]int{{1, 2, 3}}, 1, 3, 1},
		{[][]int{{1, 2}, {3, 4}}, 1, 4, -1},
		{[][]int{{5, 6}}, 5, 5, 0},
		{[][]int{{1, 2, 3, 4, 5}, {2, 10}, {5, 10}}, 1, 10, 2},
		{[][]int{{1, 2, 3}, {3, 4}}, 1, 3, 1},
		{[][]int{{1, 9}, {2, 3, 8}, {4}, {8, 11}, {5, 9, 10}}, 8, 9, -1},
		{[][]int{{1, 2}, {2, 3}, {3, 4}, {4, 5}}, 1, 5, 4},
		{[][]int{{7, 8}}, 1, 8, -1}, // source is not on any route
	}
	var chain, star, long [][]int
	for i := 0; i < 500; i++ {
		chain = append(chain, []int{i, i + 1})
	}
	for i := 1; i <= 1000; i++ {
		star = append(star, []int{0, i})
	}
	for i := 0; i < 50000; i += 500 {
		route := make([]int, 1000)
		for k := range route {
			route[k] = i + k
		}
		long = append(long, route)
	}
	cases = append(cases,
		busCase{chain, 0, 500, 500},        // a chain of 500 buses
		busCase{star, 1, 1000, 2},          // a star: every route passes the hub 0
		busCase{long, 0, 49999 + 500, 100}) // long overlapping routes
	failed := false
	for n, c := range cases {
		if got := numBusesToDestination(c.routes, c.source, c.target); got != c.expected {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
