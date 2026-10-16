package main

// LeetCode's Node for this problem: a linked list node with an extra Random pointer.
type Node struct {
	Val    int
	Next   *Node
	Random *Node
}
