# PRINCIPLED ALGOS: learning coding interviews by principle, not by memorizing problems

## What this is

LLMs are the greatest pattern matchers... ever. So I paired with one to identify principles that underpin common coding interview questions. Instead of solving problems for you, the LLM has helped me build a program to make you a problem solver.

The NeetCode 150 is a popular list of 150 LeetCode problems used to prepare for software engineering interviews. Most people study it by solving all 150 problems and trying to remember each solution.

This folder takes a different approach. Every one of those 150 solutions was analyzed to find the small number of ideas they are built from. There turned out to be **18 ideas**. If you understand those 18 well, you can work out the solution to almost any of the 150, and to most new problems you have never seen.

The folder contains those 18 ideas explained in full. It also has practice material, and a five-week plan for turning the ideas into something you can use under interview pressure.

## Where to start

1. Read the section below, **The words used everywhere in this folder**. Every other file assumes you know these terms.
2. Read `ANALYSIS.md`. It explains why this approach works and what its limits are. It takes about ten minutes.
3. Open `SCHEDULE.md` and do Day 1. The schedule tells you which parts of the other files to use each day.

You do not need to read `PRINCIPLES.md` front to back. The schedule sends you to one section at a time.

## The words used everywhere in this folder

Each term below is explained using one running example, **Two Sum**:

> Given a list of numbers and a target, find two numbers in the list that add up to the target.
> Example: numbers `[2, 7, 11, 15]`, target `9`. Answer: `2` and `7`.

**Brute force.** The obvious, slow solution. For Two Sum: take each number, then scan the whole list again for a partner that adds up to the target. With 1,000 numbers that is about a million comparisons. Every solution in this folder starts by stating the brute force, because the smart solution is always a fix for whatever the brute force wastes.

**Principle.** A reusable idea that removes that waste. There are 18, numbered **P1 to P18**, and each has its own section in `PRINCIPLES.md`. Two Sum uses **P1, "Hash it"**. As you walk through the list, store every number you have seen in a set, which can answer "have I seen this number?" instantly. For each new number, you ask whether its partner (target minus the number) is already in the set. The second scan disappears.

**Move.** The 18 principles are grouped into 6 families called moves, each named after the question that points to it. For example, the question "Is my slow solution re-computing something it already worked out?" leads to the move called **Remember**. That move contains P1 (hash it), P2 (running totals) and P3 (dynamic programming). The table of six questions at the top of `PRINCIPLES.md` is the thing to memorize first.

**Trigger.** A clue in the wording of a problem that tells you which principle to use. It is the answer to "how would I know to use this?" For P1, one trigger is a slow solution with an inner loop whose only job is to ask "have I seen this before?". Another is a problem asking you to "find a pair" or "find a duplicate". Every principle lists its triggers under the heading **How to recognize it**, and every card under **When to reach for this card**.

**Invariant.** One sentence that stays true at every step of the solution, from the first loop iteration to the last. For Two Sum: *"the set contains exactly the numbers I have already passed."* You say it before you write any code. Once you know what must stay true, the code mostly writes itself: each line either uses the fact or keeps it true. Most bugs, especially being off by one, come from code that quietly breaks its own invariant. Every principle and every practice card states its invariant, under the heading **What stays true**.

**Template.** The 5 to 15 lines of code that look almost the same every time a principle is used. For P1, the template is a loop that checks the set and then adds to it. Only the details change from problem to problem. The files also call these **idioms**.

**Card (drill card).** One template set up for practice in `DRILLS.md`. The visible part states the problems in full with examples, when to reach for the card, a sentence to say before you write, and the invariant. The answer is hidden and holds the code plus explained checks. You write the code from memory, then reveal the answer to compare. There are 36 cards.

**Contrast pair.** Two problems that look almost the same but need different principles. Two Sum and Two Sum II are a pair: the only difference is that Two Sum II's list is **sorted**. That one word means you no longer need a set. Two pointers, one starting at each end, solve it with no extra memory (P5). Pairs train you to notice the one detail that decides the approach. They live in `CONTRASTS.md`.

**Family.** The opposite of a contrast pair: problems that look nothing alike but use the same principle. Seeing them side by side teaches you to look past the story in the problem to the structure underneath.

**Composition.** A hard problem that needs two or three principles used together. Most of the "Hard" problems in the 150 are compositions.

**Coverage index.** The table at the end of `PRINCIPLES.md` that lists all 150 problems and which principle solves each one.

**Big-O (for example O(n), O(n²), O(log n)).** Shorthand for how the work grows as the input grows. O(n) means the work roughly doubles when the input doubles. O(n²) means it roughly quadruples. O(1) means the work stays the same no matter the input size. The brute force for Two Sum is O(n²); the set version is O(n).

**Problem numbers.** Numbers like 1, 167 or 1143 are LeetCode problem IDs. Two Sum is problem 1 and Two Sum II is problem 167. Search the number on leetcode.com to open the problem.

## What each file is for

| File | What it is for |
|---|---|
| `ANALYSIS.md` | Why learning principles beats memorizing problems, where the approach falls short, and the study method that fixes those gaps. Read first. |
| `SCHEDULE.md` | A day-by-day five-week plan. It also covers the five steps to follow on every problem and how to keep a short log of your attempts. |
| `PRINCIPLES.md` | The reference book. Each of the 18 principles has its triggers, the idea explained, its invariant, its template, worked examples with full solutions, the problems it solves, and common mistakes. It ends with 14 tricks that must simply be memorized, and the coverage index. |
| `DRILLS.md` | The 36 practice cards. You write each one from memory until you can do it correctly in under two minutes, three times in a row. |
| `CONTRASTS.md` | Contrast pairs, families, compositions, and a list of misleading wording in problems. The answers are hidden so you can test yourself. |

## Supporting material you can ignore but which I have included if you are curious re: LLM analsysis/decision-making

| Folder or file | What it is |
|---|---|
| `_analysis/notes_A.md` to `notes_F.md` | The raw notes from analyzing all 150 problems, one file per group of topics. |
| `_analysis/review_*.md` | Two independent reviews that checked the files above for mistakes. Their fixes have already been applied. |
| `_analysis/*.json` | Data files used to build the coverage index. |
| `_sources/` | [leetcode solutions](https://github.com/neetcode-gh/leetcode) && [Neetcode solutions](https://github.com/mdmzfzl/NeetCode-Solutions) used for solution analysis |
