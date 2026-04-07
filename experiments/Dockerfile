FROM node:22-slim
ARG CLAUDE_VERSION=latest
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_VERSION} tsx
RUN useradd -m -s /bin/bash claude
WORKDIR /project
COPY . .
RUN cd .claude/hooks && npm install 2>/dev/null || true
RUN chown -R claude:claude /project
USER claude
ENTRYPOINT ["claude"]
