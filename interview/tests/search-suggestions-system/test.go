package main

import (
	"fmt"
	"os"
	"reflect"
)

type suggestCase struct {
	products []string
	word     string
	expected [][]string
}

func main() {
	items := []string{}
	for i := 999; i >= 0; i-- {
		items = append(items, fmt.Sprintf("item%04d", i))
	}
	firstThree := []string{"item0000", "item0001", "item0002"}
	cases := []suggestCase{
		{[]string{"banana", "band", "bandana", "bandit", "bank"}, "band",
			[][]string{{"banana", "band", "bandana"}, {"banana", "band", "bandana"}, {"banana", "band", "bandana"}, {"band", "bandana", "bandit"}}},
		{[]string{"apple", "apply", "ape"}, "apex", [][]string{{"ape", "apple", "apply"}, {"ape", "apple", "apply"}, {"ape"}, {}}},
		{[]string{"cat"}, "dog", [][]string{{}, {}, {}}},
		{[]string{"code", "coder", "codes", "coding"}, "code",
			[][]string{{"code", "coder", "codes"}, {"code", "coder", "codes"}, {"code", "coder", "codes"}, {"code", "coder", "codes"}}},
		{[]string{"a", "aa", "aaa", "aaaa"}, "aaaa", [][]string{{"a", "aa", "aaa"}, {"aa", "aaa", "aaaa"}, {"aaa", "aaaa"}, {"aaaa"}}},
		{[]string{"zebra", "zoo"}, "az", [][]string{{}, {}}},
		{[]string{"sun", "sea", "sand", "sugar"}, "s", [][]string{{"sand", "sea", "sugar"}}},
		{[]string{"tea", "ten", "team", "teach", "tear", "teal"}, "tean",
			[][]string{{"tea", "teach", "teal"}, {"tea", "teach", "teal"}, {"tea", "teach", "teal"}, {}}},
		{items, "item0999",
			[][]string{firstThree, firstThree, firstThree, firstThree, firstThree,
				{"item0900", "item0901", "item0902"}, {"item0990", "item0991", "item0992"}, {"item0999"}}},
	}
	failed := false
	for n, c := range cases {
		got := suggestedProducts(append([]string{}, c.products...), c.word)
		for i := range got { // an empty entry may be nil or an empty slice
			if len(got[i]) == 0 {
				got[i] = []string{}
			}
		}
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Printf("case %d %q: expected %v, got %v\n", n, c.word, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
