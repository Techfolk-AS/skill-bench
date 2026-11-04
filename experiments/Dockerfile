FROM node:22.23.4-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da
ARG CLAUDE_VERSION=latest
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_VERSION} tsx
RUN useradd -m -s /bin/bash claude
WORKDIR /project
COPY . .
RUN cd .claude/hooks && npm install 2>/dev/null || true
RUN chown -R claude:claude /project
USER claude
ENTRYPOINT ["claude"]
