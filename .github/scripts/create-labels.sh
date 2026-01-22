#!/bin/bash
# Script pour créer les labels GitHub
# Usage: ./create-labels.sh zuher83/ey-calendar

REPO=$1

if [ -z "$REPO" ]; then
  echo "Usage: $0 <owner/repo>"
  exit 1
fi

echo "Creating labels for $REPO..."

# Types
gh label create "bug" --description "Something isn't working" --color "d73a4a" --repo "$REPO" || true
gh label create "enhancement" --description "New feature or request" --color "a2eeef" --repo "$REPO" || true
gh label create "documentation" --description "Improvements or additions to documentation" --color "0075ca" --repo "$REPO" || true

# Priority
gh label create "priority: high" --description "High priority" --color "e11d21" --repo "$REPO" || true
gh label create "priority: medium" --description "Medium priority" --color "fbca04" --repo "$REPO" || true
gh label create "priority: low" --description "Low priority" --color "d4c5f9" --repo "$REPO" || true

# Status
gh label create "status: needs reproduction" --description "Needs a minimal reproduction" --color "ededed" --repo "$REPO" || true
gh label create "status: blocked" --description "Blocked by another issue or PR" --color "cccccc" --repo "$REPO" || true
gh label create "status: wontfix" --description "This will not be worked on" --color "ffffff" --repo "$REPO" || true

# Community
gh label create "good first issue" --description "Good for newcomers" --color "7057ff" --repo "$REPO" || true
gh label create "help wanted" --description "Extra attention is needed" --color "008672" --repo "$REPO" || true

# Dependencies
gh label create "dependencies" --description "Pull requests that update a dependency file" --color "0366d6" --repo "$REPO" || true
gh label create "github-actions" --description "Pull requests that update GitHub Actions code" --color "000000" --repo "$REPO" || true

# Breaking changes
gh label create "breaking change" --description "Introduces a breaking change" --color "b60205" --repo "$REPO" || true

echo "✅ Labels created successfully!"
