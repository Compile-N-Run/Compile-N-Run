package main

import (
	"fmt"
	"os"
	"reflect"
	"strings"
)

// Parses "[[4,5],6,[7,[8]]]" (no spaces) into NestedIntegers.
func parseNested(s string, i *int) NestedInteger {
	if s[*i] == '[' {
		list := NestedInteger{}
		*i++
		for s[*i] != ']' {
			list.Add(parseNested(s, i))
			if s[*i] == ',' {
				*i++
			}
		}
		*i++
		return list
	}
	sign, value := 1, 0
	if s[*i] == '-' {
		sign = -1
		*i++
	}
	for *i < len(s) && s[*i] >= '0' && s[*i] <= '9' {
		value = value*10 + int(s[*i]-'0')
		*i++
	}
	ni := NestedInteger{}
	ni.SetInteger(sign * value)
	return ni
}

func parseList(s string) []*NestedInteger {
	i := 0
	return parseNested(s, &i).GetList()
}

func flattenNested(list []*NestedInteger, out []int) []int {
	for _, ni := range list {
		if ni.IsInteger() {
			out = append(out, ni.GetInteger())
		} else {
			out = flattenNested(ni.GetList(), out)
		}
	}
	return out
}

func main() {
	var big strings.Builder
	big.WriteString("[")
	for i := 0; i < 500; i++ { // 1000 integers, half of them nested
		if i > 0 {
			big.WriteString(",")
		}
		fmt.Fprintf(&big, "%d,[[%d],[]]", i, i)
	}
	big.WriteString("]")
	deep := "[" + strings.Repeat("[", 200) + "42" + strings.Repeat("]", 200) + "]" // one integer wrapped in 200 lists
	cases := []string{"[[4,5],6,[7,[8]]]", "[1,[2,[3,[4,[5]]]]]", "[[],[[]],9]", "[]", "[[[]]]", "[9]",
		"[[[[-7]]],0,[],[3]]", "[[2,2],3,[2,2]]", big.String(), deep}
	failed := false
	for _, spec := range cases {
		list := parseList(spec)
		expected := flattenNested(list, []int{})
		it := Constructor(list)
		got := []int{}
		for it.HasNext() {
			got = append(got, it.Next())
		}
		if !reflect.DeepEqual(got, expected) {
			label := spec
			if len(spec) > 40 {
				label = spec[:40] + "..."
			}
			fmt.Printf("%s: expected %v, got %v\n", label, expected, got)
			failed = true
		}
	}
	// HasNext must not consume anything, however often it is called
	it := Constructor(parseList("[[],5]"))
	if !(it.HasNext() && it.HasNext() && it.HasNext()) {
		fmt.Println("[[],5]: HasNext should stay true when called three times")
		failed = true
	}
	if got := it.Next(); got != 5 {
		fmt.Printf("[[],5]: expected Next() = 5 after repeated HasNext, got %d\n", got)
		failed = true
	}
	if it.HasNext() {
		fmt.Println("[[],5]: HasNext should be false at the end")
		failed = true
	}
	if failed {
		os.Exit(1)
	}
}
