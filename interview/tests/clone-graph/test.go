package main

import (
	"fmt"
	"os"
	"reflect"
)

// adj[i] lists the (1-based) neighbours of node i + 1. Returns node 1, or nil for an empty graph.
func buildGraph(adj [][]int) *Node {
	nodes := make([]*Node, len(adj))
	for i := range adj {
		nodes[i] = &Node{Val: i + 1}
	}
	for i, neighbours := range adj {
		for _, j := range neighbours {
			nodes[i].Neighbors = append(nodes[i].Neighbors, nodes[j-1])
		}
	}
	if len(nodes) == 0 {
		return nil
	}
	return nodes[0]
}

func graphNodes(start *Node) []*Node { // every node reachable from start, each object once
	seen := map[*Node]bool{}
	out := []*Node{}
	stack := []*Node{}
	if start != nil {
		stack = append(stack, start)
	}
	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if seen[node] {
			continue
		}
		seen[node] = true
		out = append(out, node)
		stack = append(stack, node.Neighbors...)
	}
	return out
}

// Back to an adjacency list; a node whose value is out of range or repeated makes the result differ from the input.
func describeGraph(start *Node) [][]int {
	nodes := graphNodes(start)
	byVal := map[int]*Node{}
	for _, node := range nodes {
		if byVal[node.Val] != nil {
			return [][]int{{-node.Val}} // two nodes with the same value
		}
		byVal[node.Val] = node
	}
	out := [][]int{}
	for v := 1; v <= len(nodes); v++ {
		node := byVal[v]
		if node == nil {
			return [][]int{{0}} // values are not 1..n
		}
		row := []int{}
		for _, nb := range node.Neighbors {
			row = append(row, nb.Val)
		}
		out = append(out, row)
	}
	return out
}

func ringWithChords(n int) [][]int { // node i joined to its two ring neighbours and to the node opposite it
	adj := [][]int{}
	for i := 1; i <= n; i++ {
		adj = append(adj, []int{(i-2+n)%n + 1, i%n + 1, (i+n/2-1)%n + 1})
	}
	return adj
}

func main() {
	cases := [][][]int{
		{{2, 4}, {1, 3}, {2, 4}, {1, 3}}, // a square
		{{}},                             // a single node
		{},                               // empty graph
		{{2}, {1}},
		{{2, 3}, {1, 3}, {1, 2}},                  // a triangle
		{{2}, {1, 3}, {2, 4}, {3, 5}, {4}},        // a path
		{{2, 3, 4, 5, 6}, {1}, {1}, {1}, {1}, {1}}, // a star
		{{2, 3, 4}, {1, 3}, {1, 2, 4}, {1, 3}},
		ringWithChords(100), // the largest allowed graph
	}
	failed := false
	for n, adj := range cases {
		start := buildGraph(adj)
		originals := map[*Node]bool{}
		for _, node := range graphNodes(start) {
			originals[node] = true
		}
		clone := cloneGraph(start)
		if len(adj) == 0 {
			if clone != nil {
				fmt.Printf("case %d (empty graph): expected nil, got a node\n", n)
				failed = true
			}
			continue
		}
		if got := describeGraph(clone); !reflect.DeepEqual(got, adj) {
			fmt.Printf("case %d (%d nodes) clone: expected %v, got %v\n", n, len(adj), adj, got)
			failed = true
		}
		if got := describeGraph(start); !reflect.DeepEqual(got, adj) {
			fmt.Printf("case %d (%d nodes): original changed to %v\n", n, len(adj), got)
			failed = true
		}
		for _, node := range graphNodes(clone) {
			if originals[node] {
				fmt.Printf("case %d (%d nodes): clone shares nodes with the original\n", n, len(adj))
				failed = true
				break
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
