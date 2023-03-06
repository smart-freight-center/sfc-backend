# Contributing

All code you commit and submit by pull-request should follow these simple guidelines.

## Branching

When creating a branch for your work, always use [git flow](https://nvie.com/posts/a-successful-git-branching-model/) convention.

Our flavoured flow, comprehend following prefixes:

- `feat/` - everything that is not a bug should be created with this prefix;
- `bug/` - from the git flow point of view, this is just another way to call feat/. It's helpful to have such a differentiation to prioritize reviews better.
- `hotfix/` - for bugs that should be solved, reviewed and merged as soon as possible.
- `release/` - needed to prepare the release.

## Commit messages

Simply follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

## Pull requests

1. Open the pull request giving a title following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Keep the title short (~50 characters). Always try to give a scope to the title.

Following this convention will help up create sleek changelogs.

2. Try to fill the pull request template as closely as possible. Provide a short description that answers these questions:

- "how this pull request will change the code?"
- "what is the purpose of these changes?"

Take the opporutnity to reflect on your learnings and share them with the team.

3. For any task, try to provide a way to test its results; it would greatly help the Q&A process.

4. Assign the pull request to yourself and request your peer review it.

5. Upon approval, you are in charge of merging the code back. It's crucial to own the code we create and ensure it reaches each stage, from development to production. If you wish your code is merged upon approval, please, specify it in the Pull Request description.

6. Upon merge (ndr. squash and merge), remember to delete the merged working branch; let's keep a clean repository.
