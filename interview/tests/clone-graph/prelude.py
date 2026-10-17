# LeetCode's Node for this problem: a graph node with a value and a list of neighbours.
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
