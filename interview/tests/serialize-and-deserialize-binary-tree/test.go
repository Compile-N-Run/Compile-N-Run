package main

import (
	"fmt"
	"os"
)

func sameTree(a, b *TreeNode) bool {
	if a == nil || b == nil {
		return a == b
	}
	return a.Val == b.Val && sameTree(a.Left, b.Left) && sameTree(a.Right, b.Right)
}

func main() {
	chain := []int{0} // 0 -> 1 -> ... -> 499 down the left side
	for i := 1; i < 500; i++ {
		chain = append(chain, i, NUL)
	}
	full := []int{} // complete tree of 1023 nodes
	for i := 1; i <= 1023; i++ {
		full = append(full, i)
	}
	cases := [][]int{
		{},
		{1},
		{1, 2, 3, NUL, NUL, 4, 5},
		{-5, NUL, 7},
		{100, 20, 300},
		{0, 0, 0},
		{1, NUL, 2, NUL, 3},
		{-1, -2, -3, -4, NUL, NUL, -5},
		{2147483647, -2147483647}, // NUL is the smallest 32-bit value, so stay one above it
		{7, 7, NUL, 7, NUL, 7},
		chain,
		full,
	}
	failed := false
	fail := func(n int, values []int, msg string) {
		fmt.Printf("case %d (n=%d): %s\n", n, len(values), msg)
		failed = true
	}
	for n, values := range cases {
		root := buildTree(values)
		ser, deser := Constructor(), Constructor() // separate instances, as LeetCode calls them
		got := deser.deserialize(ser.serialize(root))
		if !sameTree(got, buildTree(values)) {
			fail(n, values, "round trip changed the tree")
		}
		if root != nil && got == root {
			fail(n, values, "deserialize must build a new tree")
		}
		// The rebuilt tree must serialize and rebuild again just as well.
		ser2, deser2 := Constructor(), Constructor()
		if again := deser2.deserialize(ser2.serialize(got)); !sameTree(again, buildTree(values)) {
			fail(n, values, "second round trip")
		}
	}
	if failed {
		os.Exit(1)
	}
}
