package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	big := make([]string, 101)
	for i := range big {
		big[i] = "abc"
	}
	bigExpected := []string{}
	for i := 0; i < 50; i++ {
		bigExpected = append(bigExpected, "abc    abc")
	}
	bigExpected = append(bigExpected, "abc       ")
	cases := []struct {
		words    []string
		width    int
		expected []string
	}{
		{[]string{"ab", "c", "de", "fghij"}, 10, []string{"ab   c  de", "fghij     "}},
		{[]string{"hello", "extraordinary", "ok"}, 13, []string{"hello        ", "extraordinary", "ok           "}},
		{[]string{"we", "can", "solve", "this", "one", "line", "at", "a", "time"}, 11, []string{"we      can", "solve  this", "one line at", "a time     "}},
		{[]string{"word"}, 4, []string{"word"}},
		{[]string{"hi"}, 5, []string{"hi   "}},
		{[]string{"a", "b", "c", "d", "e"}, 3, []string{"a b", "c d", "e  "}},
		{[]string{"x", "y", "z", "w", "longword"}, 9, []string{"x  y  z w", "longword "}},
		{big, 10, bigExpected},
	}
	failed := false
	for i, c := range cases {
		got := fullJustify(append([]string(nil), c.words...), c.width)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Printf("case %d expected %q got %q\n", i, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
