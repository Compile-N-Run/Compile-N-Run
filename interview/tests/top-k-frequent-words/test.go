package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	pad := func(i int) string { return fmt.Sprintf("w%03d", i) }
	var big, top25, all []string
	for i := 199; i >= 0; i-- { // word i appears i % 10 + 1 times
		for r := 0; r <= i%10; r++ {
			big = append(big, pad(i))
		}
	}
	for i := 9; i < 200; i += 10 {
		top25 = append(top25, pad(i))
	}
	top25 = append(top25, "w008", "w018", "w028", "w038", "w048")
	for f := 10; f >= 1; f-- {
		for i := f - 1; i < 200; i += 10 {
			all = append(all, pad(i))
		}
	}
	cases := []struct {
		words    []string
		k        int
		expected []string
	}{
		{[]string{"pear", "apple", "pear", "fig", "apple", "pear"}, 2, []string{"pear", "apple"}},
		{[]string{"b", "a", "b", "a"}, 2, []string{"a", "b"}},
		{[]string{"dog", "cat", "dog", "cat", "bird", "bird", "ant"}, 3, []string{"bird", "cat", "dog"}},
		{[]string{"solo"}, 1, []string{"solo"}},
		{[]string{"z", "y", "x"}, 1, []string{"x"}},
		{[]string{"aa", "a", "aaa", "a", "aa"}, 3, []string{"a", "aa", "aaa"}},
		{[]string{"q", "w", "e", "w"}, 3, []string{"w", "e", "q"}},
		{[]string{"x", "y", "y", "x", "z"}, 1, []string{"x"}},
		{big, 25, top25},
		{big, 200, all},
	}
	failed := false
	for n, c := range cases {
		got := topKFrequent(append([]string(nil), c.words...), c.k)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Printf("case %d k=%d: expected %v, got %v\n", n, c.k, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
