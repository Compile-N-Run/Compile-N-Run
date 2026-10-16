package main

import (
	"fmt"
	"os"
)

func findNode(root *TreeNode, val int) *TreeNode {
	stack := []*TreeNode{root}
	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if node == nil {
			continue
		}
		if node.Val == val {
			return node
		}
		stack = append(stack, node.Left, node.Right)
	}
	return nil
}

func main() {
	example := []int{10, 4, 15, 1, 7, NUL, 20, NUL, NUL, 6, 9}
	full := []int{} // complete tree of 1023 nodes
	for i := 1; i <= 1023; i++ {
		full = append(full, i)
	}
	chain := []int{0} // 0 -> 1 -> ... -> 499 down the left side
	for i := 1; i < 500; i++ {
		chain = append(chain, i, NUL)
	}
	cases := []struct {
		values         []int
		p, q, expected int
	}{{example, 6, 9, 7}, {example, 1, 9, 4}, {example, 4, 6, 4}, {example, 9, 20, 10},
		{example, 15, 20, 15}, {[]int{1, 2}, 1, 2, 1}, {[]int{1, 2}, 2, 1, 1}, {[]int{0, -5, 8, NUL, -3}, -3, 8, 0},
		{full, 1000, 1023, 31}, {full, 1000, 1001, 500}, {full, 960, 975, 60}, {chain, 499, 200, 200}}
	failed := false
	for _, c := range cases {
		root := buildTree(c.values)
		got := lowestCommonAncestor(root, findNode(root, c.p), findNode(root, c.q))
		if got == nil || got != findNode(root, c.expected) {
			fmt.Printf("p=%d q=%d: expected %d, got %v\n", c.p, c.q, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
