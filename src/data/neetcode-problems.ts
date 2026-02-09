import { CompanyProblem, Company } from './company-problems';

export interface NeetCodeCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  problems: CompanyProblem[];
}

// ============================================
// ARRAYS & HASHING (9 problems)
// ============================================
const arraysHashingProblems: CompanyProblem[] = [
  {
    id: 'nc-contains-duplicate',
    company: 'neetcode',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'Sorting'],
    frequency: 'High',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
      { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    starterCode: `def containsDuplicate(nums):
    """
    :type nums: List[int]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'containsDuplicate',
    testCases: [
      { inputs: [[1,2,3,1]], expected: true },
      { inputs: [[1,2,3,4]], expected: false },
      { inputs: [[1,1,1,3,3,4,3,2,4,2]], expected: true },
    ],
    hints: [
      'Use a hash set to track numbers you have seen.',
      'If you see a number that is already in the set, return true.',
      'Time complexity can be O(n) with O(n) space using a set.',
    ],
    solution: 'Insert each number into a hash set. If the number is already present, return true. After processing all numbers, return false.',
    solutionCode: `def containsDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-valid-anagram',
    company: 'neetcode',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    tags: ['Hash Table', 'String', 'Sorting'],
    frequency: 'High',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    starterCode: `def isAnagram(s, t):
    """
    :type s: str
    :type t: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isAnagram',
    testCases: [
      { inputs: ['anagram', 'nagaram'], expected: true },
      { inputs: ['rat', 'car'], expected: false },
    ],
    hints: [
      'Count the frequency of each character in both strings.',
      'If the frequency maps are equal, they are anagrams.',
      'Alternatively, sort both strings and compare.',
    ],
    solution: 'Count character frequencies in both strings using a hash map or array. If the counts match, the strings are anagrams.',
    solutionCode: `def isAnagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-two-sum',
    company: 'neetcode',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    frequency: 'High',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    starterCode: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'twoSum',
    testCases: [
      { inputs: [[2,7,11,15], 9], expected: [0,1] },
      { inputs: [[3,2,4], 6], expected: [1,2] },
      { inputs: [[3,3], 6], expected: [0,1] },
    ],
    hints: [
      'Use a hash map to store numbers and their indices.',
      'For each number, check if (target - num) exists in the map.',
      'One pass through the array is sufficient.',
    ],
    solution: 'Use a hash map to store each number and its index. For each number, check if (target - num) exists in the map. This gives O(n) time.',
    solutionCode: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-group-anagrams',
    company: 'neetcode',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    frequency: 'High',
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
    starterCode: `def groupAnagrams(strs):
    """
    :type strs: List[str]
    :rtype: List[List[str]]
    """
    # Write your solution here
    pass`,
    functionName: 'groupAnagrams',
    testCases: [
      { inputs: [['eat','tea','tan','ate','nat','bat']], expected: [['eat','tea','ate'],['tan','nat'],['bat']] },
    ],
    hints: [
      'Use sorted string as key to group anagrams.',
      'Alternatively, use character count tuple as key.',
      'Hash map with key -> list of anagrams.',
    ],
    solution: 'Use a hash map where the key is the sorted version of each string. All anagrams will map to the same key.',
    solutionCode: `def groupAnagrams(strs):
    groups = {}
    for s in strs:
        key = ''.join(sorted(s))
        groups.setdefault(key, []).append(s)
    return list(groups.values())`,
    timeComplexity: 'O(n * k log k)',
    spaceComplexity: 'O(n * k)',
  },
  {
    id: 'nc-top-k-frequent',
    company: 'neetcode',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Heap', 'Bucket Sort'],
    frequency: 'High',
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in any order.`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', 'k is in the range [1, the number of unique elements in the array].', 'It is guaranteed that the answer is unique.'],
    starterCode: `def topKFrequent(nums, k):
    """
    :type nums: List[int]
    :type k: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'topKFrequent',
    testCases: [
      { inputs: [[1,1,1,2,2,3], 2], expected: [1,2] },
      { inputs: [[1], 1], expected: [1] },
    ],
    hints: [
      'Count frequency of each element using a hash map.',
      'Use a min-heap of size k, or bucket sort by frequency.',
      'Bucket sort gives O(n) time complexity.',
    ],
    solution: 'Count frequencies with a hash map, then use bucket sort where index = frequency. Collect elements from highest bucket down until you have k elements.',
    solutionCode: `def topKFrequent(nums, k):
    count = {}
    for num in nums:
        count[num] = count.get(num, 0) + 1
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)
    result = []
    for i in range(len(buckets) - 1, 0, -1):
        for num in buckets[i]:
            result.append(num)
            if len(result) == k:
                return result
    return result`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-encode-decode-strings',
    company: 'neetcode',
    title: 'Encode and Decode Strings',
    difficulty: 'Medium',
    tags: ['Array', 'String', 'Design'],
    frequency: 'Medium',
    description: `Design an algorithm to encode a list of strings to a single string. The encoded string is then decoded back to the original list of strings.

Implement \`encode\` and \`decode\` methods.`,
    examples: [
      { input: 'strs = ["lint","code","love","you"]', output: '["lint","code","love","you"]' },
      { input: 'strs = ["we","say",":","yes"]', output: '["we","say",":","yes"]' },
    ],
    constraints: ['0 <= strs.length < 100', '0 <= strs[i].length < 200', 'strs[i] contains only UTF-8 characters.'],
    starterCode: `class Codec:
    def encode(self, strs):
        """
        :type strs: List[str]
        :rtype: str
        """
        # Write your solution here
        pass

    def decode(self, s):
        """
        :type s: str
        :rtype: List[str]
        """
        # Write your solution here
        pass`,
    functionName: 'Codec',
    testCases: [
      { inputs: [['lint','code','love','you']], expected: ['lint','code','love','you'] },
    ],
    hints: [
      'Use length prefix encoding: "4#lint4#code4#love3#you".',
      'Store length of each string followed by a delimiter.',
      'When decoding, read length first, then extract that many characters.',
    ],
    solution: 'Encode each string as its length followed by a delimiter (#) then the string itself. To decode, read the length, skip the delimiter, and extract that many characters.',
    solutionCode: `class Codec:
    def encode(self, strs):
        return ''.join(str(len(s)) + '#' + s for s in strs)

    def decode(self, s):
        result, i = [], 0
        while i < len(s):
            j = s.index('#', i)
            length = int(s[i:j])
            result.append(s[j + 1:j + 1 + length])
            i = j + 1 + length
        return result`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-product-except-self',
    company: 'neetcode',
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
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'],
    starterCode: `def productExceptSelf(nums):
    """
    :type nums: List[int]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'productExceptSelf',
    testCases: [
      { inputs: [[1,2,3,4]], expected: [24,12,8,6] },
      { inputs: [[-1,1,0,-3,3]], expected: [0,0,9,0,0] },
    ],
    hints: [
      'Think about prefix and suffix products.',
      'answer[i] = (product of all elements before i) * (product of all elements after i).',
      'Can be done in O(1) extra space using the output array.',
    ],
    solution: 'Build the result using two passes: first pass stores prefix products (left to right), second pass multiplies by suffix products (right to left).',
    solutionCode: `def productExceptSelf(nums):
    n = len(nums)
    answer = [1] * n
    prefix = 1
    for i in range(n):
        answer[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        answer[i] *= suffix
        suffix *= nums[i]
    return answer`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-valid-sudoku',
    company: 'neetcode',
    title: 'Valid Sudoku',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Matrix'],
    frequency: 'Medium',
    description: `Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:

1. Each row must contain the digits 1-9 without repetition.
2. Each column must contain the digits 1-9 without repetition.
3. Each of the nine 3 x 3 sub-boxes must contain the digits 1-9 without repetition.

Note: A Sudoku board (partially filled) could be valid but is not necessarily solvable. Only the filled cells need to be validated.`,
    examples: [
      { input: 'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]', output: 'true' },
    ],
    constraints: ['board.length == 9', 'board[i].length == 9', 'board[i][j] is a digit 1-9 or "."'],
    starterCode: `def isValidSudoku(board):
    """
    :type board: List[List[str]]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isValidSudoku',
    testCases: [
      { inputs: [[['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']]], expected: true },
    ],
    hints: [
      'Use sets to track seen numbers for each row, column, and 3x3 box.',
      'Box index can be calculated as (row // 3, col // 3).',
      'One pass through the board is sufficient.',
    ],
    solution: 'Use three sets (rows, columns, boxes) to track digits seen. For each filled cell, check if the digit already exists in its row, column, or 3x3 box.',
    solutionCode: `def isValidSudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == '.':
                continue
            box_idx = (r // 3) * 3 + c // 3
            if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                return False
            rows[r].add(val)
            cols[c].add(val)
            boxes[box_idx].add(val)
    return True`,
    timeComplexity: 'O(81) = O(1)',
    spaceComplexity: 'O(81) = O(1)',
  },
  {
    id: 'nc-longest-consecutive',
    company: 'neetcode',
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Union Find'],
    frequency: 'High',
    description: `Given an unsorted array of integers \`nums\`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in O(n) time.`,
    examples: [
      { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.' },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' },
    ],
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    starterCode: `def longestConsecutive(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'longestConsecutive',
    testCases: [
      { inputs: [[100,4,200,1,3,2]], expected: 4 },
      { inputs: [[0,3,7,2,5,8,4,6,0,1]], expected: 9 },
    ],
    hints: [
      'Use a set for O(1) lookups.',
      'Only start counting from the beginning of a sequence (when num-1 is not in set).',
      'This ensures each number is visited at most twice.',
    ],
    solution: 'Put all numbers in a set. For each number, only start counting if (num-1) is NOT in the set (start of a sequence). Then count consecutive numbers from that start.',
    solutionCode: `def longestConsecutive(nums):
    num_set = set(nums)
    longest = 0
    for num in num_set:
        if num - 1 not in num_set:
            length = 1
            while num + length in num_set:
                length += 1
            longest = max(longest, length)
    return longest`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
];

// ============================================
// TWO POINTERS (5 problems)
// ============================================
const twoPointersProblems: CompanyProblem[] = [
  {
    id: 'nc-valid-palindrome',
    company: 'neetcode',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    tags: ['Two Pointers', 'String'],
    frequency: 'High',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false' },
      { input: 's = " "', output: 'true' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.'],
    starterCode: `def isPalindrome(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isPalindrome',
    testCases: [
      { inputs: ['A man, a plan, a canal: Panama'], expected: true },
      { inputs: ['race a car'], expected: false },
      { inputs: [' '], expected: true },
    ],
    hints: [
      'Use two pointers from both ends.',
      'Skip non-alphanumeric characters.',
      'Compare characters case-insensitively.',
    ],
    solution: 'Use two pointers from both ends. Skip non-alphanumeric characters and compare lowercase versions of the remaining characters.',
    solutionCode: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-two-sum-ii',
    company: 'neetcode',
    title: 'Two Sum II - Input Array Is Sorted',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Binary Search'],
    frequency: 'High',
    description: `Given a 1-indexed array of integers \`numbers\` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.

Return the indices of the two numbers (1-indexed) as an integer array of length 2.

You may not use the same element twice. Your solution must use only constant extra space.`,
    examples: [
      { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]' },
      { input: 'numbers = [2,3,4], target = 6', output: '[1,3]' },
      { input: 'numbers = [-1,0], target = -1', output: '[1,2]' },
    ],
    constraints: ['2 <= numbers.length <= 3 * 10^4', '-1000 <= numbers[i] <= 1000', 'numbers is sorted in non-decreasing order.', '-1000 <= target <= 1000', 'The tests are generated such that there is exactly one solution.'],
    starterCode: `def twoSum(numbers, target):
    """
    :type numbers: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'twoSum',
    testCases: [
      { inputs: [[2,7,11,15], 9], expected: [1,2] },
      { inputs: [[2,3,4], 6], expected: [1,3] },
    ],
    hints: [
      'Use two pointers: one at start, one at end.',
      'If sum > target, move right pointer left.',
      'If sum < target, move left pointer right.',
    ],
    solution: 'Since the array is sorted, use two pointers from both ends. If the sum is too large, move the right pointer left; if too small, move the left pointer right.',
    solutionCode: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        elif s < target:
            l += 1
        else:
            r -= 1
    return []`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-three-sum',
    company: 'neetcode',
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
    starterCode: `def threeSum(nums):
    """
    :type nums: List[int]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'threeSum',
    testCases: [
      { inputs: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]] },
      { inputs: [[0,0,0]], expected: [[0,0,0]] },
    ],
    hints: [
      'Sort the array first.',
      'Fix one element, then use two pointers for the remaining two.',
      'Skip duplicates to avoid duplicate triplets.',
    ],
    solution: 'Sort the array. For each element, use two pointers on the remaining subarray to find pairs that sum to the negative of that element. Skip duplicates.',
    solutionCode: `def threeSum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s == 0:
                result.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l + 1]:
                    l += 1
                while l < r and nums[r] == nums[r - 1]:
                    r -= 1
                l += 1
                r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return result`,
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-container-with-most-water',
    company: 'neetcode',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    frequency: 'High',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The max area is between height[1]=8 and height[8]=7 with width 7.' },
      { input: 'height = [1,1]', output: '1' },
    ],
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    starterCode: `def maxArea(height):
    """
    :type height: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxArea',
    testCases: [
      { inputs: [[1,8,6,2,5,4,8,3,7]], expected: 49 },
      { inputs: [[1,1]], expected: 1 },
    ],
    hints: [
      'Use two pointers at both ends.',
      'Area = min(height[l], height[r]) * (r - l).',
      'Move the pointer with smaller height inward.',
    ],
    solution: 'Use two pointers at both ends. Calculate area as min(height[l], height[r]) * width. Always move the shorter side inward to potentially find a taller line.',
    solutionCode: `def maxArea(height):
    l, r = 0, len(height) - 1
    max_area = 0
    while l < r:
        area = min(height[l], height[r]) * (r - l)
        max_area = max(max_area, area)
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return max_area`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-trapping-rain-water',
    company: 'neetcode',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    frequency: 'High',
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
      'Two pointer approach: track maxLeft and maxRight as you go.',
      'Move the pointer with smaller max inward.',
    ],
    solution: 'Use two pointers with maxLeft and maxRight. Water at each position depends on the minimum of the max heights on both sides. Move the pointer with the smaller max inward.',
    solutionCode: `def trap(height):
    if not height:
        return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]
    return water`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
];

// ============================================
// SLIDING WINDOW (6 problems)
// ============================================
const slidingWindowProblems: CompanyProblem[] = [
  {
    id: 'nc-best-time-to-buy-sell',
    company: 'neetcode',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'High',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No profit possible, prices only decrease.' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    starterCode: `def maxProfit(prices):
    """
    :type prices: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxProfit',
    testCases: [
      { inputs: [[7,1,5,3,6,4]], expected: 5 },
      { inputs: [[7,6,4,3,1]], expected: 0 },
    ],
    hints: [
      'Track the minimum price seen so far.',
      'At each position, calculate profit if selling today.',
      'Keep track of the maximum profit.',
    ],
    solution: 'Track the minimum price seen so far. At each day, compute the profit of selling today and update the maximum profit.',
    solutionCode: `def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-longest-substring-without-repeat',
    company: 'neetcode',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    frequency: 'High',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    starterCode: `def lengthOfLongestSubstring(s):
    """
    :type s: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'lengthOfLongestSubstring',
    testCases: [
      { inputs: ['abcabcbb'], expected: 3 },
      { inputs: ['bbbbb'], expected: 1 },
      { inputs: ['pwwkew'], expected: 3 },
    ],
    hints: [
      'Use a sliding window with a set to track characters.',
      'Expand the window by adding characters to the right.',
      'Shrink from the left when you encounter a duplicate.',
    ],
    solution: 'Use a sliding window with a set. Expand right, and when a duplicate is found, shrink from the left until the duplicate is removed.',
    solutionCode: `def lengthOfLongestSubstring(s):
    char_set = set()
    l = 0
    result = 0
    for r in range(len(s)):
        while s[r] in char_set:
            char_set.remove(s[l])
            l += 1
        char_set.add(s[r])
        result = max(result, r - l + 1)
    return result`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(n, m))',
  },
  {
    id: 'nc-longest-repeating-char-replacement',
    company: 'neetcode',
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    frequency: 'Medium',
    description: `You are given a string \`s\` and an integer \`k\`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most \`k\` times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.`,
    examples: [
      { input: 's = "ABAB", k = 2', output: '4', explanation: 'Replace the two As with two Bs or vice versa.' },
      { input: 's = "AABABBA", k = 1', output: '4' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's consists of only uppercase English letters.', '0 <= k <= s.length'],
    starterCode: `def characterReplacement(s, k):
    """
    :type s: str
    :type k: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'characterReplacement',
    testCases: [
      { inputs: ['ABAB', 2], expected: 4 },
      { inputs: ['AABABBA', 1], expected: 4 },
    ],
    hints: [
      'Use sliding window with character frequency count.',
      'Window is valid if (window_length - max_freq) <= k.',
      'Track the maximum frequency character in current window.',
    ],
    solution: 'Use a sliding window tracking character counts. The window is valid when (window_length - max_frequency) <= k. Expand right, shrink left when invalid.',
    solutionCode: `def characterReplacement(s, k):
    count = {}
    l = 0
    max_freq = 0
    result = 0
    for r in range(len(s)):
        count[s[r]] = count.get(s[r], 0) + 1
        max_freq = max(max_freq, count[s[r]])
        while (r - l + 1) - max_freq > k:
            count[s[l]] -= 1
            l += 1
        result = max(result, r - l + 1)
    return result`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-permutation-in-string',
    company: 'neetcode',
    title: 'Permutation in String',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Two Pointers', 'String', 'Sliding Window'],
    frequency: 'Medium',
    description: `Given two strings \`s1\` and \`s2\`, return \`true\` if \`s2\` contains a permutation of \`s1\`, or \`false\` otherwise.

In other words, return \`true\` if one of \`s1\`'s permutations is the substring of \`s2\`.`,
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: 'true', explanation: 's2 contains one permutation of s1 ("ba").' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: 'false' },
    ],
    constraints: ['1 <= s1.length, s2.length <= 10^4', 's1 and s2 consist of lowercase English letters.'],
    starterCode: `def checkInclusion(s1, s2):
    """
    :type s1: str
    :type s2: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'checkInclusion',
    testCases: [
      { inputs: ['ab', 'eidbaooo'], expected: true },
      { inputs: ['ab', 'eidboaoo'], expected: false },
    ],
    hints: [
      'Use a fixed-size sliding window of length s1.',
      'Compare character frequencies of s1 with current window.',
      'Use two arrays of size 26 for frequency comparison.',
    ],
    solution: 'Slide a window of size len(s1) over s2. Track how many of the 26 character frequencies match between s1 and the window. If all 26 match, return true.',
    solutionCode: `def checkInclusion(s1, s2):
    if len(s1) > len(s2):
        return False
    s1_count = [0] * 26
    s2_count = [0] * 26
    for i in range(len(s1)):
        s1_count[ord(s1[i]) - ord('a')] += 1
        s2_count[ord(s2[i]) - ord('a')] += 1
    matches = sum(1 for i in range(26) if s1_count[i] == s2_count[i])
    for i in range(len(s1), len(s2)):
        if matches == 26:
            return True
        idx = ord(s2[i]) - ord('a')
        s2_count[idx] += 1
        if s2_count[idx] == s1_count[idx]:
            matches += 1
        elif s2_count[idx] == s1_count[idx] + 1:
            matches -= 1
        idx = ord(s2[i - len(s1)]) - ord('a')
        s2_count[idx] -= 1
        if s2_count[idx] == s1_count[idx]:
            matches += 1
        elif s2_count[idx] == s1_count[idx] - 1:
            matches -= 1
    return matches == 26`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'nc-minimum-window-substring',
    company: 'neetcode',
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    frequency: 'High',
    description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included in the window. If there is no such substring, return the empty string "".`,
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""' },
    ],
    constraints: ['m == s.length', 'n == t.length', '1 <= m, n <= 10^5', 's and t consist of uppercase and lowercase English letters.'],
    starterCode: `def minWindow(s, t):
    """
    :type s: str
    :type t: str
    :rtype: str
    """
    # Write your solution here
    pass`,
    functionName: 'minWindow',
    testCases: [
      { inputs: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
      { inputs: ['a', 'a'], expected: 'a' },
      { inputs: ['a', 'aa'], expected: '' },
    ],
    hints: [
      'Use two pointers for sliding window.',
      'Expand right to include required characters.',
      'Contract left to minimize window while maintaining validity.',
    ],
    solution: 'Use a sliding window with two hash maps. Expand right until all characters of t are covered. Then shrink left to find the minimum valid window.',
    solutionCode: `def minWindow(s, t):
    from collections import Counter
    need = Counter(t)
    have, required = 0, len(need)
    window = {}
    res, res_len = [-1, -1], float('inf')
    l = 0
    for r in range(len(s)):
        c = s[r]
        window[c] = window.get(c, 0) + 1
        if c in need and window[c] == need[c]:
            have += 1
        while have == required:
            if (r - l + 1) < res_len:
                res, res_len = [l, r], r - l + 1
            window[s[l]] -= 1
            if s[l] in need and window[s[l]] < need[s[l]]:
                have -= 1
            l += 1
    l, r = res
    return s[l:r + 1] if res_len != float('inf') else ''`,
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(m + n)',
  },
  {
    id: 'nc-sliding-window-maximum',
    company: 'neetcode',
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    tags: ['Array', 'Queue', 'Sliding Window', 'Heap', 'Monotonic Queue'],
    frequency: 'Medium',
    description: `You are given an array of integers \`nums\`, there is a sliding window of size \`k\` which is moving from the very left of the array to the very right. You can only see the \`k\` numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window.`,
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', '1 <= k <= nums.length'],
    starterCode: `def maxSlidingWindow(nums, k):
    """
    :type nums: List[int]
    :type k: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'maxSlidingWindow',
    testCases: [
      { inputs: [[1,3,-1,-3,5,3,6,7], 3], expected: [3,3,5,5,6,7] },
      { inputs: [[1], 1], expected: [1] },
    ],
    hints: [
      'Use a monotonic decreasing deque.',
      'Store indices in the deque, not values.',
      'Remove indices outside the window and smaller elements.',
    ],
    solution: 'Use a monotonic decreasing deque storing indices. For each element, remove smaller elements from the back and expired indices from the front. The front of the deque is always the max.',
    solutionCode: `def maxSlidingWindow(nums, k):
    from collections import deque
    dq = deque()
    result = []
    for i in range(len(nums)):
        while dq and nums[dq[-1]] <= nums[i]:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
  },
];

// ============================================
// STACK (7 problems)
// ============================================
const stackProblems: CompanyProblem[] = [
  {
    id: 'nc-valid-parentheses',
    company: 'neetcode',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    frequency: 'High',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}".'],
    starterCode: `def isValid(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isValid',
    testCases: [
      { inputs: ['()'], expected: true },
      { inputs: ['()[]{}'], expected: true },
      { inputs: ['(]'], expected: false },
    ],
    hints: [
      'Use a stack to track opening brackets.',
      'When you see a closing bracket, check if it matches the top of the stack.',
      'At the end, the stack should be empty.',
    ],
    solution: 'Use a stack. Push opening brackets. For closing brackets, check if the stack top is the matching opener. At the end, the stack must be empty.',
    solutionCode: `def isValid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return len(stack) == 0`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-min-stack',
    company: 'neetcode',
    title: 'Min Stack',
    difficulty: 'Medium',
    tags: ['Stack', 'Design'],
    frequency: 'High',
    description: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

Implement the MinStack class:
- MinStack() initializes the stack object.
- void push(int val) pushes the element val onto the stack.
- void pop() removes the element on the top of the stack.
- int top() gets the top element of the stack.
- int getMin() retrieves the minimum element in the stack.`,
    examples: [
      { input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]' },
    ],
    constraints: ['-2^31 <= val <= 2^31 - 1', 'Methods pop, top and getMin operations will always be called on non-empty stacks.', 'At most 3 * 10^4 calls will be made to push, pop, top, and getMin.'],
    starterCode: `class MinStack:
    def __init__(self):
        # Initialize your data structure here
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        pass

    def getMin(self) -> int:
        pass`,
    functionName: 'MinStack',
    testCases: [
      { inputs: [[[-2],[0],[-3]]], expected: [-3,0,-2] },
    ],
    hints: [
      'Use two stacks: one for values, one for minimums.',
      'Or store tuples (value, current_min) in a single stack.',
      'Each push updates the minimum.',
    ],
    solution: 'Use two stacks: one for values and one for tracking minimums. On each push, also push the current minimum to the min stack.',
    solutionCode: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val):
        self.stack.append(val)
        val = min(val, self.min_stack[-1] if self.min_stack else val)
        self.min_stack.append(val)

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]`,
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-evaluate-rpn',
    company: 'neetcode',
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'Medium',
    tags: ['Array', 'Math', 'Stack'],
    frequency: 'Medium',
    description: `You are given an array of strings \`tokens\` that represents an arithmetic expression in a Reverse Polish Notation.

Evaluate the expression. Return an integer that represents the value of the expression.`,
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: '9', explanation: '((2 + 1) * 3) = 9' },
      { input: 'tokens = ["4","13","5","/","+"]', output: '6', explanation: '(4 + (13 / 5)) = 6' },
    ],
    constraints: ['1 <= tokens.length <= 10^4', 'tokens[i] is either an operator: "+", "-", "*", or "/", or an integer in the range [-200, 200].'],
    starterCode: `def evalRPN(tokens):
    """
    :type tokens: List[str]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'evalRPN',
    testCases: [
      { inputs: [['2','1','+','3','*']], expected: 9 },
      { inputs: [['4','13','5','/','+' ]], expected: 6 },
    ],
    hints: [
      'Use a stack to store operands.',
      'When you see an operator, pop two operands and apply the operation.',
      'Push the result back onto the stack.',
    ],
    solution: 'Use a stack. Push numbers. When encountering an operator, pop two operands, apply the operation, and push the result back.',
    solutionCode: `def evalRPN(tokens):
    stack = []
    for token in tokens:
        if token in '+-*/':
            b, a = stack.pop(), stack.pop()
            if token == '+':
                stack.append(a + b)
            elif token == '-':
                stack.append(a - b)
            elif token == '*':
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(token))
    return stack[0]`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-generate-parentheses',
    company: 'neetcode',
    title: 'Generate Parentheses',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming', 'Backtracking'],
    frequency: 'High',
    description: `Given \`n\` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.`,
    examples: [
      { input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' },
      { input: 'n = 1', output: '["()"]' },
    ],
    constraints: ['1 <= n <= 8'],
    starterCode: `def generateParenthesis(n):
    """
    :type n: int
    :rtype: List[str]
    """
    # Write your solution here
    pass`,
    functionName: 'generateParenthesis',
    testCases: [
      { inputs: [3], expected: ['((()))','(()())','(())()','()(())','()()()'] },
      { inputs: [1], expected: ['()'] },
    ],
    hints: [
      'Use backtracking with open and close counts.',
      'Can add "(" if open < n.',
      'Can add ")" if close < open.',
    ],
    solution: 'Use backtracking. Track open and close counts. Add "(" if open < n, add ")" if close < open. Base case: both equal n.',
    solutionCode: `def generateParenthesis(n):
    result = []
    def backtrack(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            backtrack(current + '(', open_count + 1, close_count)
        if close_count < open_count:
            backtrack(current + ')', open_count, close_count + 1)
    backtrack('', 0, 0)
    return result`,
    timeComplexity: 'O(4^n / sqrt(n))',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-daily-temperatures',
    company: 'neetcode',
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    tags: ['Array', 'Stack', 'Monotonic Stack'],
    frequency: 'High',
    description: `Given an array of integers \`temperatures\` represents the daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep \`answer[i] == 0\` instead.`,
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
      { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
    ],
    constraints: ['1 <= temperatures.length <= 10^5', '30 <= temperatures[i] <= 100'],
    starterCode: `def dailyTemperatures(temperatures):
    """
    :type temperatures: List[int]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'dailyTemperatures',
    testCases: [
      { inputs: [[73,74,75,71,69,72,76,73]], expected: [1,1,4,2,1,1,0,0] },
      { inputs: [[30,40,50,60]], expected: [1,1,1,0] },
    ],
    hints: [
      'Use a monotonic decreasing stack.',
      'Store indices in the stack.',
      'When current temp > stack top, pop and calculate days.',
    ],
    solution: 'Use a monotonic decreasing stack of indices. When a warmer temperature is found, pop from the stack and record the difference in days.',
    solutionCode: `def dailyTemperatures(temperatures):
    n = len(temperatures)
    answer = [0] * n
    stack = []
    for i in range(n):
        while stack and temperatures[i] > temperatures[stack[-1]]:
            idx = stack.pop()
            answer[idx] = i - idx
        stack.append(i)
    return answer`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-car-fleet',
    company: 'neetcode',
    title: 'Car Fleet',
    difficulty: 'Medium',
    tags: ['Array', 'Stack', 'Sorting', 'Monotonic Stack'],
    frequency: 'Medium',
    description: `There are \`n\` cars going to the same destination along a one-lane road. The destination is \`target\` miles away.

You are given two integer arrays \`position\` and \`speed\`, both of length \`n\`, where \`position[i]\` is the position of the ith car and \`speed[i]\` is the speed of the ith car (in miles per hour).

A car can never pass another car ahead of it, but it can catch up to it and drive bumper to bumper at the same speed. A car fleet is some non-empty set of cars driving at the same speed.

Return the number of car fleets that will arrive at the destination.`,
    examples: [
      { input: 'target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]', output: '3' },
      { input: 'target = 10, position = [3], speed = [3]', output: '1' },
    ],
    constraints: ['n == position.length == speed.length', '1 <= n <= 10^5', '0 < target <= 10^6', '0 <= position[i] < target', 'All the values of position are unique.', '0 < speed[i] <= 10^6'],
    starterCode: `def carFleet(target, position, speed):
    """
    :type target: int
    :type position: List[int]
    :type speed: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'carFleet',
    testCases: [
      { inputs: [12, [10,8,0,5,3], [2,4,1,1,3]], expected: 3 },
      { inputs: [10, [3], [3]], expected: 1 },
    ],
    hints: [
      'Calculate time to reach target for each car.',
      'Sort by position in descending order.',
      'Use a stack; a car joins the fleet ahead if its time <= fleet time.',
    ],
    solution: 'Calculate time to target for each car. Sort by position descending. Use a stack of arrival times; if a car arrives faster than the car ahead, it merges into that fleet.',
    solutionCode: `def carFleet(target, position, speed):
    pairs = sorted(zip(position, speed), reverse=True)
    stack = []
    for pos, spd in pairs:
        time = (target - pos) / spd
        if not stack or time > stack[-1]:
            stack.append(time)
    return len(stack)`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'nc-largest-rectangle-histogram',
    company: 'neetcode',
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    tags: ['Array', 'Stack', 'Monotonic Stack'],
    frequency: 'Medium',
    description: `Given an array of integers \`heights\` representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.`,
    examples: [
      { input: 'heights = [2,1,5,6,2,3]', output: '10' },
      { input: 'heights = [2,4]', output: '4' },
    ],
    constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
    starterCode: `def largestRectangleArea(heights):
    """
    :type heights: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'largestRectangleArea',
    testCases: [
      { inputs: [[2,1,5,6,2,3]], expected: 10 },
      { inputs: [[2,4]], expected: 4 },
    ],
    hints: [
      'Use a monotonic increasing stack.',
      'For each bar, find the first smaller bar on left and right.',
      'Area = height * (right_bound - left_bound - 1).',
    ],
    solution: 'Use a monotonic increasing stack. When a shorter bar is found, pop and calculate the area using the popped height with boundaries defined by the current index and new stack top.',
    solutionCode: `def largestRectangleArea(heights):
    stack = []
    max_area = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            max_area = max(max_area, height * (i - idx))
            start = idx
        stack.append((start, h))
    for idx, height in stack:
        max_area = max(max_area, height * (len(heights) - idx))
    return max_area`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
];

// ============================================
// BINARY SEARCH (7 problems)
// ============================================
const binarySearchProblems: CompanyProblem[] = [
  {
    id: 'nc-binary-search',
    company: 'neetcode',
    title: 'Binary Search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    frequency: 'High',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All the integers in nums are unique.', 'nums is sorted in ascending order.'],
    starterCode: `def search(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'search',
    testCases: [
      { inputs: [[-1,0,3,5,9,12], 9], expected: 4 },
      { inputs: [[-1,0,3,5,9,12], 2], expected: -1 },
    ],
    hints: [
      'Use left and right pointers.',
      'Calculate mid = (left + right) // 2.',
      'Compare target with nums[mid] and adjust bounds.',
    ],
  },
  {
    id: 'nc-search-2d-matrix',
    company: 'neetcode',
    title: 'Search a 2D Matrix',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search', 'Matrix'],
    frequency: 'High',
    description: `You are given an m x n integer matrix \`matrix\` with the following two properties:
- Each row is sorted in non-decreasing order.
- The first integer of each row is greater than the last integer of the previous row.

Given an integer \`target\`, return \`true\` if \`target\` is in \`matrix\` or \`false\` otherwise.`,
    examples: [
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' },
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13', output: 'false' },
    ],
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 100', '-10^4 <= matrix[i][j], target <= 10^4'],
    starterCode: `def searchMatrix(matrix, target):
    """
    :type matrix: List[List[int]]
    :type target: int
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'searchMatrix',
    testCases: [
      { inputs: [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3], expected: true },
      { inputs: [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13], expected: false },
    ],
    hints: [
      'Treat the 2D matrix as a 1D sorted array.',
      'Use binary search with index conversion: row = mid // n, col = mid % n.',
      'Or do two binary searches: find row, then find in row.',
    ],
  },
  {
    id: 'nc-koko-eating-bananas',
    company: 'neetcode',
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    frequency: 'Medium',
    description: `Koko loves to eat bananas. There are \`n\` piles of bananas, the ith pile has \`piles[i]\` bananas. The guards have gone and will come back in \`h\` hours.

Koko can decide her bananas-per-hour eating speed of \`k\`. Each hour, she chooses some pile of bananas and eats \`k\` bananas from that pile. If the pile has less than \`k\` bananas, she eats all of them instead and will not eat any more bananas during this hour.

Return the minimum integer \`k\` such that she can eat all the bananas within \`h\` hours.`,
    examples: [
      { input: 'piles = [3,6,7,11], h = 8', output: '4' },
      { input: 'piles = [30,11,23,4,20], h = 5', output: '30' },
    ],
    constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9', '1 <= piles[i] <= 10^9'],
    starterCode: `def minEatingSpeed(piles, h):
    """
    :type piles: List[int]
    :type h: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'minEatingSpeed',
    testCases: [
      { inputs: [[3,6,7,11], 8], expected: 4 },
      { inputs: [[30,11,23,4,20], 5], expected: 30 },
    ],
    hints: [
      'Binary search on the eating speed k.',
      'For a given k, calculate total hours needed.',
      'Find the minimum k where hours <= h.',
    ],
  },
  {
    id: 'nc-find-minimum-rotated-sorted',
    company: 'neetcode',
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    frequency: 'High',
    description: `Suppose an array of length \`n\` sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array \`nums\` of unique elements, return the minimum element of this array.

You must write an algorithm that runs in O(log n) time.`,
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0' },
      { input: 'nums = [11,13,15,17]', output: '11' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 5000', '-5000 <= nums[i] <= 5000', 'All the integers of nums are unique.', 'nums is sorted and rotated between 1 and n times.'],
    starterCode: `def findMin(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'findMin',
    testCases: [
      { inputs: [[3,4,5,1,2]], expected: 1 },
      { inputs: [[4,5,6,7,0,1,2]], expected: 0 },
    ],
    hints: [
      'Binary search to find the pivot point.',
      'If nums[mid] > nums[right], minimum is on the right.',
      'Otherwise, minimum is on the left (including mid).',
    ],
  },
  {
    id: 'nc-search-rotated-sorted-array',
    company: 'neetcode',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    frequency: 'High',
    description: `Given the array \`nums\` after the possible rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or -1 if it is not in \`nums\`.

You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'All values of nums are unique.', 'nums is an ascending array that is possibly rotated.', '-10^4 <= target <= 10^4'],
    starterCode: `def search(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'search',
    testCases: [
      { inputs: [[4,5,6,7,0,1,2], 0], expected: 4 },
      { inputs: [[4,5,6,7,0,1,2], 3], expected: -1 },
    ],
    hints: [
      'Determine which half is sorted.',
      'Check if target is in the sorted half.',
      'Adjust search bounds accordingly.',
    ],
  },
  {
    id: 'nc-time-based-key-value-store',
    company: 'neetcode',
    title: 'Time Based Key-Value Store',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Binary Search', 'Design'],
    frequency: 'Medium',
    description: `Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.

Implement the TimeMap class with set and get methods.`,
    examples: [
      { input: '["TimeMap", "set", "get", "get", "set", "get", "get"]\n[[], ["foo", "bar", 1], ["foo", 1], ["foo", 3], ["foo", "bar2", 4], ["foo", 4], ["foo", 5]]', output: '[null, null, "bar", "bar", null, "bar2", "bar2"]' },
    ],
    constraints: ['1 <= key.length, value.length <= 100', 'key and value consist of lowercase English letters and digits.', '1 <= timestamp <= 10^7', 'All the timestamps timestamp of set are strictly increasing.'],
    starterCode: `class TimeMap:
    def __init__(self):
        # Initialize your data structure
        pass

    def set(self, key: str, value: str, timestamp: int) -> None:
        pass

    def get(self, key: str, timestamp: int) -> str:
        pass`,
    functionName: 'TimeMap',
    testCases: [
      { inputs: [['foo', 'bar', 1], ['foo', 1], ['foo', 3]], expected: ['bar', 'bar'] },
    ],
    hints: [
      'Use a hash map with key -> list of (timestamp, value) pairs.',
      'Binary search to find the largest timestamp <= given timestamp.',
      'Timestamps are strictly increasing, so list is sorted.',
    ],
  },
  {
    id: 'nc-median-two-sorted-arrays',
    company: 'neetcode',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    frequency: 'Medium',
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5' },
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
    starterCode: `def findMedianSortedArrays(nums1, nums2):
    """
    :type nums1: List[int]
    :type nums2: List[int]
    :rtype: float
    """
    # Write your solution here
    pass`,
    functionName: 'findMedianSortedArrays',
    testCases: [
      { inputs: [[1,3], [2]], expected: 2.0 },
      { inputs: [[1,2], [3,4]], expected: 2.5 },
    ],
    hints: [
      'Binary search on the smaller array to find correct partition.',
      'Partition both arrays so left halves have smaller elements.',
      'Median is derived from the boundary elements.',
    ],
  },
];

// Continue with more categories... (truncated for brevity, will continue in implementation)

// ============================================
// LINKED LIST (11 problems)
// ============================================
const linkedListProblems: CompanyProblem[] = [
  {
    id: 'nc-reverse-linked-list',
    company: 'neetcode',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    frequency: 'High',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
    starterCode: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverseList(head):
    """
    :type head: Optional[ListNode]
    :rtype: Optional[ListNode]
    """
    # Write your solution here
    pass`,
    functionName: 'reverseList',
    testCases: [
      { inputs: [[1,2,3,4,5]], expected: [5,4,3,2,1] },
    ],
    hints: [
      'Use three pointers: prev, curr, next.',
      'Iteratively reverse the next pointers.',
      'Or use recursion with careful handling of the base case.',
    ],
  },
  {
    id: 'nc-merge-two-sorted-lists',
    company: 'neetcode',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    frequency: 'High',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
    ],
    constraints: ['The number of nodes in both lists is in the range [0, 50].', '-100 <= Node.val <= 100', 'Both list1 and list2 are sorted in non-decreasing order.'],
    starterCode: `def mergeTwoLists(list1, list2):
    """
    :type list1: Optional[ListNode]
    :type list2: Optional[ListNode]
    :rtype: Optional[ListNode]
    """
    # Write your solution here
    pass`,
    functionName: 'mergeTwoLists',
    testCases: [
      { inputs: [[1,2,4], [1,3,4]], expected: [1,1,2,3,4,4] },
    ],
    hints: [
      'Use a dummy node to simplify edge cases.',
      'Compare values and advance the smaller pointer.',
      'Append remaining nodes at the end.',
    ],
  },
  {
    id: 'nc-reorder-list',
    company: 'neetcode',
    title: 'Reorder List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers', 'Stack', 'Recursion'],
    frequency: 'Medium',
    description: `You are given the head of a singly linked-list. The list can be represented as: L0 → L1 → … → Ln - 1 → Ln

Reorder the list to be on the following form: L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …

You may not modify the values in the list's nodes. Only nodes themselves may be changed.`,
    examples: [
      { input: 'head = [1,2,3,4]', output: '[1,4,2,3]' },
      { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]' },
    ],
    constraints: ['The number of nodes in the list is in the range [1, 5 * 10^4].', '1 <= Node.val <= 1000'],
    starterCode: `def reorderList(head):
    """
    :type head: Optional[ListNode]
    :rtype: None Do not return anything, modify head in-place instead.
    """
    # Write your solution here
    pass`,
    functionName: 'reorderList',
    testCases: [
      { inputs: [[1,2,3,4]], expected: [1,4,2,3] },
    ],
    hints: [
      'Find the middle of the list using slow/fast pointers.',
      'Reverse the second half.',
      'Merge the two halves alternately.',
    ],
  },
  {
    id: 'nc-remove-nth-node-from-end',
    company: 'neetcode',
    title: 'Remove Nth Node From End of List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    frequency: 'High',
    description: `Given the head of a linked list, remove the nth node from the end of the list and return its head.`,
    examples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' },
      { input: 'head = [1], n = 1', output: '[]' },
    ],
    constraints: ['The number of nodes in the list is sz.', '1 <= sz <= 30', '0 <= Node.val <= 100', '1 <= n <= sz'],
    starterCode: `def removeNthFromEnd(head, n):
    """
    :type head: Optional[ListNode]
    :type n: int
    :rtype: Optional[ListNode]
    """
    # Write your solution here
    pass`,
    functionName: 'removeNthFromEnd',
    testCases: [
      { inputs: [[1,2,3,4,5], 2], expected: [1,2,3,5] },
    ],
    hints: [
      'Use two pointers with n nodes apart.',
      'When fast reaches the end, slow is at the node before target.',
      'Use a dummy node to handle edge cases.',
    ],
  },
  {
    id: 'nc-copy-list-random-pointer',
    company: 'neetcode',
    title: 'Copy List with Random Pointer',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List'],
    frequency: 'Medium',
    description: `A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null.

Construct a deep copy of the list.`,
    examples: [
      { input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', output: '[[7,null],[13,0],[11,4],[10,2],[1,0]]' },
    ],
    constraints: ['0 <= n <= 1000', '-10^4 <= Node.val <= 10^4', 'Node.random is null or is pointing to some node in the linked list.'],
    starterCode: `def copyRandomList(head):
    """
    :type head: Optional[Node]
    :rtype: Optional[Node]
    """
    # Write your solution here
    pass`,
    functionName: 'copyRandomList',
    testCases: [
      { inputs: [[[7,null],[13,0],[11,4],[10,2],[1,0]]], expected: [[7,null],[13,0],[11,4],[10,2],[1,0]] },
    ],
    hints: [
      'Use a hash map to map original nodes to copies.',
      'First pass: create all copy nodes.',
      'Second pass: set next and random pointers.',
    ],
  },
  {
    id: 'nc-add-two-numbers',
    company: 'neetcode',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    tags: ['Linked List', 'Math', 'Recursion'],
    frequency: 'High',
    description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.`,
    examples: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807' },
      { input: 'l1 = [0], l2 = [0]', output: '[0]' },
    ],
    constraints: ['The number of nodes in each linked list is in the range [1, 100].', '0 <= Node.val <= 9', 'It is guaranteed that the list represents a number that does not have leading zeros.'],
    starterCode: `def addTwoNumbers(l1, l2):
    """
    :type l1: Optional[ListNode]
    :type l2: Optional[ListNode]
    :rtype: Optional[ListNode]
    """
    # Write your solution here
    pass`,
    functionName: 'addTwoNumbers',
    testCases: [
      { inputs: [[2,4,3], [5,6,4]], expected: [7,0,8] },
    ],
    hints: [
      'Traverse both lists simultaneously.',
      'Handle carry for sums >= 10.',
      'Don\'t forget the final carry.',
    ],
  },
  {
    id: 'nc-linked-list-cycle',
    company: 'neetcode',
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    tags: ['Hash Table', 'Linked List', 'Two Pointers'],
    frequency: 'High',
    description: `Given head, the head of a linked list, determine if the linked list has a cycle in it.

Return true if there is a cycle in the linked list. Otherwise, return false.`,
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' },
    ],
    constraints: ['The number of the nodes in the list is in the range [0, 10^4].', '-10^5 <= Node.val <= 10^5'],
    starterCode: `def hasCycle(head):
    """
    :type head: Optional[ListNode]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'hasCycle',
    testCases: [
      { inputs: [[3,2,0,-4], 1], expected: true },
    ],
    hints: [
      'Use slow and fast pointers (Floyd\'s cycle detection).',
      'If they meet, there is a cycle.',
      'If fast reaches null, no cycle.',
    ],
  },
  {
    id: 'nc-find-duplicate-number',
    company: 'neetcode',
    title: 'Find the Duplicate Number',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Binary Search', 'Bit Manipulation'],
    frequency: 'Medium',
    description: `Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.

There is only one repeated number in nums, return this repeated number.

You must solve the problem without modifying the array nums and uses only constant extra space.`,
    examples: [
      { input: 'nums = [1,3,4,2,2]', output: '2' },
      { input: 'nums = [3,1,3,4,2]', output: '3' },
    ],
    constraints: ['1 <= n <= 10^5', 'nums.length == n + 1', '1 <= nums[i] <= n', 'All the integers in nums appear only once except for precisely one integer which appears two or more times.'],
    starterCode: `def findDuplicate(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'findDuplicate',
    testCases: [
      { inputs: [[1,3,4,2,2]], expected: 2 },
      { inputs: [[3,1,3,4,2]], expected: 3 },
    ],
    hints: [
      'Think of the array as a linked list where nums[i] points to nums[nums[i]].',
      'Use Floyd\'s cycle detection algorithm.',
      'Find intersection point, then find cycle start.',
    ],
  },
  {
    id: 'nc-lru-cache',
    company: 'neetcode',
    title: 'LRU Cache',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
    frequency: 'High',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class with get and put operations in O(1) time complexity.`,
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: '[null,null,null,1,null,-1,null,-1,3,4]' },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'At most 2 * 10^5 calls will be made to get and put.'],
    starterCode: `class LRUCache:
    def __init__(self, capacity: int):
        # Initialize your data structure
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass`,
    functionName: 'LRUCache',
    testCases: [
      { inputs: [2, [[1,1],[2,2],[1],[3,3],[2]]], expected: [null,null,1,null,-1] },
    ],
    hints: [
      'Combine hash map (O(1) access) with doubly linked list (O(1) reordering).',
      'Most recently used at head, least recently used at tail.',
      'On access, move node to head. On capacity overflow, remove tail.',
    ],
  },
  {
    id: 'nc-merge-k-sorted-lists',
    company: 'neetcode',
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    tags: ['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    frequency: 'High',
    description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' },
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500', '-10^4 <= lists[i][j] <= 10^4', 'lists[i] is sorted in ascending order.', 'The sum of lists[i].length will not exceed 10^4.'],
    starterCode: `def mergeKLists(lists):
    """
    :type lists: List[Optional[ListNode]]
    :rtype: Optional[ListNode]
    """
    # Write your solution here
    pass`,
    functionName: 'mergeKLists',
    testCases: [
      { inputs: [[[1,4,5],[1,3,4],[2,6]]], expected: [1,1,2,3,4,4,5,6] },
    ],
    hints: [
      'Use a min-heap to always get the smallest element.',
      'Or use divide and conquer to merge pairs of lists.',
      'Divide and conquer gives O(n log k) time complexity.',
    ],
  },
  {
    id: 'nc-reverse-nodes-k-group',
    company: 'neetcode',
    title: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    tags: ['Linked List', 'Recursion'],
    frequency: 'Medium',
    description: `Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.

k is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes, in the end, should remain as it is.`,
    examples: [
      { input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]' },
      { input: 'head = [1,2,3,4,5], k = 3', output: '[3,2,1,4,5]' },
    ],
    constraints: ['The number of nodes in the list is n.', '1 <= k <= n <= 5000', '0 <= Node.val <= 1000'],
    starterCode: `def reverseKGroup(head, k):
    """
    :type head: Optional[ListNode]
    :type k: int
    :rtype: Optional[ListNode]
    """
    # Write your solution here
    pass`,
    functionName: 'reverseKGroup',
    testCases: [
      { inputs: [[1,2,3,4,5], 2], expected: [2,1,4,3,5] },
    ],
    hints: [
      'First check if there are k nodes remaining.',
      'If yes, reverse those k nodes.',
      'Recursively process the rest.',
    ],
  },
];

// ============================================
// TREES (15 problems) - Abbreviated for length
// ============================================
const treesProblems: CompanyProblem[] = [
  {
    id: 'nc-invert-binary-tree',
    company: 'neetcode',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    frequency: 'High',
    description: `Given the root of a binary tree, invert the tree, and return its root.`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100'],
    starterCode: `def invertTree(root):
    """
    :type root: Optional[TreeNode]
    :rtype: Optional[TreeNode]
    """
    # Write your solution here
    pass`,
    functionName: 'invertTree',
    testCases: [
      { inputs: [[4,2,7,1,3,6,9]], expected: [4,7,2,9,6,3,1] },
    ],
    hints: ['Recursively swap left and right children.', 'Base case: null node.', 'Can also use BFS with a queue.'],
  },
  {
    id: 'nc-maximum-depth-binary-tree',
    company: 'neetcode',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    frequency: 'High',
    description: `Given the root of a binary tree, return its maximum depth.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-100 <= Node.val <= 100'],
    starterCode: `def maxDepth(root):
    """
    :type root: Optional[TreeNode]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxDepth',
    testCases: [
      { inputs: [[3,9,20,null,null,15,7]], expected: 3 },
    ],
    hints: ['Depth = 1 + max(depth of left, depth of right).', 'Base case: null node has depth 0.', 'Can use DFS or BFS.'],
  },
  {
    id: 'nc-diameter-binary-tree',
    company: 'neetcode',
    title: 'Diameter of Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS', 'Binary Tree'],
    frequency: 'High',
    description: `Given the root of a binary tree, return the length of the diameter of the tree.`,
    examples: [
      { input: 'root = [1,2,3,4,5]', output: '3' },
    ],
    constraints: ['The number of nodes in the tree is in the range [1, 10^4].', '-100 <= Node.val <= 100'],
    starterCode: `def diameterOfBinaryTree(root):
    """
    :type root: Optional[TreeNode]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'diameterOfBinaryTree',
    testCases: [
      { inputs: [[1,2,3,4,5]], expected: 3 },
    ],
    hints: ['Diameter through a node = left height + right height.', 'Track max diameter seen during DFS.', 'Return height from each recursive call.'],
  },
  {
    id: 'nc-balanced-binary-tree',
    company: 'neetcode',
    title: 'Balanced Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS', 'Binary Tree'],
    frequency: 'Medium',
    description: `Given a binary tree, determine if it is height-balanced.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: 'true' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 5000].', '-10^4 <= Node.val <= 10^4'],
    starterCode: `def isBalanced(root):
    """
    :type root: Optional[TreeNode]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isBalanced',
    testCases: [
      { inputs: [[3,9,20,null,null,15,7]], expected: true },
    ],
    hints: ['A tree is balanced if |left_height - right_height| <= 1 for every node.', 'Use DFS to return height and check balance.', 'Return -1 if subtree is unbalanced.'],
  },
  {
    id: 'nc-same-tree',
    company: 'neetcode',
    title: 'Same Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    frequency: 'Medium',
    description: `Given the roots of two binary trees p and q, write a function to check if they are the same or not.`,
    examples: [
      { input: 'p = [1,2,3], q = [1,2,3]', output: 'true' },
    ],
    constraints: ['The number of nodes in both trees is in the range [0, 100].', '-10^4 <= Node.val <= 10^4'],
    starterCode: `def isSameTree(p, q):
    """
    :type p: Optional[TreeNode]
    :type q: Optional[TreeNode]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isSameTree',
    testCases: [
      { inputs: [[1,2,3], [1,2,3]], expected: true },
    ],
    hints: ['Both null = same.', 'One null, one not = different.', 'Compare values and recurse on children.'],
  },
  // More tree problems would continue here...
  {
    id: 'nc-subtree-of-another-tree',
    company: 'neetcode',
    title: 'Subtree of Another Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS', 'Binary Tree', 'Hash Function'],
    frequency: 'Medium',
    description: `Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.`,
    examples: [
      { input: 'root = [3,4,5,1,2], subRoot = [4,1,2]', output: 'true' },
    ],
    constraints: ['The number of nodes in the root tree is in the range [1, 2000].', 'The number of nodes in the subRoot tree is in the range [1, 1000].'],
    starterCode: `def isSubtree(root, subRoot):
    """
    :type root: Optional[TreeNode]
    :type subRoot: Optional[TreeNode]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isSubtree',
    testCases: [
      { inputs: [[3,4,5,1,2], [4,1,2]], expected: true },
    ],
    hints: ['Check if subRoot matches any subtree in root.', 'Use isSameTree helper.', 'DFS through root to find potential match points.'],
  },
  {
    id: 'nc-lowest-common-ancestor',
    company: 'neetcode',
    title: 'Lowest Common Ancestor of a BST',
    difficulty: 'Medium',
    tags: ['Tree', 'DFS', 'BST', 'Binary Tree'],
    frequency: 'High',
    description: `Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.`,
    examples: [
      { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6' },
    ],
    constraints: ['The number of nodes in the tree is in the range [2, 10^5].', '-10^9 <= Node.val <= 10^9', 'All Node.val are unique.'],
    starterCode: `def lowestCommonAncestor(root, p, q):
    """
    :type root: TreeNode
    :type p: TreeNode
    :type q: TreeNode
    :rtype: TreeNode
    """
    # Write your solution here
    pass`,
    functionName: 'lowestCommonAncestor',
    testCases: [
      { inputs: [[6,2,8,0,4,7,9,null,null,3,5], 2, 8], expected: 6 },
    ],
    hints: ['Use BST property: left < root < right.', 'If both p and q < root, go left.', 'If both p and q > root, go right. Otherwise, root is LCA.'],
  },
  {
    id: 'nc-binary-tree-level-order',
    company: 'neetcode',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    tags: ['Tree', 'BFS', 'Binary Tree'],
    frequency: 'High',
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 2000].', '-1000 <= Node.val <= 1000'],
    starterCode: `def levelOrder(root):
    """
    :type root: Optional[TreeNode]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'levelOrder',
    testCases: [
      { inputs: [[3,9,20,null,null,15,7]], expected: [[3],[9,20],[15,7]] },
    ],
    hints: ['Use BFS with a queue.', 'Process all nodes at current level before moving to next.', 'Track level size to group nodes.'],
  },
  {
    id: 'nc-binary-tree-right-side-view',
    company: 'neetcode',
    title: 'Binary Tree Right Side View',
    difficulty: 'Medium',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    frequency: 'Medium',
    description: `Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.`,
    examples: [
      { input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100'],
    starterCode: `def rightSideView(root):
    """
    :type root: Optional[TreeNode]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'rightSideView',
    testCases: [
      { inputs: [[1,2,3,null,5,null,4]], expected: [1,3,4] },
    ],
    hints: ['Use BFS and take the last node at each level.', 'Or use DFS visiting right before left.', 'Track the current depth to add first node at each new level.'],
  },
  {
    id: 'nc-count-good-nodes',
    company: 'neetcode',
    title: 'Count Good Nodes in Binary Tree',
    difficulty: 'Medium',
    tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'],
    frequency: 'Medium',
    description: `Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X.

Return the number of good nodes in the binary tree.`,
    examples: [
      { input: 'root = [3,1,4,3,null,1,5]', output: '4' },
    ],
    constraints: ['The number of nodes in the binary tree is in the range [1, 10^5].', 'Each node\'s value is between [-10^4, 10^4].'],
    starterCode: `def goodNodes(root):
    """
    :type root: TreeNode
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'goodNodes',
    testCases: [
      { inputs: [[3,1,4,3,null,1,5]], expected: 4 },
    ],
    hints: ['DFS while tracking maximum value in path.', 'Node is good if its value >= max so far.', 'Update max when going deeper.'],
  },
  {
    id: 'nc-validate-bst',
    company: 'neetcode',
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    tags: ['Tree', 'DFS', 'BST', 'Binary Tree'],
    frequency: 'High',
    description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).`,
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false' },
    ],
    constraints: ['The number of nodes in the tree is in the range [1, 10^4].', '-2^31 <= Node.val <= 2^31 - 1'],
    starterCode: `def isValidBST(root):
    """
    :type root: Optional[TreeNode]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isValidBST',
    testCases: [
      { inputs: [[2,1,3]], expected: true },
      { inputs: [[5,1,4,null,null,3,6]], expected: false },
    ],
    hints: ['Track valid range (min, max) for each node.', 'Left child must be less than current node.', 'Right child must be greater than current node.'],
  },
  {
    id: 'nc-kth-smallest-bst',
    company: 'neetcode',
    title: 'Kth Smallest Element in a BST',
    difficulty: 'Medium',
    tags: ['Tree', 'DFS', 'BST', 'Binary Tree'],
    frequency: 'High',
    description: `Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.`,
    examples: [
      { input: 'root = [3,1,4,null,2], k = 1', output: '1' },
      { input: 'root = [5,3,6,2,4,null,null,1], k = 3', output: '3' },
    ],
    constraints: ['The number of nodes in the tree is n.', '1 <= k <= n <= 10^4', '0 <= Node.val <= 10^4'],
    starterCode: `def kthSmallest(root, k):
    """
    :type root: Optional[TreeNode]
    :type k: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'kthSmallest',
    testCases: [
      { inputs: [[3,1,4,null,2], 1], expected: 1 },
    ],
    hints: ['Inorder traversal of BST gives sorted order.', 'Stop after visiting k nodes.', 'Can use iterative approach with stack.'],
  },
  {
    id: 'nc-construct-bt-preorder-inorder',
    company: 'neetcode',
    title: 'Construct Binary Tree from Preorder and Inorder',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Tree', 'Binary Tree'],
    frequency: 'Medium',
    description: `Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.`,
    examples: [
      { input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', output: '[3,9,20,null,null,15,7]' },
    ],
    constraints: ['1 <= preorder.length <= 3000', 'inorder.length == preorder.length', '-3000 <= preorder[i], inorder[i] <= 3000', 'preorder and inorder consist of unique values.'],
    starterCode: `def buildTree(preorder, inorder):
    """
    :type preorder: List[int]
    :type inorder: List[int]
    :rtype: Optional[TreeNode]
    """
    # Write your solution here
    pass`,
    functionName: 'buildTree',
    testCases: [
      { inputs: [[3,9,20,15,7], [9,3,15,20,7]], expected: [3,9,20,null,null,15,7] },
    ],
    hints: ['First element of preorder is the root.', 'Find root in inorder to split left and right subtrees.', 'Use hash map for O(1) lookup of root index in inorder.'],
  },
  {
    id: 'nc-binary-tree-max-path-sum',
    company: 'neetcode',
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    tags: ['Tree', 'DFS', 'Dynamic Programming', 'Binary Tree'],
    frequency: 'Medium',
    description: `A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.

The path sum of a path is the sum of the node's values in the path.

Given the root of a binary tree, return the maximum path sum of any non-empty path.`,
    examples: [
      { input: 'root = [1,2,3]', output: '6' },
      { input: 'root = [-10,9,20,null,null,15,7]', output: '42' },
    ],
    constraints: ['The number of nodes in the tree is in the range [1, 3 * 10^4].', '-1000 <= Node.val <= 1000'],
    starterCode: `def maxPathSum(root):
    """
    :type root: Optional[TreeNode]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxPathSum',
    testCases: [
      { inputs: [[1,2,3]], expected: 6 },
    ],
    hints: ['At each node, calculate max path going through it.', 'Path can go left, right, or both.', 'Return max gain to parent (only one branch).'],
  },
  {
    id: 'nc-serialize-deserialize-bt',
    company: 'neetcode',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    tags: ['Tree', 'DFS', 'BFS', 'Design', 'String', 'Binary Tree'],
    frequency: 'Medium',
    description: `Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.`,
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-1000 <= Node.val <= 1000'],
    starterCode: `class Codec:
    def serialize(self, root):
        """
        :type root: TreeNode
        :rtype: str
        """
        pass

    def deserialize(self, data):
        """
        :type data: str
        :rtype: TreeNode
        """
        pass`,
    functionName: 'Codec',
    testCases: [
      { inputs: [[1,2,3,null,null,4,5]], expected: [1,2,3,null,null,4,5] },
    ],
    hints: ['Use preorder DFS with null markers.', 'Serialize: "1,2,N,N,3,4,N,N,5,N,N".', 'Deserialize: Use iterator and reconstruct recursively.'],
  },
];

// Due to length constraints, I'm defining placeholder arrays for remaining categories
// In actual implementation, these would be fully populated

const heapProblems: CompanyProblem[] = [
  {
    id: 'nc-kth-largest-element-stream',
    company: 'neetcode',
    title: 'Kth Largest Element in a Stream',
    difficulty: 'Easy',
    tags: ['Tree', 'Design', 'BST', 'Heap', 'Binary Tree', 'Data Stream'],
    frequency: 'Medium',
    description: `Design a class to find the kth largest element in a stream.`,
    examples: [{ input: '["KthLargest", "add", "add", "add", "add", "add"]\n[[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]', output: '[null, 4, 5, 5, 8, 8]' }],
    constraints: ['1 <= k <= 10^4'],
    starterCode: `class KthLargest:\n    def __init__(self, k: int, nums):\n        pass\n    def add(self, val: int) -> int:\n        pass`,
    functionName: 'KthLargest',
    testCases: [{ inputs: [3, [4, 5, 8, 2], [3, 5, 10, 9, 4]], expected: [4, 5, 5, 8, 8] }],
    hints: ['Use a min-heap of size k.', 'The kth largest is the top of the heap.', 'Only add to heap if element > heap top.'],
  },
  {
    id: 'nc-last-stone-weight',
    company: 'neetcode',
    title: 'Last Stone Weight',
    difficulty: 'Easy',
    tags: ['Array', 'Heap'],
    frequency: 'Medium',
    description: `You are given an array of integers stones where stones[i] is the weight of the ith stone. Return the weight of the last remaining stone.`,
    examples: [{ input: 'stones = [2,7,4,1,8,1]', output: '1' }],
    constraints: ['1 <= stones.length <= 30'],
    starterCode: `def lastStoneWeight(stones):\n    pass`,
    functionName: 'lastStoneWeight',
    testCases: [{ inputs: [[2,7,4,1,8,1]], expected: 1 }],
    hints: ['Use a max-heap.', 'Pop two largest, push difference if > 0.', 'Python has min-heap, negate values for max-heap.'],
  },
  {
    id: 'nc-k-closest-points-origin',
    company: 'neetcode',
    title: 'K Closest Points to Origin',
    difficulty: 'Medium',
    tags: ['Array', 'Math', 'Heap', 'Sorting', 'Divide and Conquer', 'Quickselect'],
    frequency: 'High',
    description: `Given an array of points and an integer k, return the k closest points to the origin (0, 0).`,
    examples: [{ input: 'points = [[1,3],[-2,2]], k = 1', output: '[[-2,2]]' }],
    constraints: ['1 <= k <= points.length <= 10^4'],
    starterCode: `def kClosest(points, k):\n    pass`,
    functionName: 'kClosest',
    testCases: [{ inputs: [[[1,3],[-2,2]], 1], expected: [[-2,2]] }],
    hints: ['Use max-heap of size k with negative distances.', 'Or use quickselect for average O(n) time.', 'Distance = x^2 + y^2 (no need for sqrt).'],
  },
  {
    id: 'nc-kth-largest-element-array',
    company: 'neetcode',
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    tags: ['Array', 'Heap', 'Divide and Conquer', 'Sorting', 'Quickselect'],
    frequency: 'High',
    description: `Given an integer array nums and an integer k, return the kth largest element in the array.`,
    examples: [{ input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' }],
    constraints: ['1 <= k <= nums.length <= 10^5'],
    starterCode: `def findKthLargest(nums, k):\n    pass`,
    functionName: 'findKthLargest',
    testCases: [{ inputs: [[3,2,1,5,6,4], 2], expected: 5 }],
    hints: ['Min-heap of size k gives kth largest at top.', 'Quickselect gives average O(n) time.', 'Python heapq is min-heap by default.'],
  },
  {
    id: 'nc-task-scheduler',
    company: 'neetcode',
    title: 'Task Scheduler',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Greedy', 'Heap', 'Sorting', 'Counting'],
    frequency: 'Medium',
    description: `Given a characters array tasks and a non-negative integer n, return the least number of units of times needed to complete all tasks.`,
    examples: [{ input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8' }],
    constraints: ['1 <= task.length <= 10^4'],
    starterCode: `def leastInterval(tasks, n):\n    pass`,
    functionName: 'leastInterval',
    testCases: [{ inputs: [['A','A','A','B','B','B'], 2], expected: 8 }],
    hints: ['Max-heap for most frequent task first.', 'Track cooldown with a queue.', 'Greedy: always schedule most frequent available task.'],
  },
  {
    id: 'nc-design-twitter',
    company: 'neetcode',
    title: 'Design Twitter',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design', 'Heap'],
    frequency: 'Medium',
    description: `Design a simplified version of Twitter with postTweet, getNewsFeed, follow, and unfollow operations.`,
    examples: [{ input: '["Twitter", "postTweet", "getNewsFeed", "follow", "postTweet", "getNewsFeed"]', output: '[null, null, [5], null, null, [6, 5]]' }],
    constraints: ['1 <= userId, followerId, followeeId, tweetId <= 500'],
    starterCode: `class Twitter:\n    def __init__(self):\n        pass\n    def postTweet(self, userId: int, tweetId: int) -> None:\n        pass\n    def getNewsFeed(self, userId: int):\n        pass\n    def follow(self, followerId: int, followeeId: int) -> None:\n        pass\n    def unfollow(self, followerId: int, followeeId: int) -> None:\n        pass`,
    functionName: 'Twitter',
    testCases: [{ inputs: [], expected: [] }],
    hints: ['Hash map for user -> followees.', 'Hash map for user -> tweets with timestamps.', 'Merge k sorted lists for news feed using heap.'],
  },
  {
    id: 'nc-find-median-data-stream',
    company: 'neetcode',
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    tags: ['Two Pointers', 'Design', 'Sorting', 'Heap', 'Data Stream'],
    frequency: 'High',
    description: `Design a data structure that supports adding integers and finding the median of all elements.`,
    examples: [{ input: '["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]', output: '[null, null, null, 1.5, null, 2.0]' }],
    constraints: ['-10^5 <= num <= 10^5'],
    starterCode: `class MedianFinder:\n    def __init__(self):\n        pass\n    def addNum(self, num: int) -> None:\n        pass\n    def findMedian(self) -> float:\n        pass`,
    functionName: 'MedianFinder',
    testCases: [{ inputs: [[1], [2], [], [3], []], expected: [null, null, 1.5, null, 2.0] }],
    hints: ['Use two heaps: max-heap for lower half, min-heap for upper half.', 'Keep heaps balanced (differ by at most 1).', 'Median is average of tops or the larger heap\'s top.'],
  },
];

// Placeholder for remaining categories - these would be fully populated in the actual implementation
const backtrackingProblems: CompanyProblem[] = [
  {
    id: 'nc-subsets',
    company: 'neetcode',
    title: 'Subsets',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'Bit Manipulation'],
    frequency: 'High',
    description: `Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.`,
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
      { input: 'nums = [0]', output: '[[],[0]]' },
    ],
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'All the numbers of nums are unique.'],
    starterCode: `def subsets(nums):
    """
    :type nums: List[int]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'subsets',
    testCases: [
      { inputs: [[1,2,3]], expected: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]] },
    ],
    hints: ['Use backtracking to generate all combinations.', 'At each step, choose to include or exclude the current element.', 'Alternatively, use bit manipulation with 2^n iterations.'],
  },
  {
    id: 'nc-combination-sum',
    company: 'neetcode',
    title: 'Combination Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    frequency: 'High',
    description: `Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen unlimited times.`,
    examples: [
      { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]' },
      { input: 'candidates = [2,3,5], target = 8', output: '[[2,2,2,2],[2,3,3],[3,5]]' },
    ],
    constraints: ['1 <= candidates.length <= 30', '2 <= candidates[i] <= 40', 'All elements of candidates are distinct.', '1 <= target <= 40'],
    starterCode: `def combinationSum(candidates, target):
    """
    :type candidates: List[int]
    :type target: int
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'combinationSum',
    testCases: [
      { inputs: [[2,3,6,7], 7], expected: [[2,2,3],[7]] },
    ],
    hints: ['Use backtracking with a running sum.', 'Allow reusing the same element by not incrementing index.', 'Prune branches where sum exceeds target.'],
  },
  {
    id: 'nc-permutations',
    company: 'neetcode',
    title: 'Permutations',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    frequency: 'High',
    description: `Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.`,
    examples: [
      { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
      { input: 'nums = [0,1]', output: '[[0,1],[1,0]]' },
    ],
    constraints: ['1 <= nums.length <= 6', '-10 <= nums[i] <= 10', 'All the integers of nums are unique.'],
    starterCode: `def permute(nums):
    """
    :type nums: List[int]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'permute',
    testCases: [
      { inputs: [[1,2,3]], expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] },
    ],
    hints: ['Use backtracking with a visited set.', 'Try each unused element at each position.', 'Base case: permutation length equals input length.'],
  },
  {
    id: 'nc-subsets-ii',
    company: 'neetcode',
    title: 'Subsets II',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'Bit Manipulation'],
    frequency: 'Medium',
    description: `Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets.`,
    examples: [
      { input: 'nums = [1,2,2]', output: '[[],[1],[1,2],[1,2,2],[2],[2,2]]' },
      { input: 'nums = [0]', output: '[[],[0]]' },
    ],
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10'],
    starterCode: `def subsetsWithDup(nums):
    """
    :type nums: List[int]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'subsetsWithDup',
    testCases: [
      { inputs: [[1,2,2]], expected: [[],[1],[1,2],[1,2,2],[2],[2,2]] },
    ],
    hints: ['Sort the array first to group duplicates.', 'Skip duplicates at the same recursion level.', 'If nums[i] == nums[i-1] and i-1 was not used, skip.'],
  },
  {
    id: 'nc-combination-sum-ii',
    company: 'neetcode',
    title: 'Combination Sum II',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    frequency: 'Medium',
    description: `Given a collection of candidate numbers and a target number, find all unique combinations where the candidate numbers sum to target. Each number may only be used once.`,
    examples: [
      { input: 'candidates = [10,1,2,7,6,1,5], target = 8', output: '[[1,1,6],[1,2,5],[1,7],[2,6]]' },
      { input: 'candidates = [2,5,2,1,2], target = 5', output: '[[1,2,2],[5]]' },
    ],
    constraints: ['1 <= candidates.length <= 100', '1 <= candidates[i] <= 50', '1 <= target <= 30'],
    starterCode: `def combinationSum2(candidates, target):
    """
    :type candidates: List[int]
    :type target: int
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'combinationSum2',
    testCases: [
      { inputs: [[10,1,2,7,6,1,5], 8], expected: [[1,1,6],[1,2,5],[1,7],[2,6]] },
    ],
    hints: ['Sort and skip duplicates at same level.', 'Move to next index after using an element.', 'Prune when remaining sum is negative.'],
  },
  {
    id: 'nc-word-search',
    company: 'neetcode',
    title: 'Word Search',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'Matrix'],
    frequency: 'High',
    description: `Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically).`,
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: 'true' },
    ],
    constraints: ['m == board.length', 'n = board[i].length', '1 <= m, n <= 6', '1 <= word.length <= 15'],
    starterCode: `def exist(board, word):
    """
    :type board: List[List[str]]
    :type word: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'exist',
    testCases: [
      { inputs: [[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED'], expected: true },
    ],
    hints: ['DFS from each cell that matches first character.', 'Mark visited cells to avoid reuse.', 'Backtrack by unmarking when returning.'],
  },
  {
    id: 'nc-palindrome-partitioning',
    company: 'neetcode',
    title: 'Palindrome Partitioning',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming', 'Backtracking'],
    frequency: 'Medium',
    description: `Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.`,
    examples: [
      { input: 's = "aab"', output: '[["a","a","b"],["aa","b"]]' },
      { input: 's = "a"', output: '[["a"]]' },
    ],
    constraints: ['1 <= s.length <= 16', 's contains only lowercase English letters.'],
    starterCode: `def partition(s):
    """
    :type s: str
    :rtype: List[List[str]]
    """
    # Write your solution here
    pass`,
    functionName: 'partition',
    testCases: [
      { inputs: ['aab'], expected: [['a','a','b'],['aa','b']] },
    ],
    hints: ['Backtrack by trying all possible first palindromes.', 'Check if substring is palindrome before recursing.', 'Base case: empty string means valid partition found.'],
  },
  {
    id: 'nc-letter-combinations',
    company: 'neetcode',
    title: 'Letter Combinations of a Phone Number',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Backtracking'],
    frequency: 'High',
    description: `Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent (like on a phone keypad).`,
    examples: [
      { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
      { input: 'digits = ""', output: '[]' },
    ],
    constraints: ['0 <= digits.length <= 4', 'digits[i] is a digit in the range [2, 9].'],
    starterCode: `def letterCombinations(digits):
    """
    :type digits: str
    :rtype: List[str]
    """
    # Write your solution here
    pass`,
    functionName: 'letterCombinations',
    testCases: [
      { inputs: ['23'], expected: ['ad','ae','af','bd','be','bf','cd','ce','cf'] },
    ],
    hints: ['Map each digit to its letters.', 'Backtrack through each digit position.', 'Build combinations character by character.'],
  },
  {
    id: 'nc-n-queens',
    company: 'neetcode',
    title: 'N-Queens',
    difficulty: 'Hard',
    tags: ['Array', 'Backtracking'],
    frequency: 'Medium',
    description: `The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions.`,
    examples: [
      { input: 'n = 4', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
      { input: 'n = 1', output: '[["Q"]]' },
    ],
    constraints: ['1 <= n <= 9'],
    starterCode: `def solveNQueens(n):
    """
    :type n: int
    :rtype: List[List[str]]
    """
    # Write your solution here
    pass`,
    functionName: 'solveNQueens',
    testCases: [
      { inputs: [4], expected: [['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']] },
    ],
    hints: ['Place queens row by row.', 'Track columns, diagonals, and anti-diagonals.', 'Backtrack when no valid position in a row.'],
  },
];
const triesProblems: CompanyProblem[] = [
  {
    id: 'nc-implement-trie',
    company: 'neetcode',
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Design', 'Trie'],
    frequency: 'High',
    description: `A trie (prefix tree) is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class with insert, search, and startsWith methods.`,
    examples: [
      { input: '["Trie","insert","search","search","startsWith","insert","search"]\n[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]', output: '[null,null,true,false,true,null,true]' },
    ],
    constraints: ['1 <= word.length, prefix.length <= 2000', 'word and prefix consist only of lowercase English letters.', 'At most 3 * 10^4 calls in total will be made.'],
    starterCode: `class Trie:
    def __init__(self):
        # Initialize your data structure
        pass

    def insert(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass

    def startsWith(self, prefix: str) -> bool:
        pass`,
    functionName: 'Trie',
    testCases: [
      { inputs: [['insert','search','startsWith'], ['apple','apple','app']], expected: [null,true,true] },
    ],
    hints: ['Each node has children map and isEnd flag.', 'Insert: create nodes for each character.', 'Search: traverse and check isEnd at the end.'],
  },
  {
    id: 'nc-add-search-word',
    company: 'neetcode',
    title: 'Design Add and Search Words Data Structure',
    difficulty: 'Medium',
    tags: ['String', 'Depth-First Search', 'Design', 'Trie'],
    frequency: 'Medium',
    description: `Design a data structure that supports adding new words and finding if a string matches any previously added string. The search can contain dots '.' where dots can match any letter.`,
    examples: [
      { input: '["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\n[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]', output: '[null,null,null,null,false,true,true,true]' },
    ],
    constraints: ['1 <= word.length <= 25', 'word in addWord consists of lowercase English letters.', 'word in search consists of . or lowercase English letters.'],
    starterCode: `class WordDictionary:
    def __init__(self):
        pass

    def addWord(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass`,
    functionName: 'WordDictionary',
    testCases: [
      { inputs: [['addWord','search','search'], ['bad','bad','.ad']], expected: [null,true,true] },
    ],
    hints: ['Use a trie for storage.', 'For dots, recursively search all children.', 'DFS with backtracking for wildcard matching.'],
  },
  {
    id: 'nc-word-search-ii',
    company: 'neetcode',
    title: 'Word Search II',
    difficulty: 'Hard',
    tags: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'],
    frequency: 'High',
    description: `Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells.`,
    examples: [
      { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' },
    ],
    constraints: ['m == board.length', 'n == board[i].length', '1 <= m, n <= 12', '1 <= words.length <= 3 * 10^4'],
    starterCode: `def findWords(board, words):
    """
    :type board: List[List[str]]
    :type words: List[str]
    :rtype: List[str]
    """
    # Write your solution here
    pass`,
    functionName: 'findWords',
    testCases: [
      { inputs: [[['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], ['oath','pea','eat','rain']], expected: ['eat','oath'] },
    ],
    hints: ['Build a trie from all words.', 'DFS from each cell, following trie paths.', 'Prune trie nodes after finding words.'],
  },
];
const graphsProblems: CompanyProblem[] = [
  {
    id: 'nc-number-of-islands',
    company: 'neetcode',
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'],
    frequency: 'High',
    description: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is 0 or 1.'],
    starterCode: `def numIslands(grid):
    """
    :type grid: List[List[str]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'numIslands',
    testCases: [
      { inputs: [[['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]], expected: 1 },
    ],
    hints: ['DFS/BFS from each unvisited land cell.', 'Mark visited cells to avoid recounting.', 'Count number of DFS/BFS initiations.'],
  },
  {
    id: 'nc-clone-graph',
    company: 'neetcode',
    title: 'Clone Graph',
    difficulty: 'Medium',
    tags: ['Hash Table', 'DFS', 'BFS', 'Graph'],
    frequency: 'High',
    description: `Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of its neighbors.`,
    examples: [
      { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' },
    ],
    constraints: ['The number of nodes in the graph is in the range [0, 100].', '1 <= Node.val <= 100', 'There are no repeated edges and no self-loops in the graph.'],
    starterCode: `def cloneGraph(node):
    """
    :type node: Node
    :rtype: Node
    """
    # Write your solution here
    pass`,
    functionName: 'cloneGraph',
    testCases: [
      { inputs: [[[2,4],[1,3],[2,4],[1,3]]], expected: [[2,4],[1,3],[2,4],[1,3]] },
    ],
    hints: ['Use hash map to map original to clone.', 'DFS or BFS to traverse all nodes.', 'Create clone first, then set neighbors.'],
  },
  {
    id: 'nc-max-area-island',
    company: 'neetcode',
    title: 'Max Area of Island',
    difficulty: 'Medium',
    tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'],
    frequency: 'High',
    description: `You are given an m x n binary matrix grid. An island is a group of 1's connected 4-directionally. Return the maximum area of an island in grid. If there is no island, return 0.`,
    examples: [
      { input: 'grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0]]', output: '6' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 50', 'grid[i][j] is either 0 or 1.'],
    starterCode: `def maxAreaOfIsland(grid):
    """
    :type grid: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxAreaOfIsland',
    testCases: [
      { inputs: [[[0,0,1,0,0],[0,0,0,0,0],[0,1,1,0,1]]], expected: 2 },
    ],
    hints: ['DFS from each land cell, counting cells.', 'Track max area across all DFS runs.', 'Mark visited to avoid double counting.'],
  },
  {
    id: 'nc-pacific-atlantic',
    company: 'neetcode',
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    tags: ['Array', 'DFS', 'BFS', 'Matrix'],
    frequency: 'Medium',
    description: `Given an m x n matrix of non-negative integers representing the height of each cell, return a list of cells that can flow to both the Pacific and Atlantic oceans.`,
    examples: [
      { input: 'heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]', output: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]' },
    ],
    constraints: ['m == heights.length', 'n == heights[i].length', '1 <= m, n <= 200', '0 <= heights[i][j] <= 10^5'],
    starterCode: `def pacificAtlantic(heights):
    """
    :type heights: List[List[int]]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'pacificAtlantic',
    testCases: [
      { inputs: [[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]], expected: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]] },
    ],
    hints: ['BFS/DFS from ocean edges inward.', 'Find cells reachable from Pacific.', 'Find cells reachable from Atlantic. Intersect.'],
  },
  {
    id: 'nc-surrounded-regions',
    company: 'neetcode',
    title: 'Surrounded Regions',
    difficulty: 'Medium',
    tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'],
    frequency: 'Medium',
    description: `Given an m x n matrix board containing 'X' and 'O', capture all regions that are 4-directionally surrounded by 'X'. A region is captured by flipping all 'O's into 'X's.`,
    examples: [
      { input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]' },
    ],
    constraints: ['m == board.length', 'n == board[i].length', '1 <= m, n <= 200', 'board[i][j] is X or O.'],
    starterCode: `def solve(board):
    """
    :type board: List[List[str]]
    :rtype: None (modify board in-place)
    """
    # Write your solution here
    pass`,
    functionName: 'solve',
    testCases: [
      { inputs: [[['X','X','X','X'],['X','O','O','X'],['X','X','O','X'],['X','O','X','X']]], expected: [['X','X','X','X'],['X','X','X','X'],['X','X','X','X'],['X','O','X','X']] },
    ],
    hints: ['Mark O cells connected to border as safe.', 'DFS/BFS from border O cells.', 'Flip remaining O to X, restore safe cells.'],
  },
  {
    id: 'nc-rotting-oranges',
    company: 'neetcode',
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    tags: ['Array', 'BFS', 'Matrix'],
    frequency: 'High',
    description: `You are given an m x n grid where each cell can have one of three values: 0 (empty), 1 (fresh orange), 2 (rotten orange). Every minute, any fresh orange adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no cell has a fresh orange. If impossible, return -1.`,
    examples: [
      { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
      { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 10', 'grid[i][j] is 0, 1, or 2.'],
    starterCode: `def orangesRotting(grid):
    """
    :type grid: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'orangesRotting',
    testCases: [
      { inputs: [[[2,1,1],[1,1,0],[0,1,1]]], expected: 4 },
    ],
    hints: ['Multi-source BFS from all rotten oranges.', 'Track minutes as BFS levels.', 'Check if any fresh oranges remain.'],
  },
  {
    id: 'nc-course-schedule',
    company: 'neetcode',
    title: 'Course Schedule',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Graph', 'Topological Sort'],
    frequency: 'High',
    description: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses.`,
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' },
    ],
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', 'prerequisites[i].length == 2', 'All the pairs prerequisites[i] are unique.'],
    starterCode: `def canFinish(numCourses, prerequisites):
    """
    :type numCourses: int
    :type prerequisites: List[List[int]]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'canFinish',
    testCases: [
      { inputs: [2, [[1,0]]], expected: true },
      { inputs: [2, [[1,0],[0,1]]], expected: false },
    ],
    hints: ['Build adjacency list from prerequisites.', 'Detect cycle using DFS with visited states.', 'Or use topological sort (Kahn algorithm).'],
  },
  {
    id: 'nc-course-schedule-ii',
    company: 'neetcode',
    title: 'Course Schedule II',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Graph', 'Topological Sort'],
    frequency: 'Medium',
    description: `There are a total of numCourses courses. Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.`,
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: '[0,1]' },
      { input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,2,1,3]' },
    ],
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= numCourses * (numCourses - 1)'],
    starterCode: `def findOrder(numCourses, prerequisites):
    """
    :type numCourses: int
    :type prerequisites: List[List[int]]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'findOrder',
    testCases: [
      { inputs: [2, [[1,0]]], expected: [0,1] },
    ],
    hints: ['Topological sort using DFS or Kahn algorithm.', 'DFS: add node to result after visiting all neighbors.', 'Kahn: process nodes with 0 in-degree first.'],
  },
  {
    id: 'nc-graph-valid-tree',
    company: 'neetcode',
    title: 'Graph Valid Tree',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Union Find', 'Graph'],
    frequency: 'Medium',
    description: `Given n nodes labeled from 0 to n-1 and a list of undirected edges, write a function to check whether these edges make up a valid tree. A valid tree has n-1 edges and is connected.`,
    examples: [
      { input: 'n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]', output: 'true' },
      { input: 'n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]', output: 'false' },
    ],
    constraints: ['1 <= n <= 2000', '0 <= edges.length <= 5000'],
    starterCode: `def validTree(n, edges):
    """
    :type n: int
    :type edges: List[List[int]]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'validTree',
    testCases: [
      { inputs: [5, [[0,1],[0,2],[0,3],[1,4]]], expected: true },
    ],
    hints: ['Tree has exactly n-1 edges.', 'Check connectivity with DFS/BFS from node 0.', 'Or use Union-Find to detect cycles.'],
  },
  {
    id: 'nc-connected-components',
    company: 'neetcode',
    title: 'Number of Connected Components in an Undirected Graph',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Union Find', 'Graph'],
    frequency: 'Medium',
    description: `Given n nodes labeled from 0 to n - 1 and a list of undirected edges, return the number of connected components in the graph.`,
    examples: [
      { input: 'n = 5, edges = [[0,1],[1,2],[3,4]]', output: '2' },
      { input: 'n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]', output: '1' },
    ],
    constraints: ['1 <= n <= 2000', '1 <= edges.length <= 5000'],
    starterCode: `def countComponents(n, edges):
    """
    :type n: int
    :type edges: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'countComponents',
    testCases: [
      { inputs: [5, [[0,1],[1,2],[3,4]]], expected: 2 },
    ],
    hints: ['DFS/BFS from each unvisited node.', 'Count number of DFS/BFS initiations.', 'Or use Union-Find and count unique roots.'],
  },
  {
    id: 'nc-redundant-connection',
    company: 'neetcode',
    title: 'Redundant Connection',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Union Find', 'Graph'],
    frequency: 'Medium',
    description: `In this problem, a tree is an undirected graph that is connected and has no cycles. You are given a graph that started as a tree with n nodes, then one additional edge was added. Return an edge that can be removed so that the resulting graph is a tree.`,
    examples: [
      { input: 'edges = [[1,2],[1,3],[2,3]]', output: '[2,3]' },
      { input: 'edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]', output: '[1,4]' },
    ],
    constraints: ['n == edges.length', '3 <= n <= 1000', 'edges[i].length == 2', 'There are no repeated edges.'],
    starterCode: `def findRedundantConnection(edges):
    """
    :type edges: List[List[int]]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'findRedundantConnection',
    testCases: [
      { inputs: [[[1,2],[1,3],[2,3]]], expected: [2,3] },
    ],
    hints: ['Use Union-Find to detect cycle.', 'Process edges in order.', 'First edge that creates cycle is the answer.'],
  },
];
const advancedGraphsProblems: CompanyProblem[] = [
  {
    id: 'nc-reconstruct-itinerary',
    company: 'neetcode',
    title: 'Reconstruct Itinerary',
    difficulty: 'Hard',
    tags: ['DFS', 'Graph', 'Eulerian Circuit'],
    frequency: 'Medium',
    description: `You are given a list of airline tickets where tickets[i] = [fromi, toi] represent the departure and arrival airports. Reconstruct the itinerary in order and return it. All tickets belong to a man who departs from "JFK", and the itinerary must use all tickets exactly once. If there are multiple valid itineraries, return the one with the smallest lexical order.`,
    examples: [
      { input: 'tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]', output: '["JFK","MUC","LHR","SFO","SJC"]' },
      { input: 'tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]', output: '["JFK","ATL","JFK","SFO","ATL","SFO"]' },
    ],
    constraints: ['1 <= tickets.length <= 300', 'tickets[i].length == 2', 'fromi.length == 3', 'toi.length == 3', 'fromi and toi consist of uppercase English letters.'],
    starterCode: `def findItinerary(tickets):
    """
    :type tickets: List[List[str]]
    :rtype: List[str]
    """
    # Write your solution here
    pass`,
    functionName: 'findItinerary',
    testCases: [
      { inputs: [[['MUC','LHR'],['JFK','MUC'],['SFO','SJC'],['LHR','SFO']]], expected: ['JFK','MUC','LHR','SFO','SJC'] },
    ],
    hints: ['Build adjacency list with sorted destinations.', 'Use Hierholzer algorithm for Eulerian path.', 'DFS with backtracking, add to result in reverse.'],
  },
  {
    id: 'nc-min-cost-connect-points',
    company: 'neetcode',
    title: 'Min Cost to Connect All Points',
    difficulty: 'Medium',
    tags: ['Array', 'Union Find', 'Graph', 'Minimum Spanning Tree'],
    frequency: 'Medium',
    description: `You are given an array points representing integer coordinates of some points on a 2D-plane. The cost of connecting two points is the Manhattan distance between them. Return the minimum cost to make all points connected.`,
    examples: [
      { input: 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]', output: '20' },
      { input: 'points = [[3,12],[-2,5],[-4,1]]', output: '18' },
    ],
    constraints: ['1 <= points.length <= 1000', '-10^6 <= xi, yi <= 10^6', 'All pairs (xi, yi) are distinct.'],
    starterCode: `def minCostConnectPoints(points):
    """
    :type points: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'minCostConnectPoints',
    testCases: [
      { inputs: [[[0,0],[2,2],[3,10],[5,2],[7,0]]], expected: 20 },
    ],
    hints: ['This is Minimum Spanning Tree problem.', 'Use Prim or Kruskal algorithm.', 'Manhattan distance: |x1-x2| + |y1-y2|.'],
  },
  {
    id: 'nc-network-delay-time',
    company: 'neetcode',
    title: 'Network Delay Time',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Graph', 'Heap', 'Shortest Path'],
    frequency: 'Medium',
    description: `You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (ui, vi, wi). We will send a signal from a given node k. Return the minimum time it takes for all the n nodes to receive the signal. If it is impossible, return -1.`,
    examples: [
      { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2' },
      { input: 'times = [[1,2,1]], n = 2, k = 1', output: '1' },
    ],
    constraints: ['1 <= k <= n <= 100', '1 <= times.length <= 6000', '1 <= ui, vi <= n', '0 <= wi <= 100'],
    starterCode: `def networkDelayTime(times, n, k):
    """
    :type times: List[List[int]]
    :type n: int
    :type k: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'networkDelayTime',
    testCases: [
      { inputs: [[[2,1,1],[2,3,1],[3,4,1]], 4, 2], expected: 2 },
    ],
    hints: ['Use Dijkstra algorithm from node k.', 'Find shortest path to all nodes.', 'Return max of all shortest paths.'],
  },
  {
    id: 'nc-swim-in-rising-water',
    company: 'neetcode',
    title: 'Swim in Rising Water',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'DFS', 'BFS', 'Union Find', 'Heap', 'Matrix'],
    frequency: 'Medium',
    description: `You are given an n x n integer matrix grid where each value grid[i][j] represents the elevation at that point. Starting from the top-left corner, find the minimum time t such that you can reach the bottom-right corner. At time t, you can swim to a cell if the elevation is at most t.`,
    examples: [
      { input: 'grid = [[0,2],[1,3]]', output: '3' },
      { input: 'grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]', output: '16' },
    ],
    constraints: ['n == grid.length', 'n == grid[i].length', '1 <= n <= 50', '0 <= grid[i][j] < n^2', 'Each value grid[i][j] is unique.'],
    starterCode: `def swimInWater(grid):
    """
    :type grid: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'swimInWater',
    testCases: [
      { inputs: [[[0,2],[1,3]]], expected: 3 },
    ],
    hints: ['Binary search on time t.', 'For each t, check if path exists using BFS/DFS.', 'Or use Dijkstra/Prim with max elevation as cost.'],
  },
  {
    id: 'nc-alien-dictionary',
    company: 'neetcode',
    title: 'Alien Dictionary',
    difficulty: 'Hard',
    tags: ['Array', 'String', 'DFS', 'BFS', 'Graph', 'Topological Sort'],
    frequency: 'High',
    description: `There is a new alien language that uses the English alphabet. The order among letters is unknown to you. You are given a list of strings words from the alien dictionary where the strings are sorted lexicographically by the rules of this new language. Derive the order of letters in this language.`,
    examples: [
      { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"' },
      { input: 'words = ["z","x"]', output: '"zx"' },
    ],
    constraints: ['1 <= words.length <= 100', '1 <= words[i].length <= 100', 'words[i] consists of only lowercase English letters.'],
    starterCode: `def alienOrder(words):
    """
    :type words: List[str]
    :rtype: str
    """
    # Write your solution here
    pass`,
    functionName: 'alienOrder',
    testCases: [
      { inputs: [['wrt','wrf','er','ett','rftt']], expected: 'wertf' },
    ],
    hints: ['Compare adjacent words to find order.', 'Build graph of character ordering.', 'Topological sort gives the answer.'],
  },
  {
    id: 'nc-cheapest-flights',
    company: 'neetcode',
    title: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Graph', 'Dynamic Programming', 'Heap', 'Shortest Path'],
    frequency: 'Medium',
    description: `There are n cities connected by some flights. You are given the flights where flights[i] = [fromi, toi, pricei]. Given also src, dst, and k, return the cheapest price from src to dst with at most k stops. If there is no such route, return -1.`,
    examples: [
      { input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1', output: '700' },
      { input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1', output: '200' },
    ],
    constraints: ['1 <= n <= 100', '0 <= flights.length <= (n * (n - 1) / 2)', '0 <= src, dst, k < n'],
    starterCode: `def findCheapestPrice(n, flights, src, dst, k):
    """
    :type n: int
    :type flights: List[List[int]]
    :type src: int
    :type dst: int
    :type k: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'findCheapestPrice',
    testCases: [
      { inputs: [4, [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], 0, 3, 1], expected: 700 },
    ],
    hints: ['Modified Dijkstra with stop constraint.', 'BFS level by level (k+1 levels).', 'Bellman-Ford with k+1 iterations.'],
  },
];
const dp1DProblems: CompanyProblem[] = [
  {
    id: 'nc-climbing-stairs',
    company: 'neetcode',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    frequency: 'High',
    description: `You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: 'Two ways: 1+1 or 2' },
      { input: 'n = 3', output: '3', explanation: 'Three ways: 1+1+1, 1+2, 2+1' },
    ],
    constraints: ['1 <= n <= 45'],
    starterCode: `def climbStairs(n):
    """
    :type n: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'climbStairs',
    testCases: [
      { inputs: [2], expected: 2 },
      { inputs: [3], expected: 3 },
    ],
    hints: ['This is the Fibonacci sequence.', 'dp[i] = dp[i-1] + dp[i-2].', 'Only need to track last two values.'],
  },
  {
    id: 'nc-min-cost-climbing-stairs',
    company: 'neetcode',
    title: 'Min Cost Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from step 0 or step 1. Return the minimum cost to reach the top of the floor.`,
    examples: [
      { input: 'cost = [10,15,20]', output: '15', explanation: 'Start at index 1, pay 15 and climb two steps to reach the top.' },
      { input: 'cost = [1,100,1,1,1,100,1,1,100,1]', output: '6' },
    ],
    constraints: ['2 <= cost.length <= 1000', '0 <= cost[i] <= 999'],
    starterCode: `def minCostClimbingStairs(cost):
    """
    :type cost: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'minCostClimbingStairs',
    testCases: [
      { inputs: [[10,15,20]], expected: 15 },
    ],
    hints: ['dp[i] = min cost to reach step i.', 'dp[i] = cost[i] + min(dp[i-1], dp[i-2]).', 'Answer is min(dp[n-1], dp[n-2]).'],
  },
  {
    id: 'nc-house-robber',
    company: 'neetcode',
    title: 'House Robber',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'High',
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected - if two adjacent houses are broken into on the same night, the police will be contacted. Given an array representing the amount of money at each house, return the maximum amount of money you can rob without alerting the police.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (1) + house 3 (3) = 4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 (2) + house 3 (9) + house 5 (1) = 12.' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    starterCode: `def rob(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'rob',
    testCases: [
      { inputs: [[1,2,3,1]], expected: 4 },
      { inputs: [[2,7,9,3,1]], expected: 12 },
    ],
    hints: ['dp[i] = max money robbing up to house i.', 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]).', 'Either skip house i or rob it.'],
  },
  {
    id: 'nc-house-robber-ii',
    company: 'neetcode',
    title: 'House Robber II',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `You are a professional robber planning to rob houses arranged in a circle. Adjacent houses have security systems - if two adjacent houses are broken into, the police will be contacted. Given an array representing the amount at each house, return the maximum amount you can rob.`,
    examples: [
      { input: 'nums = [2,3,2]', output: '3', explanation: 'Cannot rob house 1 (2) and house 3 (2) since they are adjacent in a circle.' },
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (1) + house 3 (3) = 4.' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 1000'],
    starterCode: `def rob(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'rob',
    testCases: [
      { inputs: [[2,3,2]], expected: 3 },
      { inputs: [[1,2,3,1]], expected: 4 },
    ],
    hints: ['First and last house are adjacent.', 'Run House Robber I on nums[0:n-1] and nums[1:n].', 'Return max of both results.'],
  },
  {
    id: 'nc-longest-palindromic-substring',
    company: 'neetcode',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    frequency: 'High',
    description: `Given a string s, return the longest palindromic substring in s.`,
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    constraints: ['1 <= s.length <= 1000', 's consist of only digits and English letters.'],
    starterCode: `def longestPalindrome(s):
    """
    :type s: str
    :rtype: str
    """
    # Write your solution here
    pass`,
    functionName: 'longestPalindrome',
    testCases: [
      { inputs: ['babad'], expected: 'bab' },
      { inputs: ['cbbd'], expected: 'bb' },
    ],
    hints: ['Expand around center technique.', 'Try each index as center (odd length).', 'Try each pair as center (even length).'],
  },
  {
    id: 'nc-palindromic-substrings',
    company: 'neetcode',
    title: 'Palindromic Substrings',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `Given a string s, return the number of palindromic substrings in it. A substring is a contiguous sequence of characters within the string.`,
    examples: [
      { input: 's = "abc"', output: '3', explanation: 'Three palindromic strings: "a", "b", "c".' },
      { input: 's = "aaa"', output: '6', explanation: 'Six palindromic strings: "a", "a", "a", "aa", "aa", "aaa".' },
    ],
    constraints: ['1 <= s.length <= 1000', 's consists of lowercase English letters.'],
    starterCode: `def countSubstrings(s):
    """
    :type s: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'countSubstrings',
    testCases: [
      { inputs: ['abc'], expected: 3 },
      { inputs: ['aaa'], expected: 6 },
    ],
    hints: ['Expand around each center.', 'Count palindromes of odd and even length.', 'Each expansion that matches is a palindrome.'],
  },
  {
    id: 'nc-decode-ways',
    company: 'neetcode',
    title: 'Decode Ways',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    frequency: 'High',
    description: `A message containing letters from A-Z can be encoded into numbers using the mapping A=1, B=2, ..., Z=26. Given a string s containing only digits, return the number of ways to decode it.`,
    examples: [
      { input: 's = "12"', output: '2', explanation: '"12" could be decoded as "AB" (1 2) or "L" (12).' },
      { input: 's = "226"', output: '3', explanation: '"226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).' },
    ],
    constraints: ['1 <= s.length <= 100', 's contains only digits and may contain leading zeros.'],
    starterCode: `def numDecodings(s):
    """
    :type s: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'numDecodings',
    testCases: [
      { inputs: ['12'], expected: 2 },
      { inputs: ['226'], expected: 3 },
    ],
    hints: ['dp[i] = number of ways to decode s[0:i].', 'Check if s[i-1] is valid (1-9).', 'Check if s[i-2:i] is valid (10-26).'],
  },
  {
    id: 'nc-coin-change',
    company: 'neetcode',
    title: 'Coin Change',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'BFS'],
    frequency: 'High',
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed to make up that amount. If that amount cannot be made up, return -1.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    starterCode: `def coinChange(coins, amount):
    """
    :type coins: List[int]
    :type amount: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'coinChange',
    testCases: [
      { inputs: [[1,2,5], 11], expected: 3 },
      { inputs: [[2], 3], expected: -1 },
    ],
    hints: ['dp[i] = min coins to make amount i.', 'dp[i] = min(dp[i-coin] + 1) for each coin.', 'Initialize dp with infinity, dp[0] = 0.'],
  },
  {
    id: 'nc-maximum-product-subarray',
    company: 'neetcode',
    title: 'Maximum Product Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'High',
    description: `Given an integer array nums, find a subarray that has the largest product, and return the product.`,
    examples: [
      { input: 'nums = [2,3,-2,4]', output: '6', explanation: '[2,3] has the largest product 6.' },
      { input: 'nums = [-2,0,-1]', output: '0', explanation: 'The result cannot be 2, because [-2,-1] is not a subarray.' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-10 <= nums[i] <= 10'],
    starterCode: `def maxProduct(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxProduct',
    testCases: [
      { inputs: [[2,3,-2,4]], expected: 6 },
      { inputs: [[-2,0,-1]], expected: 0 },
    ],
    hints: ['Track both max and min products.', 'Negative * negative can become max.', 'Update max and min at each position.'],
  },
  {
    id: 'nc-word-break',
    company: 'neetcode',
    title: 'Word Break',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization'],
    frequency: 'High',
    description: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.`,
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true' },
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 20'],
    starterCode: `def wordBreak(s, wordDict):
    """
    :type s: str
    :type wordDict: List[str]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'wordBreak',
    testCases: [
      { inputs: ['leetcode', ['leet','code']], expected: true },
    ],
    hints: ['dp[i] = true if s[0:i] can be segmented.', 'Check all j < i where dp[j] is true.', 'If s[j:i] is in wordDict, dp[i] = true.'],
  },
  {
    id: 'nc-longest-increasing-subsequence',
    company: 'neetcode',
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search', 'Dynamic Programming'],
    frequency: 'High',
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.`,
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101].' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4'],
    starterCode: `def lengthOfLIS(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'lengthOfLIS',
    testCases: [
      { inputs: [[10,9,2,5,3,7,101,18]], expected: 4 },
    ],
    hints: ['O(n^2): dp[i] = LIS ending at i.', 'O(n log n): maintain sorted subsequence.', 'Binary search to find insertion position.'],
  },
  {
    id: 'nc-partition-equal-subset-sum',
    company: 'neetcode',
    title: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal.`,
    examples: [
      { input: 'nums = [1,5,11,5]', output: 'true', explanation: 'The array can be partitioned as [1, 5, 5] and [11].' },
      { input: 'nums = [1,2,3,5]', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 100'],
    starterCode: `def canPartition(nums):
    """
    :type nums: List[int]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'canPartition',
    testCases: [
      { inputs: [[1,5,11,5]], expected: true },
      { inputs: [[1,2,3,5]], expected: false },
    ],
    hints: ['If total sum is odd, return false.', 'Find if subset with sum = total/2 exists.', 'This is the 0/1 knapsack problem.'],
  },
];
const dp2DProblems: CompanyProblem[] = [
  {
    id: 'nc-unique-paths',
    company: 'neetcode',
    title: 'Unique Paths',
    difficulty: 'Medium',
    tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
    frequency: 'High',
    description: `There is a robot on an m x n grid. The robot starts at the top-left corner and wants to reach the bottom-right corner. The robot can only move either down or right at any point in time. Given the two integers m and n, return the number of possible unique paths.`,
    examples: [
      { input: 'm = 3, n = 7', output: '28' },
      { input: 'm = 3, n = 2', output: '3' },
    ],
    constraints: ['1 <= m, n <= 100'],
    starterCode: `def uniquePaths(m, n):
    """
    :type m: int
    :type n: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'uniquePaths',
    testCases: [
      { inputs: [3, 7], expected: 28 },
      { inputs: [3, 2], expected: 3 },
    ],
    hints: ['dp[i][j] = paths to reach cell (i,j).', 'dp[i][j] = dp[i-1][j] + dp[i][j-1].', 'Or use combinatorics: C(m+n-2, m-1).'],
  },
  {
    id: 'nc-longest-common-subsequence',
    company: 'neetcode',
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    frequency: 'High',
    description: `Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.`,
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The longest common subsequence is "ace".' },
      { input: 'text1 = "abc", text2 = "abc"', output: '3' },
    ],
    constraints: ['1 <= text1.length, text2.length <= 1000', 'text1 and text2 consist of only lowercase English characters.'],
    starterCode: `def longestCommonSubsequence(text1, text2):
    """
    :type text1: str
    :type text2: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'longestCommonSubsequence',
    testCases: [
      { inputs: ['abcde', 'ace'], expected: 3 },
    ],
    hints: ['dp[i][j] = LCS of text1[0:i] and text2[0:j].', 'If chars match: dp[i][j] = dp[i-1][j-1] + 1.', 'Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).'],
  },
  {
    id: 'nc-best-time-cooldown',
    company: 'neetcode',
    title: 'Best Time to Buy and Sell Stock with Cooldown',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve. You may complete as many transactions as you like with the following restrictions: After you sell, you cannot buy on the next day (i.e., cooldown one day).`,
    examples: [
      { input: 'prices = [1,2,3,0,2]', output: '3', explanation: 'buy, sell, cooldown, buy, sell' },
      { input: 'prices = [1]', output: '0' },
    ],
    constraints: ['1 <= prices.length <= 5000', '0 <= prices[i] <= 1000'],
    starterCode: `def maxProfit(prices):
    """
    :type prices: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxProfit',
    testCases: [
      { inputs: [[1,2,3,0,2]], expected: 3 },
    ],
    hints: ['Track states: hold, sold, rest.', 'hold[i] = max(hold[i-1], rest[i-1] - price).', 'sold[i] = hold[i-1] + price, rest[i] = max(rest[i-1], sold[i-1]).'],
  },
  {
    id: 'nc-coin-change-ii',
    company: 'neetcode',
    title: 'Coin Change II',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the number of combinations that make up that amount.`,
    examples: [
      { input: 'amount = 5, coins = [1,2,5]', output: '4', explanation: '4 ways: 5, 2+2+1, 2+1+1+1, 1+1+1+1+1' },
      { input: 'amount = 3, coins = [2]', output: '0' },
    ],
    constraints: ['1 <= coins.length <= 300', '1 <= coins[i] <= 5000', '0 <= amount <= 5000'],
    starterCode: `def change(amount, coins):
    """
    :type amount: int
    :type coins: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'change',
    testCases: [
      { inputs: [5, [1,2,5]], expected: 4 },
    ],
    hints: ['dp[i] = number of ways to make amount i.', 'Process coins one by one to avoid duplicates.', 'dp[j] += dp[j - coin] for each coin.'],
  },
  {
    id: 'nc-target-sum',
    company: 'neetcode',
    title: 'Target Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Backtracking'],
    frequency: 'Medium',
    description: `You are given an integer array nums and an integer target. You want to build an expression out of nums by adding one of the symbols '+' and '-' before each integer in nums. Return the number of different expressions that you can build, which evaluates to target.`,
    examples: [
      { input: 'nums = [1,1,1,1,1], target = 3', output: '5', explanation: '-1+1+1+1+1, +1-1+1+1+1, +1+1-1+1+1, +1+1+1-1+1, +1+1+1+1-1' },
    ],
    constraints: ['1 <= nums.length <= 20', '0 <= nums[i] <= 1000', '0 <= sum(nums[i]) <= 1000', '-1000 <= target <= 1000'],
    starterCode: `def findTargetSumWays(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'findTargetSumWays',
    testCases: [
      { inputs: [[1,1,1,1,1], 3], expected: 5 },
    ],
    hints: ['Transform to subset sum problem.', 'P - N = target, P + N = sum.', 'Find subsets with sum = (target + sum) / 2.'],
  },
  {
    id: 'nc-interleaving-string',
    company: 'neetcode',
    title: 'Interleaving String',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2. An interleaving of two strings maintains the relative order of characters from each.`,
    examples: [
      { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: 'true' },
      { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"', output: 'false' },
    ],
    constraints: ['0 <= s1.length, s2.length <= 100', '0 <= s3.length <= 200', 's1, s2, and s3 consist of lowercase English letters.'],
    starterCode: `def isInterleave(s1, s2, s3):
    """
    :type s1: str
    :type s2: str
    :type s3: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isInterleave',
    testCases: [
      { inputs: ['aabcc', 'dbbca', 'aadbbcbcac'], expected: true },
    ],
    hints: ['dp[i][j] = can s1[0:i] and s2[0:j] interleave to s3[0:i+j].', 'Check if s1[i-1] or s2[j-1] matches s3[i+j-1].', 'Length check: len(s1) + len(s2) == len(s3).'],
  },
  {
    id: 'nc-longest-increasing-path',
    company: 'neetcode',
    title: 'Longest Increasing Path in a Matrix',
    difficulty: 'Hard',
    tags: ['Array', 'Dynamic Programming', 'DFS', 'BFS', 'Graph', 'Topological Sort', 'Memoization', 'Matrix'],
    frequency: 'Medium',
    description: `Given an m x n integers matrix, return the length of the longest increasing path in matrix. From each cell, you can move in four directions: left, right, up, or down.`,
    examples: [
      { input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]', output: '4', explanation: 'The longest increasing path is [1, 2, 6, 9].' },
    ],
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 200', '0 <= matrix[i][j] <= 2^31 - 1'],
    starterCode: `def longestIncreasingPath(matrix):
    """
    :type matrix: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'longestIncreasingPath',
    testCases: [
      { inputs: [[[9,9,4],[6,6,8],[2,1,1]]], expected: 4 },
    ],
    hints: ['DFS with memoization from each cell.', 'memo[i][j] = longest path starting at (i,j).', 'No need for visited since path is increasing.'],
  },
  {
    id: 'nc-distinct-subsequences',
    company: 'neetcode',
    title: 'Distinct Subsequences',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `Given two strings s and t, return the number of distinct subsequences of s which equals t.`,
    examples: [
      { input: 's = "rabbbit", t = "rabbit"', output: '3', explanation: 'There are 3 ways to generate "rabbit" from "rabbbit".' },
      { input: 's = "babgbag", t = "bag"', output: '5' },
    ],
    constraints: ['1 <= s.length, t.length <= 1000', 's and t consist of English letters.'],
    starterCode: `def numDistinct(s, t):
    """
    :type s: str
    :type t: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'numDistinct',
    testCases: [
      { inputs: ['rabbbit', 'rabbit'], expected: 3 },
    ],
    hints: ['dp[i][j] = ways to form t[0:j] from s[0:i].', 'If s[i-1] == t[j-1]: dp[i][j] = dp[i-1][j-1] + dp[i-1][j].', 'Else: dp[i][j] = dp[i-1][j].'],
  },
  {
    id: 'nc-edit-distance',
    company: 'neetcode',
    title: 'Edit Distance',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    frequency: 'High',
    description: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have three operations: insert, delete, or replace a character.`,
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'horse -> rorse -> rose -> ros' },
      { input: 'word1 = "intention", word2 = "execution"', output: '5' },
    ],
    constraints: ['0 <= word1.length, word2.length <= 500', 'word1 and word2 consist of lowercase English letters.'],
    starterCode: `def minDistance(word1, word2):
    """
    :type word1: str
    :type word2: str
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'minDistance',
    testCases: [
      { inputs: ['horse', 'ros'], expected: 3 },
    ],
    hints: ['dp[i][j] = edit distance for word1[0:i] and word2[0:j].', 'If chars match: dp[i][j] = dp[i-1][j-1].', 'Else: min of insert, delete, replace + 1.'],
  },
  {
    id: 'nc-burst-balloons',
    company: 'neetcode',
    title: 'Burst Balloons',
    difficulty: 'Hard',
    tags: ['Array', 'Dynamic Programming'],
    frequency: 'Medium',
    description: `You are given n balloons, indexed from 0 to n-1. Each balloon is painted with a number on it represented by array nums. You are asked to burst all the balloons. If you burst balloon i you will get nums[i-1] * nums[i] * nums[i+1] coins. Return the maximum coins you can collect.`,
    examples: [
      { input: 'nums = [3,1,5,8]', output: '167', explanation: 'nums = [3,1,5,8] --> [3,5,8] --> [3,8] --> [8] --> [], coins = 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 300', '0 <= nums[i] <= 100'],
    starterCode: `def maxCoins(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxCoins',
    testCases: [
      { inputs: [[3,1,5,8]], expected: 167 },
    ],
    hints: ['Think of balloon i as last to burst in range.', 'dp[i][j] = max coins bursting balloons in (i,j).', 'Try each k as last balloon in range.'],
  },
  {
    id: 'nc-regex-matching',
    company: 'neetcode',
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming', 'Recursion'],
    frequency: 'Medium',
    description: `Given an input string s and a pattern p, implement regular expression matching with support for '.' (matches any single character) and '*' (matches zero or more of the preceding element).`,
    examples: [
      { input: 's = "aa", p = "a"', output: 'false' },
      { input: 's = "aa", p = "a*"', output: 'true' },
      { input: 's = "ab", p = ".*"', output: 'true' },
    ],
    constraints: ['1 <= s.length <= 20', '1 <= p.length <= 20', 's contains only lowercase English letters.', 'p contains only lowercase English letters, . and *.'],
    starterCode: `def isMatch(s, p):
    """
    :type s: str
    :type p: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isMatch',
    testCases: [
      { inputs: ['aa', 'a*'], expected: true },
    ],
    hints: ['dp[i][j] = does s[0:i] match p[0:j].', 'Handle . as any character match.', 'Handle * by using 0 or more of preceding char.'],
  },
];
const greedyProblems: CompanyProblem[] = [
  {
    id: 'nc-maximum-subarray',
    company: 'neetcode',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    frequency: 'High',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: `def maxSubArray(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'maxSubArray',
    testCases: [
      { inputs: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
    ],
    hints: ['Use Kadane\'s algorithm.', 'Track current sum and max sum.', 'Reset current sum if it becomes negative.'],
  },
  {
    id: 'nc-jump-game',
    company: 'neetcode',
    title: 'Jump Game',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    frequency: 'High',
    description: `You are given an integer array nums. You are initially positioned at the array's first index, and each element represents your maximum jump length. Return true if you can reach the last index.`,
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
      { input: 'nums = [3,2,1,0,4]', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= 10^5'],
    starterCode: `def canJump(nums):
    """
    :type nums: List[int]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'canJump',
    testCases: [
      { inputs: [[2,3,1,1,4]], expected: true },
      { inputs: [[3,2,1,0,4]], expected: false },
    ],
    hints: ['Track the maximum reachable index.', 'If current index > max reachable, return false.', 'Update max reachable at each position.'],
  },
  {
    id: 'nc-jump-game-ii',
    company: 'neetcode',
    title: 'Jump Game II',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    frequency: 'Medium',
    description: `You are given an array nums and you are initially positioned at the first index. Each element represents your maximum jump length. Your goal is to reach the last index in the minimum number of jumps.`,
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: '2', explanation: 'Jump 1 step to index 1, then 3 steps to the last index.' },
      { input: 'nums = [2,3,0,1,4]', output: '2' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= 1000'],
    starterCode: `def jump(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'jump',
    testCases: [
      { inputs: [[2,3,1,1,4]], expected: 2 },
    ],
    hints: ['BFS approach: each level is one jump.', 'Track current range and next range.', 'Increment jumps when exiting current range.'],
  },
  {
    id: 'nc-gas-station',
    company: 'neetcode',
    title: 'Gas Station',
    difficulty: 'Medium',
    tags: ['Array', 'Greedy'],
    frequency: 'Medium',
    description: `There are n gas stations along a circular route, where gas[i] is the amount of gas at station i, and cost[i] is the cost to travel from station i to i+1. Return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1.`,
    examples: [
      { input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]', output: '3' },
      { input: 'gas = [2,3,4], cost = [3,4,3]', output: '-1' },
    ],
    constraints: ['n == gas.length == cost.length', '1 <= n <= 10^5', '0 <= gas[i], cost[i] <= 10^4'],
    starterCode: `def canCompleteCircuit(gas, cost):
    """
    :type gas: List[int]
    :type cost: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'canCompleteCircuit',
    testCases: [
      { inputs: [[1,2,3,4,5], [3,4,5,1,2]], expected: 3 },
    ],
    hints: ['If total gas >= total cost, solution exists.', 'If tank goes negative, start from next station.', 'Track both total and current tank.'],
  },
  {
    id: 'nc-hand-of-straights',
    company: 'neetcode',
    title: 'Hand of Straights',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Greedy', 'Sorting'],
    frequency: 'Medium',
    description: `Alice has some number of cards given in hand. She wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards. Return true if she can.`,
    examples: [
      { input: 'hand = [1,2,3,6,2,3,4,7,8], groupSize = 3', output: 'true', explanation: 'Alice can form [1,2,3], [2,3,4], [6,7,8].' },
      { input: 'hand = [1,2,3,4,5], groupSize = 4', output: 'false' },
    ],
    constraints: ['1 <= hand.length <= 10^4', '0 <= hand[i] <= 10^9', '1 <= groupSize <= hand.length'],
    starterCode: `def isNStraightHand(hand, groupSize):
    """
    :type hand: List[int]
    :type groupSize: int
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isNStraightHand',
    testCases: [
      { inputs: [[1,2,3,6,2,3,4,7,8], 3], expected: true },
    ],
    hints: ['Sort the hand first.', 'Use hashmap to count frequencies.', 'Greedily form groups starting from smallest.'],
  },
  {
    id: 'nc-merge-triplets',
    company: 'neetcode',
    title: 'Merge Triplets to Form Target Triplet',
    difficulty: 'Medium',
    tags: ['Array', 'Greedy'],
    frequency: 'Medium',
    description: `A triplet is an array of three integers. You are given a 2D integer array triplets and an integer array target. Return true if it is possible to obtain the target triplet by selecting some triplets and updating with the max operation.`,
    examples: [
      { input: 'triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]', output: 'true' },
      { input: 'triplets = [[3,4,5],[4,5,6]], target = [3,2,5]', output: 'false' },
    ],
    constraints: ['1 <= triplets.length <= 10^5', 'triplets[i].length == target.length == 3', '1 <= triplets[i][j], target[j] <= 1000'],
    starterCode: `def mergeTriplets(triplets, target):
    """
    :type triplets: List[List[int]]
    :type target: List[int]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'mergeTriplets',
    testCases: [
      { inputs: [[[2,5,3],[1,8,4],[1,7,5]], [2,7,5]], expected: true },
    ],
    hints: ['Filter out triplets that exceed target in any position.', 'Check if remaining triplets can match target.', 'Track which target positions can be achieved.'],
  },
  {
    id: 'nc-partition-labels',
    company: 'neetcode',
    title: 'Partition Labels',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Two Pointers', 'String', 'Greedy'],
    frequency: 'Medium',
    description: `You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.`,
    examples: [
      { input: 's = "ababcbacadefegdehijhklij"', output: '[9,7,8]', explanation: 'The partition is "ababcbaca", "defegde", "hijhklij".' },
    ],
    constraints: ['1 <= s.length <= 500', 's consists of lowercase English letters.'],
    starterCode: `def partitionLabels(s):
    """
    :type s: str
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'partitionLabels',
    testCases: [
      { inputs: ['ababcbacadefegdehijhklij'], expected: [9,7,8] },
    ],
    hints: ['Find last occurrence of each character.', 'Extend partition end to include all occurrences.', 'When i reaches partition end, close partition.'],
  },
  {
    id: 'nc-valid-parenthesis-string',
    company: 'neetcode',
    title: 'Valid Parenthesis String',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming', 'Stack', 'Greedy'],
    frequency: 'Medium',
    description: `Given a string s containing only three types of characters: '(', ')' and '*', return true if s is valid. '*' could be treated as '(' OR ')' OR an empty string.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "(*)"', output: 'true' },
      { input: 's = "(*))"', output: 'true' },
    ],
    constraints: ['1 <= s.length <= 100', 's[i] is (, ) or *.'],
    starterCode: `def checkValidString(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'checkValidString',
    testCases: [
      { inputs: ['()'], expected: true },
      { inputs: ['(*)'], expected: true },
    ],
    hints: ['Track min and max open parentheses.', 'Min: treat * as ), Max: treat * as (.', 'If max < 0 return false, if min < 0 reset to 0.'],
  },
];
const intervalsProblems: CompanyProblem[] = [
  {
    id: 'nc-insert-interval',
    company: 'neetcode',
    title: 'Insert Interval',
    difficulty: 'Medium',
    tags: ['Array'],
    frequency: 'High',
    description: `You are given an array of non-overlapping intervals sorted by their start time, and a new interval. Insert the new interval and merge if necessary. Return intervals still sorted and non-overlapping.`,
    examples: [
      { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]' },
      { input: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', output: '[[1,2],[3,10],[12,16]]' },
    ],
    constraints: ['0 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= starti <= endi <= 10^5'],
    starterCode: `def insert(intervals, newInterval):
    """
    :type intervals: List[List[int]]
    :type newInterval: List[int]
    :rtype: List[List[int]]
    """
    # Write your solution here
    pass`,
    functionName: 'insert',
    testCases: [
      { inputs: [[[1,3],[6,9]], [2,5]], expected: [[1,5],[6,9]] },
    ],
    hints: ['Three parts: before, overlapping, after.', 'Add intervals ending before newInterval starts.', 'Merge overlapping, then add remaining.'],
  },
  {
    id: 'nc-merge-intervals',
    company: 'neetcode',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    frequency: 'High',
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
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
    ],
    hints: ['Sort intervals by start time.', 'Merge if current start <= previous end.', 'Update end to max of both ends.'],
  },
  {
    id: 'nc-non-overlapping-intervals',
    company: 'neetcode',
    title: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy', 'Sorting'],
    frequency: 'Medium',
    description: `Given an array of intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.`,
    examples: [
      { input: 'intervals = [[1,2],[2,3],[3,4],[1,3]]', output: '1', explanation: '[1,3] can be removed and the rest don\'t overlap.' },
      { input: 'intervals = [[1,2],[1,2],[1,2]]', output: '2' },
    ],
    constraints: ['1 <= intervals.length <= 10^5', 'intervals[i].length == 2', '-5 * 10^4 <= starti < endi <= 5 * 10^4'],
    starterCode: `def eraseOverlapIntervals(intervals):
    """
    :type intervals: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'eraseOverlapIntervals',
    testCases: [
      { inputs: [[[1,2],[2,3],[3,4],[1,3]]], expected: 1 },
    ],
    hints: ['Sort by end time.', 'Greedily keep interval with earliest end.', 'Count overlapping intervals to remove.'],
  },
  {
    id: 'nc-meeting-rooms',
    company: 'neetcode',
    title: 'Meeting Rooms',
    difficulty: 'Easy',
    tags: ['Array', 'Sorting'],
    frequency: 'Medium',
    description: `Given an array of meeting time intervals where intervals[i] = [starti, endi], determine if a person could attend all meetings.`,
    examples: [
      { input: 'intervals = [[0,30],[5,10],[15,20]]', output: 'false' },
      { input: 'intervals = [[7,10],[2,4]]', output: 'true' },
    ],
    constraints: ['0 <= intervals.length <= 10^4', 'intervals[i].length == 2'],
    starterCode: `def canAttendMeetings(intervals):
    """
    :type intervals: List[List[int]]
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'canAttendMeetings',
    testCases: [
      { inputs: [[[0,30],[5,10],[15,20]]], expected: false },
      { inputs: [[[7,10],[2,4]]], expected: true },
    ],
    hints: ['Sort intervals by start time.', 'Check if any interval overlaps with previous.', 'Overlap: start < previous end.'],
  },
  {
    id: 'nc-meeting-rooms-ii',
    company: 'neetcode',
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy', 'Sorting', 'Heap'],
    frequency: 'High',
    description: `Given an array of meeting time intervals where intervals[i] = [starti, endi], return the minimum number of conference rooms required.`,
    examples: [
      { input: 'intervals = [[0,30],[5,10],[15,20]]', output: '2' },
      { input: 'intervals = [[7,10],[2,4]]', output: '1' },
    ],
    constraints: ['1 <= intervals.length <= 10^4', '0 <= starti < endi <= 10^6'],
    starterCode: `def minMeetingRooms(intervals):
    """
    :type intervals: List[List[int]]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'minMeetingRooms',
    testCases: [
      { inputs: [[[0,30],[5,10],[15,20]]], expected: 2 },
    ],
    hints: ['Separate starts and ends, sort both.', 'Use two pointers to simulate timeline.', 'Or use min-heap to track room end times.'],
  },
  {
    id: 'nc-minimum-interval',
    company: 'neetcode',
    title: 'Minimum Interval to Include Each Query',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Heap', 'Sorting'],
    frequency: 'Medium',
    description: `You are given a 2D integer array intervals and an integer array queries. For each query, return the size of the smallest interval that contains it. If no interval contains it, return -1.`,
    examples: [
      { input: 'intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]', output: '[3,3,1,4]' },
    ],
    constraints: ['1 <= intervals.length <= 10^5', '1 <= queries.length <= 10^5', 'intervals[i].length == 2', '1 <= lefti <= righti <= 10^7'],
    starterCode: `def minInterval(intervals, queries):
    """
    :type intervals: List[List[int]]
    :type queries: List[int]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'minInterval',
    testCases: [
      { inputs: [[[1,4],[2,4],[3,6],[4,4]], [2,3,4,5]], expected: [3,3,1,4] },
    ],
    hints: ['Sort intervals by start, queries by value.', 'Use min-heap ordered by interval size.', 'Add intervals starting before query, remove expired.'],
  },
];
const mathGeometryProblems: CompanyProblem[] = [
  {
    id: 'nc-rotate-image',
    company: 'neetcode',
    title: 'Rotate Image',
    difficulty: 'Medium',
    tags: ['Array', 'Math', 'Matrix'],
    frequency: 'High',
    description: `You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place.`,
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' },
    ],
    constraints: ['n == matrix.length == matrix[i].length', '1 <= n <= 20', '-1000 <= matrix[i][j] <= 1000'],
    starterCode: `def rotate(matrix):
    """
    :type matrix: List[List[int]]
    :rtype: None (modify matrix in-place)
    """
    # Write your solution here
    pass`,
    functionName: 'rotate',
    testCases: [
      { inputs: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [[7,4,1],[8,5,2],[9,6,3]] },
    ],
    hints: ['Transpose the matrix first.', 'Then reverse each row.', 'Or rotate layer by layer from outside in.'],
  },
  {
    id: 'nc-spiral-matrix',
    company: 'neetcode',
    title: 'Spiral Matrix',
    difficulty: 'Medium',
    tags: ['Array', 'Matrix', 'Simulation'],
    frequency: 'High',
    description: `Given an m x n matrix, return all elements of the matrix in spiral order.`,
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' },
      { input: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]', output: '[1,2,3,4,8,12,11,10,9,5,6,7]' },
    ],
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 10', '-100 <= matrix[i][j] <= 100'],
    starterCode: `def spiralOrder(matrix):
    """
    :type matrix: List[List[int]]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'spiralOrder',
    testCases: [
      { inputs: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [1,2,3,6,9,8,7,4,5] },
    ],
    hints: ['Track four boundaries: top, bottom, left, right.', 'Traverse right, down, left, up in order.', 'Shrink boundaries after each direction.'],
  },
  {
    id: 'nc-set-matrix-zeroes',
    company: 'neetcode',
    title: 'Set Matrix Zeroes',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Matrix'],
    frequency: 'High',
    description: `Given an m x n integer matrix, if an element is 0, set its entire row and column to 0's. You must do it in place.`,
    examples: [
      { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' },
    ],
    constraints: ['m == matrix.length', 'n == matrix[0].length', '1 <= m, n <= 200', '-2^31 <= matrix[i][j] <= 2^31 - 1'],
    starterCode: `def setZeroes(matrix):
    """
    :type matrix: List[List[int]]
    :rtype: None (modify matrix in-place)
    """
    # Write your solution here
    pass`,
    functionName: 'setZeroes',
    testCases: [
      { inputs: [[[1,1,1],[1,0,1],[1,1,1]]], expected: [[1,0,1],[0,0,0],[1,0,1]] },
    ],
    hints: ['Use first row and column as markers.', 'Track if first row/column needs zeroing.', 'Set zeros based on markers, then handle first row/col.'],
  },
  {
    id: 'nc-happy-number',
    company: 'neetcode',
    title: 'Happy Number',
    difficulty: 'Easy',
    tags: ['Hash Table', 'Math', 'Two Pointers'],
    frequency: 'Medium',
    description: `Write an algorithm to determine if a number n is happy. A happy number is defined by the following process: Replace the number by the sum of the squares of its digits. Repeat until the number equals 1 (happy), or loops endlessly in a cycle (not happy).`,
    examples: [
      { input: 'n = 19', output: 'true', explanation: '1² + 9² = 82, 8² + 2² = 68, 6² + 8² = 100, 1² + 0² + 0² = 1' },
      { input: 'n = 2', output: 'false' },
    ],
    constraints: ['1 <= n <= 2^31 - 1'],
    starterCode: `def isHappy(n):
    """
    :type n: int
    :rtype: bool
    """
    # Write your solution here
    pass`,
    functionName: 'isHappy',
    testCases: [
      { inputs: [19], expected: true },
      { inputs: [2], expected: false },
    ],
    hints: ['Use a set to detect cycles.', 'Or use Floyd\'s cycle detection (slow/fast).', 'Sum of digit squares eventually cycles or reaches 1.'],
  },
  {
    id: 'nc-plus-one',
    company: 'neetcode',
    title: 'Plus One',
    difficulty: 'Easy',
    tags: ['Array', 'Math'],
    frequency: 'Medium',
    description: `You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. Increment the large integer by one and return the resulting array of digits.`,
    examples: [
      { input: 'digits = [1,2,3]', output: '[1,2,4]' },
      { input: 'digits = [9,9,9]', output: '[1,0,0,0]' },
    ],
    constraints: ['1 <= digits.length <= 100', '0 <= digits[i] <= 9'],
    starterCode: `def plusOne(digits):
    """
    :type digits: List[int]
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'plusOne',
    testCases: [
      { inputs: [[1,2,3]], expected: [1,2,4] },
      { inputs: [[9,9,9]], expected: [1,0,0,0] },
    ],
    hints: ['Start from the rightmost digit.', 'Handle carry when digit is 9.', 'May need to prepend 1 if all digits were 9.'],
  },
  {
    id: 'nc-pow-x-n',
    company: 'neetcode',
    title: 'Pow(x, n)',
    difficulty: 'Medium',
    tags: ['Math', 'Recursion'],
    frequency: 'Medium',
    description: `Implement pow(x, n), which calculates x raised to the power n.`,
    examples: [
      { input: 'x = 2.00000, n = 10', output: '1024.00000' },
      { input: 'x = 2.10000, n = 3', output: '9.26100' },
      { input: 'x = 2.00000, n = -2', output: '0.25000' },
    ],
    constraints: ['-100.0 < x < 100.0', '-2^31 <= n <= 2^31 - 1', 'n is an integer.', 'Either x is not zero or n > 0.'],
    starterCode: `def myPow(x, n):
    """
    :type x: float
    :type n: int
    :rtype: float
    """
    # Write your solution here
    pass`,
    functionName: 'myPow',
    testCases: [
      { inputs: [2.0, 10], expected: 1024.0 },
    ],
    hints: ['Use binary exponentiation.', 'x^n = (x^2)^(n/2) for even n.', 'Handle negative n by using 1/x.'],
  },
  {
    id: 'nc-multiply-strings',
    company: 'neetcode',
    title: 'Multiply Strings',
    difficulty: 'Medium',
    tags: ['Math', 'String', 'Simulation'],
    frequency: 'Medium',
    description: `Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string. You must not use any built-in BigInteger library or convert the inputs to integer directly.`,
    examples: [
      { input: 'num1 = "2", num2 = "3"', output: '"6"' },
      { input: 'num1 = "123", num2 = "456"', output: '"56088"' },
    ],
    constraints: ['1 <= num1.length, num2.length <= 200', 'num1 and num2 consist of digits only.', 'Both num1 and num2 do not contain any leading zero, except the number 0 itself.'],
    starterCode: `def multiply(num1, num2):
    """
    :type num1: str
    :type num2: str
    :rtype: str
    """
    # Write your solution here
    pass`,
    functionName: 'multiply',
    testCases: [
      { inputs: ['2', '3'], expected: '6' },
      { inputs: ['123', '456'], expected: '56088' },
    ],
    hints: ['Simulate grade-school multiplication.', 'Result[i+j+1] += num1[i] * num2[j].', 'Handle carry and leading zeros.'],
  },
  {
    id: 'nc-detect-squares',
    company: 'neetcode',
    title: 'Detect Squares',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Design', 'Counting'],
    frequency: 'Medium',
    description: `You are given a stream of points on the X-Y plane. Design an algorithm that adds new points and counts the number of ways to choose three points such that they form an axis-aligned square with a given point.`,
    examples: [
      { input: '["DetectSquares","add","add","add","count","count","add","count"]\n[[],[[3,10]],[[11,2]],[[3,2]],[[11,10]],[[14,8]],[[11,2]],[[11,10]]]', output: '[null,null,null,null,1,0,null,2]' },
    ],
    constraints: ['point.length == 2', '0 <= x, y <= 1000', 'At most 3000 calls in total will be made to add and count.'],
    starterCode: `class DetectSquares:
    def __init__(self):
        pass

    def add(self, point: List[int]) -> None:
        pass

    def count(self, point: List[int]) -> int:
        pass`,
    functionName: 'DetectSquares',
    testCases: [
      { inputs: [['add','add','add','count'], [[3,10],[11,2],[3,2],[11,10]]], expected: [null,null,null,1] },
    ],
    hints: ['Store points with their counts.', 'For query point, find diagonal points.', 'Check if other two corners exist.'],
  },
];
const bitManipulationProblems: CompanyProblem[] = [
  {
    id: 'nc-single-number',
    company: 'neetcode',
    title: 'Single Number',
    difficulty: 'Easy',
    tags: ['Array', 'Bit Manipulation'],
    frequency: 'High',
    description: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.`,
    examples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4', 'Each element appears twice except for one.'],
    starterCode: `def singleNumber(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'singleNumber',
    testCases: [
      { inputs: [[2,2,1]], expected: 1 },
      { inputs: [[4,1,2,1,2]], expected: 4 },
    ],
    hints: ['XOR of a number with itself is 0.', 'XOR of a number with 0 is the number itself.', 'XOR all numbers together.'],
  },
  {
    id: 'nc-number-of-1-bits',
    company: 'neetcode',
    title: 'Number of 1 Bits',
    difficulty: 'Easy',
    tags: ['Divide and Conquer', 'Bit Manipulation'],
    frequency: 'Medium',
    description: `Write a function that takes the binary representation of an unsigned integer and returns the number of '1' bits it has (also known as the Hamming weight).`,
    examples: [
      { input: 'n = 00000000000000000000000000001011', output: '3' },
      { input: 'n = 00000000000000000000000010000000', output: '1' },
    ],
    constraints: ['The input must be a binary string of length 32.'],
    starterCode: `def hammingWeight(n):
    """
    :type n: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'hammingWeight',
    testCases: [
      { inputs: [11], expected: 3 },
      { inputs: [128], expected: 1 },
    ],
    hints: ['Check each bit using n & 1.', 'Right shift n by 1 each iteration.', 'Or use n & (n-1) to clear rightmost 1 bit.'],
  },
  {
    id: 'nc-counting-bits',
    company: 'neetcode',
    title: 'Counting Bits',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Bit Manipulation'],
    frequency: 'Medium',
    description: `Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.`,
    examples: [
      { input: 'n = 2', output: '[0,1,1]' },
      { input: 'n = 5', output: '[0,1,1,2,1,2]' },
    ],
    constraints: ['0 <= n <= 10^5'],
    starterCode: `def countBits(n):
    """
    :type n: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    functionName: 'countBits',
    testCases: [
      { inputs: [2], expected: [0,1,1] },
      { inputs: [5], expected: [0,1,1,2,1,2] },
    ],
    hints: ['dp[i] = dp[i >> 1] + (i & 1).', 'Or dp[i] = dp[i & (i-1)] + 1.', 'Use previously computed results.'],
  },
  {
    id: 'nc-reverse-bits',
    company: 'neetcode',
    title: 'Reverse Bits',
    difficulty: 'Easy',
    tags: ['Divide and Conquer', 'Bit Manipulation'],
    frequency: 'Medium',
    description: `Reverse bits of a given 32 bits unsigned integer.`,
    examples: [
      { input: 'n = 00000010100101000001111010011100', output: '964176192 (00111001011110000010100101000000)' },
    ],
    constraints: ['The input must be a binary string of length 32.'],
    starterCode: `def reverseBits(n):
    """
    :type n: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'reverseBits',
    testCases: [
      { inputs: [43261596], expected: 964176192 },
    ],
    hints: ['Extract each bit and place in reversed position.', 'result = (result << 1) | (n & 1), n >>= 1.', 'Repeat 32 times.'],
  },
  {
    id: 'nc-missing-number',
    company: 'neetcode',
    title: 'Missing Number',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'Math', 'Binary Search', 'Bit Manipulation', 'Sorting'],
    frequency: 'Medium',
    description: `Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.`,
    examples: [
      { input: 'nums = [3,0,1]', output: '2' },
      { input: 'nums = [0,1]', output: '2' },
      { input: 'nums = [9,6,4,2,3,5,7,0,1]', output: '8' },
    ],
    constraints: ['n == nums.length', '1 <= n <= 10^4', '0 <= nums[i] <= n', 'All the numbers of nums are unique.'],
    starterCode: `def missingNumber(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'missingNumber',
    testCases: [
      { inputs: [[3,0,1]], expected: 2 },
      { inputs: [[0,1]], expected: 2 },
    ],
    hints: ['Sum formula: n*(n+1)/2 - sum(nums).', 'Or XOR all numbers 0 to n with all nums.', 'Missing number remains after XOR.'],
  },
  {
    id: 'nc-sum-of-two-integers',
    company: 'neetcode',
    title: 'Sum of Two Integers',
    difficulty: 'Medium',
    tags: ['Math', 'Bit Manipulation'],
    frequency: 'Medium',
    description: `Given two integers a and b, return the sum of the two integers without using the operators + and -.`,
    examples: [
      { input: 'a = 1, b = 2', output: '3' },
      { input: 'a = 2, b = 3', output: '5' },
    ],
    constraints: ['-1000 <= a, b <= 1000'],
    starterCode: `def getSum(a, b):
    """
    :type a: int
    :type b: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'getSum',
    testCases: [
      { inputs: [1, 2], expected: 3 },
      { inputs: [2, 3], expected: 5 },
    ],
    hints: ['XOR gives sum without carry.', 'AND then left shift gives carry.', 'Repeat until carry is 0.'],
  },
  {
    id: 'nc-reverse-integer',
    company: 'neetcode',
    title: 'Reverse Integer',
    difficulty: 'Medium',
    tags: ['Math'],
    frequency: 'Medium',
    description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.`,
    examples: [
      { input: 'x = 123', output: '321' },
      { input: 'x = -123', output: '-321' },
      { input: 'x = 120', output: '21' },
    ],
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    starterCode: `def reverse(x):
    """
    :type x: int
    :rtype: int
    """
    # Write your solution here
    pass`,
    functionName: 'reverse',
    testCases: [
      { inputs: [123], expected: 321 },
      { inputs: [-123], expected: -321 },
    ],
    hints: ['Pop digits from x, push to result.', 'Check for overflow before adding digit.', 'Handle negative numbers carefully.'],
  },
];

// ============================================
// EXPORT CATEGORIES AND COMPANY
// ============================================
export const NEETCODE_CATEGORIES: NeetCodeCategory[] = [
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    icon: 'Hash',
    description: 'Foundation problems using arrays and hash maps for efficient lookups',
    problems: arraysHashingProblems,
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    icon: 'ArrowLeftRight',
    description: 'Problems solved using two pointer technique',
    problems: twoPointersProblems,
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    icon: 'PanelLeftClose',
    description: 'Dynamic window problems for subarray/substring optimization',
    problems: slidingWindowProblems,
  },
  {
    id: 'stack',
    name: 'Stack',
    icon: 'Layers',
    description: 'LIFO data structure problems including monotonic stacks',
    problems: stackProblems,
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    icon: 'Search',
    description: 'Divide and conquer search on sorted data',
    problems: binarySearchProblems,
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    icon: 'Link',
    description: 'Problems involving singly and doubly linked lists',
    problems: linkedListProblems,
  },
  {
    id: 'trees',
    name: 'Trees',
    icon: 'GitBranch',
    description: 'Binary trees, BSTs, and tree traversal algorithms',
    problems: treesProblems,
  },
  {
    id: 'heap',
    name: 'Heap / Priority Queue',
    icon: 'ListOrdered',
    description: 'Priority-based problems using heaps',
    problems: heapProblems,
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    icon: 'Undo',
    description: 'Recursive exploration with backtracking',
    problems: backtrackingProblems,
  },
  {
    id: 'tries',
    name: 'Tries',
    icon: 'Type',
    description: 'Prefix tree problems for string operations',
    problems: triesProblems,
  },
  {
    id: 'graphs',
    name: 'Graphs',
    icon: 'Share2',
    description: 'BFS, DFS, and basic graph algorithms',
    problems: graphsProblems,
  },
  {
    id: 'advanced-graphs',
    name: 'Advanced Graphs',
    icon: 'Network',
    description: 'Dijkstra, topological sort, and advanced algorithms',
    problems: advancedGraphsProblems,
  },
  {
    id: '1d-dp',
    name: '1-D Dynamic Programming',
    icon: 'TrendingUp',
    description: 'Single-dimensional DP problems',
    problems: dp1DProblems,
  },
  {
    id: '2d-dp',
    name: '2-D Dynamic Programming',
    icon: 'Grid3x3',
    description: 'Matrix and multi-dimensional DP problems',
    problems: dp2DProblems,
  },
  {
    id: 'greedy',
    name: 'Greedy',
    icon: 'Zap',
    description: 'Problems solved by making locally optimal choices',
    problems: greedyProblems,
  },
  {
    id: 'intervals',
    name: 'Intervals',
    icon: 'Calendar',
    description: 'Interval scheduling and merging problems',
    problems: intervalsProblems,
  },
  {
    id: 'math-geometry',
    name: 'Math & Geometry',
    icon: 'Calculator',
    description: 'Mathematical and geometric algorithms',
    problems: mathGeometryProblems,
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    icon: 'Binary',
    description: 'Problems using bitwise operations',
    problems: bitManipulationProblems,
  },
];

export const NEETCODE_150: Company = {
  id: 'neetcode-150',
  name: 'NeetCode 150',
  logo: '/logos/neetcode.svg',
  color: '#FFA116',
  description: 'Curated 150 problems covering all essential coding patterns for FAANG interviews',
  problems: NEETCODE_CATEGORIES.flatMap(cat => cat.problems),
};

// Helper functions
export function getNeetCodeCategory(categoryId: string): NeetCodeCategory | undefined {
  return NEETCODE_CATEGORIES.find(cat => cat.id === categoryId);
}

export function getNeetCodeProblem(problemId: string): CompanyProblem | undefined {
  return NEETCODE_150.problems.find(p => p.id === problemId);
}

export function getProblemsByCategory(categoryId: string): CompanyProblem[] {
  const category = getNeetCodeCategory(categoryId);
  return category?.problems || [];
}
