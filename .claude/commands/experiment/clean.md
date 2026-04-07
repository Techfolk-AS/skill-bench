---
description: Clean profileA and profileB logs for a fresh start
allowed-tools: Bash(npx tsx:*)
---

Clean all log files from both experiment profiles. This wipes logs only — it does NOT clear conversation context. Between test prompts, start a new session (or `/clear`) in each test project to reset context.

## Steps

1. Run the cleanup script:

```
npx tsx scripts/experiment-clean-logs.ts
```

2. Confirm to the user that logs are cleared and ready for the next prompt
