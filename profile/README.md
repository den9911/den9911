# Profile visuals and public activity

The introduction and technology map describe the owner's focus; no proficiency scores are assigned.

The **Refresh profile visuals** workflow refreshes the snapshot every six hours (00:23, 06:23, 12:23 and 18:23 UTC), on changes to its source, or manually through Actions. Scheduling can be delayed by GitHub; a last-updated timestamp is always visible. Scheduled workflows in public repositories may be disabled after prolonged repository inactivity; check Actions if the timestamp stops moving.

The allowlist in `refresh.py` covers 14 applications plus `den9911`. Private repositories, including `plan`, are never included. Each public repository is checked before collecting its default-branch tree and history. Pagination is followed; all-time totals count commits reachable from that branch, not all branches. The activity window stores the latest 90 UTC calendar days, with the current day partial.

Counts include repository commits by all authors and automation, including chart refresh commits. They are not GitHub personal contributions, unique cross-repository commits, hours worked, or a skill score. Rewritten history can change totals. A new commit in another repository appears on the next successful refresh, not instantaneously.

The source composition uses file bytes by extension under `src/`, `server/`, `public/`, `web/`, `docs/` and `profile/`. Generated locale trees and known generated JavaScript in TypeScript application projects are excluded, as are portfolio asset copies and activity data. It is not GitHub Linguist output. The profile's Python generator is included; this does not measure expertise.

- `profile/data.json`: full public snapshot with source sizes.
- `assets/profile/activity-*.svg`: EN/RU, light/dark charts, 30-day activity and all-time totals.
- `docs/activity.json`: compact public statistics, with no credentials.
- `docs/activity.js`: interactive 14/30/90-day and repository filters; daily values are also available in an accessible table.

The interactive page fetches the compact snapshot directly from the public raw repository, with a bundled fallback if unavailable. This matters because commits made using `GITHUB_TOKEN` do not trigger another GitHub Pages build. The fallback can be older; the displayed timestamp reports the data actually loaded and flags snapshots older than 24 hours. A reload button retries the snapshot; it does not start an Actions run. No GitHub API token is sent to a visitor. No trackers or third-party statistics image services are used.

```sh
python3 profile/render.py                    # offline regeneration
python3 -m unittest discover -s profile/tests
node --test profile/tests/activity.test.mjs
python3 profile/refresh.py                   # fetch all data, then render
```

`GITHUB_TOKEN` is optional locally but recommended to avoid public API rate limits. Actions uses its built-in token and requires contents write permission to commit the resulting files. API failure aborts collection before replacing the last snapshot; a failed rendering does not get committed by the workflow. Existing charts remain visible if refresh fails. README image URLs include the snapshot version to help refresh GitHub's image cache, which can still introduce a delay.

GitHub references: [scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [GITHUB_TOKEN and Pages builds](https://docs.github.com/en/actions/concepts/security/github_token).
