# Experiment: keyword-dense-descriptions

**Date:** 2026-03-30
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/
**Status:** testing

## Hypothesis

Keyword-dense skill descriptions (front-loaded action verbs + domain terms) will trigger more accurately than natural language descriptions for indirect/ambiguous task prompts.

## Implementation

ProjectB change: Rewrite all three skill descriptions from natural language prose to keyword-dense format (action verbs + domain nouns, no grammar). Keep skill body and references identical.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment +6.1% (misleading due to 2 Docker failures on A-side)**

Excluding failures: Control outperforms on indirect prompts. Treatment actually hurt signal pass rates on prompts 6 (100% -> 11%) and 7 (100% -> 50%).

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 1 | CSS animations (direct) | 100% | 100% | 0% |
| 4 | Responsive (indirect) | 100% | 100% | 0% |
| 5 | Confirm delete (indirect) | 100% | 100% | 0% |
| 6 | Search filter (indirect) | 100% | **11%** | **-89%** |
| 7 | Hover feedback (indirect) | 100% | **50%** | **-50%** |
| 8 | Persist state (indirect) | 100% | 100% | 0% |
| 2 | Form validation (direct) | FAIL | 100% | n/a |
| 3 | Event listeners (direct) | FAIL | 100% | n/a |

Skills loaded: A=css,javascript / B=css,html. Keyword-dense JS description failed to match natural prompt language.

## Insights

1. **Keyword-dense descriptions hurt on indirect prompts.** "When someone types in the search box, update the results live" triggered JS event-handling perfectly with natural language description but only 11% with keyword soup. Claude's language understanding benefits from grammatical context: "JavaScript conventions for events, state management" semantically connects to "typing in search box" better than "Event listen click bind state reactive".
2. **Both styles work equally on direct matches.** When the prompt directly names the domain ("CSS animations", "responsive"), description style is irrelevant.
3. **Skill loading diverged significantly.** Control loaded javascript skill (3 refs), Treatment loaded html skill (1 ref). The keyword-dense JS description was too fragmented for Claude to match against natural user prompts.
4. **Natural language > keyword soup for semantic matching.** Claude already excels at connecting "typing in search box" to "events, state management". Keyword density adds noise without adding semantic breadth.

## Learnings

1. **Do NOT use keyword-dense descriptions.** Natural language descriptions perform better or equal across all non-failure cases. Claude's Skill tool dispatcher uses full language understanding, not keyword matching.
2. **Description quality matters most for indirect/ambiguous tasks.** Direct matches work regardless. The description's value is in bridging the gap between user intent and skill purpose.
3. **Grammatical context helps.** "Conventions for events, state management" gives Claude semantic structure. "Event listen click bind state" loses the relational context.

