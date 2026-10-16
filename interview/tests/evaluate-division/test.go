package main

import (
	"fmt"
	"math"
	"os"
)

func main() {
	chain, twos := [][]string{}, []float64{}
	for i := 0; i < 19; i++ {
		chain = append(chain, []string{fmt.Sprintf("v%d", i), fmt.Sprintf("v%d", i+1)})
		twos = append(twos, 2)
	}
	cases := []struct {
		equations [][]string
		values    []float64
		queries   [][]string
		expected  []float64
	}{
		{[][]string{{"a", "b"}, {"b", "c"}}, []float64{3, 0.5}, [][]string{{"a", "c"}, {"c", "a"}, {"b", "b"}, {"a", "z"}}, []float64{1.5, 2.0 / 3, 1, -1}},
		{[][]string{{"p", "q"}, {"r", "s"}}, []float64{4, 2}, [][]string{{"p", "s"}, {"q", "p"}, {"s", "r"}}, []float64{-1, 0.25, 0.5}},
		{[][]string{{"x", "y"}}, []float64{5}, [][]string{{"x", "x"}, {"w", "w"}, {"y", "x"}}, []float64{1, -1, 0.2}},
		{[][]string{{"ab", "cd"}, {"cd", "ef"}, {"ab", "gh"}}, []float64{2, 3, 4}, [][]string{{"ef", "gh"}, {"gh", "cd"}}, []float64{4.0 / 6, 0.5}},
		{[][]string{{"a", "b"}, {"b", "c"}, {"c", "a"}}, []float64{2, 3, 1.0 / 6}, [][]string{{"a", "c"}, {"c", "b"}}, []float64{6, 1.0 / 3}},
		{chain, twos, [][]string{{"v0", "v19"}, {"v19", "v0"}, {"v5", "v10"}, {"v3", "v20"}}, []float64{524288, 1.0 / 524288, 32, -1}},
	}
	failed := false
	for n, c := range cases {
		got := calcEquation(c.equations, c.values, c.queries)
		ok := len(got) == len(c.expected)
		for i := 0; ok && i < len(got); i++ {
			ok = math.Abs(got[i]-c.expected[i]) <= 1e-5*math.Max(1, math.Abs(c.expected[i]))
		}
		if !ok {
			fmt.Println("case", n+1, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
