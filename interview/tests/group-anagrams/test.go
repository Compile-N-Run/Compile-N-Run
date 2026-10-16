package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
	"strings"
)

func normGroups(groups [][]string) []string {
	out := []string{}
	for _, g := range groups {
		c := append([]string(nil), g...)
		sort.Strings(c)
		out = append(out, strings.Join(c, ",")+";")
	}
	sort.Strings(out)
	return out
}

func main() {
	cases := []struct {
		strs     []string
		expected [][]string
	}{{[]string{"note", "stone", "tone", "onset", "cat"}, [][]string{{"note", "tone"}, {"stone", "onset"}, {"cat"}}},
		{[]string{"", "b", ""}, [][]string{{"", ""}, {"b"}}}, {[]string{"loop"}, [][]string{{"loop"}}}, {[]string{""}, [][]string{{""}}},
		{[]string{"ab", "ab", "ba", "abb"}, [][]string{{"ab", "ab", "ba"}, {"abb"}}},
		{[]string{"aab", "abb", "bab", "aba"}, [][]string{{"aab", "aba"}, {"abb", "bab"}}},
		{[]string{"x", "y", "z"}, [][]string{{"x"}, {"y"}, {"z"}}}}
	// Larger case: 1000 rotations of prefixes of "abcdefghij"; words of equal length are anagrams.
	big := []string{}
	expectedBig := make([][]string, 10)
	for i := 0; i < 1000; i++ {
		n := i%10 + 1
		r := (i / 10) % n
		base := "abcdefghij"[:n]
		w := base[r:] + base[:r]
		big = append(big, w)
		expectedBig[n-1] = append(expectedBig[n-1], w)
	}
	cases = append(cases, struct {
		strs     []string
		expected [][]string
	}{big, expectedBig})
	failed := false
	for _, c := range cases {
		got := normGroups(groupAnagrams(append([]string(nil), c.strs...)))
		want := normGroups(c.expected)
		if !reflect.DeepEqual(got, want) {
			fmt.Println(len(c.strs), "strings: expected", want, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
