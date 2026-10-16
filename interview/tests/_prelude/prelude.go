package main

// Shared definitions available to every Go solution (LeetCode provides these implicitly).

type ListNode struct {
	Val  int
	Next *ListNode
}

type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

func buildList(values []int) *ListNode {
	head := &ListNode{}
	tail := head
	for _, v := range values {
		tail.Next = &ListNode{Val: v}
		tail = tail.Next
	}
	return head.Next
}

func listValues(node *ListNode) []int {
	out := []int{}
	for ; node != nil; node = node.Next {
		out = append(out, node.Val)
	}
	return out
}

// NUL marks a missing child in buildTree input.
const NUL = -1 << 31

func buildTree(values []int) *TreeNode {
	if len(values) == 0 || values[0] == NUL {
		return nil
	}
	root := &TreeNode{Val: values[0]}
	queue := []*TreeNode{root}
	for i := 1; len(queue) > 0 && i < len(values); {
		node := queue[0]
		queue = queue[1:]
		if i < len(values) && values[i] != NUL {
			node.Left = &TreeNode{Val: values[i]}
			queue = append(queue, node.Left)
		}
		i++
		if i < len(values) && values[i] != NUL {
			node.Right = &TreeNode{Val: values[i]}
			queue = append(queue, node.Right)
		}
		i++
	}
	return root
}
