import { Problem } from './problems';

export interface CompanyProblem extends Problem {
  company: string;
  tags: string[];
  frequency: 'High' | 'Medium' | 'Low';
  hints: string[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
  problems: CompanyProblem[];
}

// ============================================
// GOOGLE PROBLEMS (5 questions)
// ============================================
const googleProblems: CompanyProblem[] = [
  {
    id: 'google-two-sum',
    company: 'google',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    frequency: 'High',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
    starterCode: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'two_sum',
    testCases: [
      { inputs: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { inputs: [[3, 2, 4], 6], expected: [1, 2] },
      { inputs: [[3, 3], 6], expected: [0, 1] },
    ],
    hints: [
      'Think about what data structure allows O(1) lookups.',
      'For each number, you need to find if (target - num) exists in the array.',
      'Use a hash map to store numbers and their indices as you iterate.',
    ],
  },
  {
    id: 'google-merge-intervals',
    company: 'google',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    frequency: 'High',
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explanation: 'Intervals [1,4] and [4,5] are considered overlapping.' },
    ],
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= starti <= endi <= 10^4'],
    starterCode: `def merge(intervals):
    """
    :type intervals: List[List[int]]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'merge',
    testCases: [
      { inputs: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]] },
      { inputs: [[[1,4],[4,5]]], expected: [[1,5]] },
    ],
    hints: [
      'What if you sort the intervals by their start time first?',
      'After sorting, compare each interval with the last merged interval.',
      'If the current interval overlaps with the last merged one, extend it. Otherwise, add a new interval.',
    ],
  },
  {
    id: 'google-word-ladder',
    company: 'google',
    title: 'Word Ladder',
    difficulty: 'Hard',
    tags: ['BFS', 'Hash Table', 'String'],
    frequency: 'Medium',
    description: `Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the number of words in the shortest transformation sequence from \`beginWord\` to \`endWord\`, or 0 if no such sequence exists.

Each adjacent pair of words differs by a single letter.`,
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explanation: 'One shortest transformation is "hit" -> "hot" -> "dot" -> "dog" -> "cog".' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', explanation: 'The endWord "cog" is not in wordList.' },
    ],
    constraints: ['1 <= beginWord.length <= 10', 'endWord.length == beginWord.length', '1 <= wordList.length <= 5000'],
    starterCode: `def ladder_length(beginWord, endWord, wordList):
    """
    :type beginWord: str
    :type endWord: str
    :type wordList: List[str]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'ladder_length',
    testCases: [
      { inputs: ['hit', 'cog', ['hot','dot','dog','lot','log','cog']], expected: 5 },
      { inputs: ['hit', 'cog', ['hot','dot','dog','lot','log']], expected: 0 },
    ],
    hints: [
      'This is a shortest path problem. What algorithm finds shortest paths?',
      'Use BFS where each node is a word and edges connect words differing by one letter.',
      'Create a pattern dictionary (e.g., h*t matches hot, hit) for O(1) neighbor lookup.',
    ],
  },
  {
    id: 'google-lru-cache',
    company: 'google',
    title: 'LRU Cache',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design'],
    frequency: 'High',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class with \`get\` and \`put\` operations in O(1) time complexity.`,
    examples: [
      { input: '["LRUCache","put","put","get","put","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2]]', output: '[null,null,null,1,null,-1]' },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5'],
    starterCode: `class LRUCache:
    def __init__(self, capacity: int):
        # Initialize your data structure
        pass

    def get(self, key: int) -> int:
        # Return value if exists, else -1
        pass

    def put(self, key: int, value: int) -> None:
        # Insert or update key-value pair
        pass`,
    functionName: 'LRUCache',
    testCases: [
      { inputs: [2, [['put',1,1],['put',2,2],['get',1],['put',3,3],['get',2]]], expected: [null,null,1,null,-1] },
    ],
    hints: [
      'You need O(1) access by key AND O(1) ordering updates. What combination achieves this?',
      'Combine a hash map (O(1) access) with a doubly linked list (O(1) reordering).',
      'The most recently used item goes to the head, least recently used at the tail.',
    ],
  },
  {
    id: 'google-median-two-arrays',
    company: 'google',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    frequency: 'Medium',
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0', explanation: 'merged array = [1,2,3] and median is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5', explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.' },
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000'],
    starterCode: `def find_median_sorted_arrays(nums1, nums2):
    """
    :type nums1: List[int]
    :type nums2: List[int]
    :rtype: float
    """
    # Write your solution here
    pass`,
    functionName: 'find_median_sorted_arrays',
    testCases: [
      { inputs: [[1,3], [2]], expected: 2.0 },
      { inputs: [[1,2], [3,4]], expected: 2.5 },
    ],
    hints: [
      'Binary search on the smaller array to find the correct partition.',
      'You want to partition both arrays such that left half contains smaller elements.',
      'The median is derived from the max of left partition and min of right partition.',
    ],
  },
];

// ============================================
// AMAZON PROBLEMS (5 questions)
// ============================================
const amazonProblems: CompanyProblem[] = [
  {
    id: 'amazon-product-except-self',
    company: 'amazon',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    tags: ['Array', 'Prefix Sum'],
    frequency: 'High',
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
    ],
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30'],
    starterCode: `def product_except_self(nums):
    """
    :type nums: List[int]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'product_except_self',
    testCases: [
      { inputs: [[1,2,3,4]], expected: [24,12,8,6] },
      { inputs: [[-1,1,0,-3,3]], expected: [0,0,9,0,0] },
    ],
    hints: [
      'Think about prefix and suffix products separately.',
      'For each index, the answer is (product of all elements before it) * (product of all elements after it).',
      'You can do this in two passes: one for prefix products, one for suffix products.',
    ],
  },
  {
    id: 'amazon-number-of-islands',
    company: 'amazon',
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Graph', 'Matrix'],
    frequency: 'High',
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', "grid[i][j] is '0' or '1'."],
    starterCode: `def num_islands(grid):
    """
    :type grid: List[List[str]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'num_islands',
    testCases: [
      { inputs: [[['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]], expected: 1 },
      { inputs: [[['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]], expected: 3 },
    ],
    hints: [
      'When you find a "1", that is a new island. Mark all connected "1"s as visited.',
      'Use DFS or BFS to explore all cells connected to the current island.',
      'Count how many times you start a new DFS/BFS traversal.',
    ],
  },
  {
    id: 'amazon-min-cost-climbing-stairs',
    company: 'amazon',
    title: 'Min Cost Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `You are given an integer array \`cost\` where \`cost[i]\` is the cost of \`i\`th step on a staircase. Once you pay the cost, you can either climb one or two steps.

You can either start from the step with index 0, or the step with index 1.

Return the minimum cost to reach the top of the floor.`,
    examples: [
      { input: 'cost = [10,15,20]', output: '15', explanation: 'Start at index 1, pay 15, climb 2 steps to reach the top.' },
      { input: 'cost = [1,100,1,1,1,100,1,1,100,1]', output: '6' },
    ],
    constraints: ['2 <= cost.length <= 1000', '0 <= cost[i] <= 999'],
    starterCode: `def min_cost_climbing_stairs(cost):
    """
    :type cost: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'min_cost_climbing_stairs',
    testCases: [
      { inputs: [[10,15,20]], expected: 15 },
      { inputs: [[1,100,1,1,1,100,1,1,100,1]], expected: 6 },
    ],
    hints: [
      'This is a classic dynamic programming problem.',
      'dp[i] = min cost to reach step i = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]).',
      'You only need to track the last two values, so O(1) space is possible.',
    ],
  },
  {
    id: 'amazon-meeting-rooms-ii',
    company: 'amazon',
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting', 'Heap'],
    frequency: 'High',
    description: `Given an array of meeting time intervals \`intervals\` where \`intervals[i] = [starti, endi]\`, return the minimum number of conference rooms required.`,
    examples: [
      { input: 'intervals = [[0,30],[5,10],[15,20]]', output: '2' },
      { input: 'intervals = [[7,10],[2,4]]', output: '1' },
    ],
    constraints: ['1 <= intervals.length <= 10^4', '0 <= starti < endi <= 10^6'],
    starterCode: `def min_meeting_rooms(intervals):
    """
    :type intervals: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'min_meeting_rooms',
    testCases: [
      { inputs: [[[0,30],[5,10],[15,20]]], expected: 2 },
      { inputs: [[[7,10],[2,4]]], expected: 1 },
    ],
    hints: [
      'Sort meetings by start time. Use a min-heap to track room end times.',
      'If the earliest ending room ends before the new meeting starts, reuse that room.',
      'Otherwise, allocate a new room. The heap size at the end is the answer.',
    ],
  },
  {
    id: 'amazon-trapping-rain-water',
    company: 'amazon',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Stack', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    starterCode: `def trap(height):
    """
    :type height: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'trap',
    testCases: [
      { inputs: [[0,1,0,2,1,0,1,3,2,1,2,1]], expected: 6 },
      { inputs: [[4,2,0,3,2,5]], expected: 9 },
    ],
    hints: [
      'Water at each position = min(maxLeft, maxRight) - height[i].',
      'You can precompute maxLeft and maxRight arrays, or use two pointers.',
      'Two pointer approach: move the pointer with smaller max height inward.',
    ],
  },
];

// ============================================
// META PROBLEMS (5 questions)
// ============================================
const metaProblems: CompanyProblem[] = [
  {
    id: 'meta-valid-palindrome-ii',
    company: 'meta',
    title: 'Valid Palindrome II',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers', 'Greedy'],
    frequency: 'High',
    description: `Given a string \`s\`, return \`true\` if the \`s\` can be palindrome after deleting at most one character from it.`,
    examples: [
      { input: 's = "aba"', output: 'true' },
      { input: 's = "abca"', output: 'true', explanation: 'You could delete the character "c".' },
      { input: 's = "abc"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's consists of lowercase English letters.'],
    starterCode: `def valid_palindrome(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'valid_palindrome',
    testCases: [
      { inputs: ['aba'], expected: true },
      { inputs: ['abca'], expected: true },
      { inputs: ['abc'], expected: false },
    ],
    hints: [
      'Use two pointers from both ends moving inward.',
      'When characters mismatch, try skipping either the left or right character.',
      'Check if the remaining substring is a palindrome.',
    ],
  },
  {
    id: 'meta-subarray-sum-equals-k',
    company: 'meta',
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Prefix Sum'],
    frequency: 'High',
    description: `Given an array of integers \`nums\` and an integer \`k\`, return the total number of subarrays whose sum equals to \`k\`.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2' },
      { input: 'nums = [1,2,3], k = 3', output: '2' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
    starterCode: `def subarray_sum(nums, k):
    """
    :type nums: List[int]
    :type k: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'subarray_sum',
    testCases: [
      { inputs: [[1,1,1], 2], expected: 2 },
      { inputs: [[1,2,3], 3], expected: 2 },
    ],
    hints: [
      'Use prefix sums. If prefix[j] - prefix[i] = k, then subarray [i+1, j] sums to k.',
      'Store prefix sums in a hash map to find complements in O(1).',
      'Count how many times (currentSum - k) has appeared before.',
    ],
  },
  {
    id: 'meta-random-pick-weight',
    company: 'meta',
    title: 'Random Pick with Weight',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search', 'Prefix Sum', 'Randomized'],
    frequency: 'Medium',
    description: `You are given a 0-indexed array of positive integers \`w\` where \`w[i]\` describes the weight of the \`i\`th index.

Implement the function \`pickIndex()\` which randomly picks an index in the range \`[0, w.length - 1]\` (inclusive) and returns it. The probability of picking an index \`i\` is \`w[i] / sum(w)\`.`,
    examples: [
      { input: '["Solution","pickIndex"]\n[[[1]],[]]', output: '[null,0]' },
      { input: '["Solution","pickIndex","pickIndex"]\n[[[1,3]],[],[]]', output: '[null,1,1]', explanation: 'Index 1 has 3x higher probability than index 0.' },
    ],
    constraints: ['1 <= w.length <= 10^4', '1 <= w[i] <= 10^5'],
    starterCode: `import random

class Solution:
    def __init__(self, w):
        """
        :type w: List[int]
        """
        # Initialize with weights
        pass

    def pickIndex(self):
        """
        :rtype: int
        """
        # Return weighted random index
        pass`,
    functionName: 'Solution',
    testCases: [
      { inputs: [[1,3]], expected: 'weighted_random' },
    ],
    hints: [
      'Build a prefix sum array. Each index i "owns" the range [prefix[i-1], prefix[i]).',
      'Generate a random number between 1 and total sum.',
      'Use binary search to find which index that random number falls into.',
    ],
  },
  {
    id: 'meta-binary-tree-paths',
    company: 'meta',
    title: 'Binary Tree Paths',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS', 'String', 'Backtracking'],
    frequency: 'Medium',
    description: `Given the root of a binary tree, return all root-to-leaf paths in any order.

A leaf is a node with no children.`,
    examples: [
      { input: 'root = [1,2,3,null,5]', output: '["1->2->5","1->3"]' },
      { input: 'root = [1]', output: '["1"]' },
    ],
    constraints: ['The number of nodes in the tree is in the range [1, 100].', '-100 <= Node.val <= 100'],
    starterCode: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def binary_tree_paths(root):
    """
    :type root: TreeNode
    :rtype: List[str]
    """
    # Write your solution here
    pass`,
    functionName: 'binary_tree_paths',
    testCases: [
      { inputs: [[1,2,3,null,5]], expected: ['1->2->5','1->3'] },
    ],
    hints: [
      'Use DFS to traverse the tree, building the path as you go.',
      'When you reach a leaf node, add the current path to your result.',
      'Backtrack when returning from a node to explore other branches.',
    ],
  },
  {
    id: 'meta-minimum-remove-parentheses',
    company: 'meta',
    title: 'Minimum Remove to Make Valid Parentheses',
    difficulty: 'Medium',
    tags: ['String', 'Stack'],
    frequency: 'High',
    description: `Given a string s of '(' , ')' and lowercase English characters.

Your task is to remove the minimum number of parentheses ( '(' or ')' ) so that the resulting parentheses string is valid and return any valid string.`,
    examples: [
      { input: 's = "lee(t(c)o)de)"', output: '"lee(t(c)o)de"' },
      { input: 's = "a)b(c)d"', output: '"ab(c)d"' },
      { input: 's = "))(("', output: '""' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's[i] is either ( , ), or lowercase English letter.'],
    starterCode: `def min_remove_to_make_valid(s):
    """
    :type s: str
    :rtype: str
    """
    # Write your solution here
    pass`,
    functionName: 'min_remove_to_make_valid',
    testCases: [
      { inputs: ['lee(t(c)o)de)'], expected: 'lee(t(c)o)de' },
      { inputs: ['a)b(c)d'], expected: 'ab(c)d' },
    ],
    hints: [
      'Use a stack to track indices of unmatched opening parentheses.',
      'Also track indices of unmatched closing parentheses.',
      'Build the result string excluding all unmatched indices.',
    ],
  },
];

// ============================================
// MICROSOFT PROBLEMS (5 questions)
// ============================================
const microsoftProblems: CompanyProblem[] = [
  {
    id: 'microsoft-spiral-matrix',
    company: 'microsoft',
    title: 'Spiral Matrix',
    difficulty: 'Medium',
    tags: ['Array', 'Matrix', 'Simulation'],
    frequency: 'High',
    description: `Given an \`m x n\` matrix, return all elements of the matrix in spiral order.`,
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' },
      { input: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]', output: '[1,2,3,4,8,12,11,10,9,5,6,7]' },
    ],
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 10'],
    starterCode: `def spiral_order(matrix):
    """
    :type matrix: List[List[int]]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'spiral_order',
    testCases: [
      { inputs: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [1,2,3,6,9,8,7,4,5] },
      { inputs: [[[1,2,3,4],[5,6,7,8],[9,10,11,12]]], expected: [1,2,3,4,8,12,11,10,9,5,6,7] },
    ],
    hints: [
      'Define four boundaries: top, bottom, left, right.',
      'Traverse right, then down, then left, then up. Shrink boundaries after each direction.',
      'Stop when boundaries cross each other.',
    ],
  },
  {
    id: 'microsoft-string-to-integer',
    company: 'microsoft',
    title: 'String to Integer (atoi)',
    difficulty: 'Medium',
    tags: ['String'],
    frequency: 'Medium',
    description: `Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.

The function first discards whitespace, determines sign, reads digits until non-digit, and clamps to 32-bit range.`,
    examples: [
      { input: 's = "42"', output: '42' },
      { input: 's = "   -42"', output: '-42' },
      { input: 's = "4193 with words"', output: '4193' },
    ],
    constraints: ['0 <= s.length <= 200', 's consists of English letters, digits, space, +, -.'],
    starterCode: `def my_atoi(s):
    """
    :type s: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'my_atoi',
    testCases: [
      { inputs: ['42'], expected: 42 },
      { inputs: ['   -42'], expected: -42 },
      { inputs: ['4193 with words'], expected: 4193 },
    ],
    hints: [
      'Skip leading whitespace, then check for optional +/- sign.',
      'Read digits character by character, building the number.',
      'Handle overflow by clamping to INT_MIN (-2^31) or INT_MAX (2^31 - 1).',
    ],
  },
  {
    id: 'microsoft-clone-graph',
    company: 'microsoft',
    title: 'Clone Graph',
    difficulty: 'Medium',
    tags: ['Graph', 'DFS', 'BFS', 'Hash Table'],
    frequency: 'Medium',
    description: `Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.

Each node contains a val and a list of its neighbors.`,
    examples: [
      { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' },
    ],
    constraints: ['The number of nodes is in the range [0, 100].', '1 <= Node.val <= 100', 'Node.val is unique.'],
    starterCode: `# Definition for a Node.
# class Node:
#     def __init__(self, val = 0, neighbors = None):
#         self.val = val
#         self.neighbors = neighbors if neighbors else []

def clone_graph(node):
    """
    :type node: Node
    :rtype: Node
    """
    # Write your solution here
    pass`,
    functionName: 'clone_graph',
    testCases: [
      { inputs: [[[2,4],[1,3],[2,4],[1,3]]], expected: [[2,4],[1,3],[2,4],[1,3]] },
    ],
    hints: [
      'Use a hash map to store mapping from original node to cloned node.',
      'DFS or BFS through the graph, cloning nodes as you visit them.',
      'For each neighbor, either clone it or use the already-cloned version.',
    ],
  },
  {
    id: 'microsoft-excel-column-number',
    company: 'microsoft',
    title: 'Excel Sheet Column Number',
    difficulty: 'Easy',
    tags: ['Math', 'String'],
    frequency: 'Medium',
    description: `Given a string \`columnTitle\` that represents the column title as appears in an Excel sheet, return its corresponding column number.

For example: A -> 1, B -> 2, ..., Z -> 26, AA -> 27, AB -> 28, ...`,
    examples: [
      { input: 'columnTitle = "A"', output: '1' },
      { input: 'columnTitle = "AB"', output: '28' },
      { input: 'columnTitle = "ZY"', output: '701' },
    ],
    constraints: ['1 <= columnTitle.length <= 7', 'columnTitle consists only of uppercase English letters.'],
    starterCode: `def title_to_number(columnTitle):
    """
    :type columnTitle: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'title_to_number',
    testCases: [
      { inputs: ['A'], expected: 1 },
      { inputs: ['AB'], expected: 28 },
      { inputs: ['ZY'], expected: 701 },
    ],
    hints: [
      'Think of it as a base-26 number system.',
      'A=1, B=2, ..., Z=26. Each position is multiplied by 26^position.',
      'Iterate from left to right: result = result * 26 + (char_value).',
    ],
  },
  {
    id: 'microsoft-tic-tac-toe',
    company: 'microsoft',
    title: 'Design Tic-Tac-Toe',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Design', 'Matrix'],
    frequency: 'Medium',
    description: `Design a Tic-Tac-Toe game that is played between two players on an n x n grid.

Implement the TicTacToe class with a move function that returns the winner (1 or 2) if the move wins the game, or 0 otherwise.`,
    examples: [
      { input: '["TicTacToe","move","move","move"]\n[[3],[0,0,1],[0,2,2],[2,2,1]]', output: '[null,0,0,0]' },
    ],
    constraints: ['2 <= n <= 100', 'player is 1 or 2.', '0 <= row, col < n'],
    starterCode: `class TicTacToe:
    def __init__(self, n: int):
        # Initialize the board
        pass

    def move(self, row: int, col: int, player: int) -> int:
        # Make a move and return winner (0 if no winner yet)
        pass`,
    functionName: 'TicTacToe',
    testCases: [
      { inputs: [3, [[0,0,1],[0,2,2],[2,2,1],[1,1,1],[2,0,2],[1,0,1],[2,1,2]]], expected: [0,0,0,0,0,0,2] },
    ],
    hints: [
      'Track counts for each row, column, and both diagonals per player.',
      'Instead of storing the whole board, track cumulative scores.',
      'A player wins when any row/col/diagonal count equals n.',
    ],
  },
];

// ============================================
// APPLE PROBLEMS (5 questions)
// ============================================
const appleProblems: CompanyProblem[] = [
  {
    id: 'apple-3sum',
    company: 'apple',
    title: '3Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    frequency: 'High',
    description: `Given an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', output: '[]' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    starterCode: `def three_sum(nums):
    """
    :type nums: List[int]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'three_sum',
    testCases: [
      { inputs: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]] },
      { inputs: [[0,1,1]], expected: [] },
      { inputs: [[0,0,0]], expected: [[0,0,0]] },
    ],
    hints: [
      'Sort the array first. This allows two-pointer approach and easy duplicate skipping.',
      'Fix one element, then use two pointers to find pairs that sum to its negative.',
      'Skip duplicate values to avoid duplicate triplets in the result.',
    ],
  },
  {
    id: 'apple-rotate-image',
    company: 'apple',
    title: 'Rotate Image',
    difficulty: 'Medium',
    tags: ['Array', 'Matrix', 'Math'],
    frequency: 'Medium',
    description: `You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).

You have to rotate the image in-place, which means you have to modify the input 2D matrix directly.`,
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' },
    ],
    constraints: ['n == matrix.length == matrix[i].length', '1 <= n <= 20', '-1000 <= matrix[i][j] <= 1000'],
    starterCode: `def rotate(matrix):
    """
    :type matrix: List[List[int]]
    :rtype: None Do not return anything, modify matrix in-place instead.
    """
    # Write your solution here
    pass`,
    functionName: 'rotate',
    testCases: [
      { inputs: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [[7,4,1],[8,5,2],[9,6,3]] },
    ],
    hints: [
      '90-degree clockwise rotation = transpose + reverse each row.',
      'Transpose: swap matrix[i][j] with matrix[j][i].',
      'Then reverse each row in place.',
    ],
  },
  {
    id: 'apple-group-anagrams',
    company: 'apple',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    frequency: 'High',
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
    starterCode: `def group_anagrams(strs):
    """
    :type strs: List[str]
    :rtype: List[List[str]]
    """
    # Write your solution here
    pass`,
    functionName: 'group_anagrams',
    testCases: [
      { inputs: [['eat','tea','tan','ate','nat','bat']], expected: [['eat','tea','ate'],['tan','nat'],['bat']] },
    ],
    hints: [
      'Two strings are anagrams if they have the same sorted characters.',
      'Use a hash map with sorted string as key, list of original strings as value.',
      'Alternatively, use character count tuple as the key (faster for long strings).',
    ],
  },
  {
    id: 'apple-find-peak-element',
    company: 'apple',
    title: 'Find Peak Element',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    frequency: 'Medium',
    description: `A peak element is an element that is strictly greater than its neighbors.

Given a 0-indexed integer array \`nums\`, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.

You must write an algorithm that runs in O(log n) time.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: '2', explanation: '3 is a peak element and your function should return the index number 2.' },
      { input: 'nums = [1,2,1,3,5,6,4]', output: '5', explanation: 'Either index 1 (value 2) or index 5 (value 6) is a peak.' },
    ],
    constraints: ['1 <= nums.length <= 1000', '-2^31 <= nums[i] <= 2^31 - 1', 'nums[i] != nums[i + 1] for all valid i.'],
    starterCode: `def find_peak_element(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'find_peak_element',
    testCases: [
      { inputs: [[1,2,3,1]], expected: 2 },
      { inputs: [[1,2,1,3,5,6,4]], expected: 5 },
    ],
    hints: [
      'Binary search works here because we just need ANY peak, not all peaks.',
      'If nums[mid] < nums[mid+1], a peak exists on the right side.',
      'If nums[mid] > nums[mid+1], a peak exists on the left side (including mid).',
    ],
  },
  {
    id: 'apple-design-hit-counter',
    company: 'apple',
    title: 'Design Hit Counter',
    difficulty: 'Medium',
    tags: ['Design', 'Queue', 'Hash Table'],
    frequency: 'Medium',
    description: `Design a hit counter which counts the number of hits received in the past 5 minutes (i.e., the past 300 seconds).

Implement the HitCounter class with hit(timestamp) and getHits(timestamp) methods.`,
    examples: [
      { input: '["HitCounter","hit","hit","hit","getHits","hit","getHits"]\n[[],[1],[2],[3],[4],[300],[300]]', output: '[null,null,null,null,3,null,4]' },
    ],
    constraints: ['1 <= timestamp <= 2 * 10^9', 'All calls are made in chronological order.', 'At most 300 calls will be made to hit and getHits.'],
    starterCode: `class HitCounter:
    def __init__(self):
        # Initialize your data structure
        pass

    def hit(self, timestamp: int) -> None:
        # Record a hit at the given timestamp
        pass

    def getHits(self, timestamp: int) -> int:
        # Return hits in the past 300 seconds
        pass`,
    functionName: 'HitCounter',
    testCases: [
      { inputs: [[[1],[2],[3],[4],[300],[300],[301]]], expected: [null,null,null,3,null,4,3] },
    ],
    hints: [
      'Use a queue to store timestamps. Remove old entries when getting hits.',
      'For better scalability, use circular array of size 300 with hit counts.',
      'Each bucket stores (timestamp, count). Reset if timestamp differs by 300+.',
    ],
  },
];

// ============================================
// EXPORT ALL COMPANIES
// ============================================
export const COMPANIES: Company[] = [
  {
    id: 'google',
    name: 'Google',
    logo: '/logos/google.svg',
    color: '#4285F4',
    description: 'Known for algorithmic challenges, system design, and scalability problems.',
    problems: googleProblems,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '/logos/amazon.svg',
    color: '#FF9900',
    description: 'Focus on leadership principles, scalable systems, and practical problem-solving.',
    problems: amazonProblems,
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: '/logos/meta.svg',
    color: '#0668E1',
    description: 'Emphasis on move fast, clean code, and efficient algorithms.',
    problems: metaProblems,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '/logos/microsoft.svg',
    color: '#00A4EF',
    description: 'Balanced mix of algorithms, system design, and practical coding.',
    problems: microsoftProblems,
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: '/logos/apple.svg',
    color: '#A2AAAD',
    description: 'Focus on attention to detail, clean code, and thoughtful design.',
    problems: appleProblems,
  },
];

// Helper function to get problems by company
export function getProblemsByCompany(companyId: string): CompanyProblem[] {
  const company = COMPANIES.find(c => c.id === companyId);
  return company?.problems || [];
}

// Helper function to get a specific problem
export function getCompanyProblem(companyId: string, problemId: string): CompanyProblem | undefined {
  const problems = getProblemsByCompany(companyId);
  return problems.find(p => p.id === problemId);
}

// Get all problems across all companies
export function getAllCompanyProblems(): CompanyProblem[] {
  return COMPANIES.flatMap(c => c.problems);
}
