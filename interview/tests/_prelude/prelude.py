# Shared definitions available to every Python solution (LeetCode provides these implicitly).
from typing import *  # noqa: F401,F403
import collections, heapq, bisect, itertools, functools, math  # noqa: F401,E401
from collections import defaultdict, deque, Counter, OrderedDict  # noqa: F401
from functools import lru_cache, cache  # noqa: F401
import sys
sys.setrecursionlimit(10000)  # LeetCode allows deep recursion (chains of thousands of nodes); CPython's default 1000 does not


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_list(values):
    head = tail = ListNode()
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return head.next


def list_values(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out


def build_tree(values):
    """Level-order list with None for missing children, as LeetCode prints trees."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue, i = deque([root]), 1
    while queue and i < len(values):
        node = queue.popleft()
        for side in ('left', 'right'):
            if i < len(values) and values[i] is not None:
                child = TreeNode(values[i])
                setattr(node, side, child)
                queue.append(child)
            i += 1
    return root


def check(actual, expected, label=''):
    if actual != expected:
        raise AssertionError(f'{label}: expected {expected!r}, got {actual!r}')
