package main

import (
	"fmt"
	"os"
	"reflect"
)

// A spec is a list of {val, random index or -1}.
func buildRandomList(spec [][2]int) *Node {
	nodes := make([]*Node, len(spec))
	for i, s := range spec {
		nodes[i] = &Node{Val: s[0]}
	}
	for i, s := range spec {
		if i+1 < len(nodes) {
			nodes[i].Next = nodes[i+1]
		}
		if s[1] >= 0 {
			nodes[i].Random = nodes[s[1]]
		}
	}
	if len(nodes) == 0 {
		return nil
	}
	return nodes[0]
}

func nodesOf(head *Node) []*Node {
	out := []*Node{}
	for ; head != nil; head = head.Next {
		out = append(out, head)
	}
	return out
}

func describeRandomList(head *Node) [][2]int { // -2 marks a random pointer leaving the list
	nodes := nodesOf(head)
	index := map[*Node]int{}
	for i, node := range nodes {
		index[node] = i
	}
	out := [][2]int{}
	for _, node := range nodes {
		r := -1
		if node.Random != nil {
			r = -2
			if i, ok := index[node.Random]; ok {
				r = i
			}
		}
		out = append(out, [2]int{node.Val, r})
	}
	return out
}

func main() {
	cases := [][][2]int{{{4, 2}, {8, -1}, {2, 0}}, {{6, 0}}, {{1, 1}, {1, 0}, {1, -1}}, {},
		{{1, -1}, {2, -1}, {3, -1}}, {{-10000, 4}, {0, 4}, {5, 4}, {10000, 4}, {7, 4}}, {{3, 1}, {9, 0}}}
	big := [][2]int{}
	for i := 0; i < 1000; i++ {
		r := i * 7 % 1000
		if i%5 == 0 {
			r = -1
		}
		big = append(big, [2]int{i - 500, r})
	}
	cases = append(cases, big)
	failed := false
	for n, spec := range cases {
		head := buildRandomList(spec)
		originals := map[*Node]bool{}
		for _, node := range nodesOf(head) {
			originals[node] = true
		}
		copied := copyRandomList(head)
		if got := describeRandomList(copied); !reflect.DeepEqual(got, spec) {
			fmt.Printf("case %d copy: expected %v, got %v\n", n, spec, got)
			failed = true
		}
		if got := describeRandomList(head); !reflect.DeepEqual(got, spec) {
			fmt.Printf("case %d: original changed to %v\n", n, got)
			failed = true
		}
		for _, node := range nodesOf(copied) {
			if originals[node] {
				fmt.Printf("case %d: copy shares nodes with the original\n", n)
				failed = true
				break
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
