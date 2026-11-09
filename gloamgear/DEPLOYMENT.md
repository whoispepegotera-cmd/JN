# Browser deployment
The independently hosted Site source lives in `/workspace/sites/gloamgear-reel`.
Its tracked `.openai/hosting.json` selects static output `dist/` and retains the native project ID.
The same committed source and built output must be pushed to that Site's source repository before
native version save/deploy. Credentials are ephemeral stdin-only and never tracked.
The deployment archive contains `.openai/hosting.json` and `dist/`, without credentials or Git data.
The original JN repository also retains a GitHub Pages workflow for its root Dominion game and
`/gloamgear/`; the Sites publication does not depend on the user running that workflow.
Players only open the hosted HTTPS URL. PWA installation is optional.
