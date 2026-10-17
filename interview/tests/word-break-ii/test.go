package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
	"strings"
)

func main() {
	cases := []struct {
		s        string
		words    []string
		expected []string
	}{
		{"icecreamcone", []string{"ice", "cream", "cone", "icecream"}, []string{"ice cream cone", "icecream cone"}},
		{"sunflowerpot", []string{"sun", "flower", "pot", "flow", "erpot"}, []string{"sun flow erpot", "sun flower pot"}},
		{"hotdogs", []string{"hot", "dog", "hotdog"}, []string{}},
		{"a", []string{"a"}, []string{"a"}},
		{"a", []string{"b"}, []string{}},
		{"aaa", []string{"a", "aa"}, []string{"a a a", "a aa", "aa a"}},
		{"abab", []string{"ab", "abab", "a", "b"}, []string{"a b a b", "a b ab", "ab a b", "ab ab", "abab"}},
		{strings.Repeat("a", 25) + "b", []string{"a", "aa", "aaa"}, []string{}},
	}
	failed := false
	for n, c := range cases {
		got := wordBreak(c.s, append([]string(nil), c.words...))
		if got == nil {
			got = []string{}
		}
		sort.Strings(got)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}

	// Larger case: 'a' * 12 with pieces of 1-3 letters has 927 sentences (a tribonacci number).
	big := strings.Repeat("a", 12)
	bigWords := []string{"a", "aa", "aaa"}
	allowed := map[string]bool{"a": true, "aa": true, "aaa": true}
	got := wordBreak(big, bigWords)
	seen := map[string]bool{}
	for _, sentence := range got {
		seen[sentence] = true
		for _, w := range strings.Split(sentence, " ") {
			if !allowed[w] {
				fmt.Println("not a dictionary word in", sentence)
				failed = true
			}
		}
		if strings.ReplaceAll(sentence, " ", "") != big {
			fmt.Println("sentence does not spell s:", sentence)
			failed = true
		}
	}
	if len(got) != 927 || len(seen) != 927 {
		fmt.Println("expected 927 distinct sentences, got", len(got), len(seen))
		failed = true
	}
	if failed {
		os.Exit(1)
	}
}
