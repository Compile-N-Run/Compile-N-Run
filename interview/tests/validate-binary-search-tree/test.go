package main

import (
	"fmt"
	"math"
	"os"
)

func balanced(lo, hi int) *TreeNode { // a perfectly balanced BST holding lo..hi
	if lo > hi {
		return nil
	}
	mid := lo + (hi-lo)/2
	return &TreeNode{Val: mid, Left: balanced(lo, mid-1), Right: balanced(mid+1, hi)}
}

func main() {
	chain := []int{1} // 1 -> 2 -> ... -> 500 down the right side
	for i := 2; i <= 500; i++ {
		chain = append(chain, NUL, i)
	}
	dip := append([]int{}, chain...)
	dip[2*249] = 100 // node 250 is replaced by 100, which is smaller than its ancestors
	cases := []struct {
		values   []int
		expected bool
	}{
		{[]int{8, 3, 10}, true},
		{[]int{8, 3, 10, NUL, NUL, 6, 12}, false},
		{[]int{5, 5}, false},
		{[]int{math.MaxInt32}, true},
		{[]int{3, 1, 5, 0, 2, 4, 6}, true},
		{[]int{3, 1, 5, 0, 4, 4, 6}, false},
		{[]int{10, 5, 15, NUL, NUL, 6, 20}, false},
		{[]int{10, 5, 15, NUL, NUL, 12, 20}, true},
		{chain, true},
		{dip, false},
	}
	failed := false
	report := func(got, expected bool, label string) {
		if got != expected {
			fmt.Printf("%s: expected %v, got %v\n", label, expected, got)
			failed = true
		}
	}
	for n, c := range cases {
		report(isValidBST(buildTree(c.values)), c.expected, fmt.Sprintf("case %d", n))
	}
	// math.MinInt32 is the NUL marker of buildTree, so these trees are built by hand.
	report(isValidBST(&TreeNode{Val: math.MinInt32}), true, "[INT_MIN]")
	report(isValidBST(&TreeNode{Val: math.MinInt32, Right: &TreeNode{Val: math.MaxInt32}}), true, "[INT_MIN, null, INT_MAX]")
	report(isValidBST(&TreeNode{Val: math.MaxInt32, Left: &TreeNode{Val: math.MinInt32}}), true, "[INT_MAX, INT_MIN]")
	report(isValidBST(&TreeNode{Val: math.MinInt32, Left: &TreeNode{Val: math.MaxInt32}}), false, "[INT_MIN, INT_MAX]")

	big := balanced(1, 4095)
	report(isValidBST(big), true, "balanced BST of 1..4095")
	node := big
	for node.Left != nil {
		node = node.Left
	}
	node.Val = 5000 // the leftmost leaf now exceeds every ancestor
	report(isValidBST(big), false, "balanced BST of 1..4095 with leftmost leaf set to 5000")
	if failed {
		os.Exit(1)
	}
}
