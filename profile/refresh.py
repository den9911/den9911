"""Refresh allowlisted public repositories. Standard library; no visitor API token."""
from pathlib import Path
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import json, os, re, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['caption-club', 'majority-vote', 'meme-arena', 'memory-sketch',
         'excuse-bureau', 'crowd-decides', 'pixel-rooms', 'daily-minute', 'odd-finds',
         'gather-bot', 'traceboard', 'relay-room', 'pocket-index', 'forge-queue', 'den9911']


def get(endpoint):
    headers = {'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'den9911-profile'}
    token = os.environ.get('GITHUB_TOKEN')
    if token:
        headers['Authorization'] = 'Bearer ' + token
    with urlopen(Request('https://api.github.com/repos/den9911/' + endpoint, headers=headers), timeout=30) as response:
        return json.load(response), response.headers.get('Link', '')


def history_total(first_page, link):
    match = re.search(r'<([^>]+)>; rel="last"', link)
    if match:
        from urllib.parse import urlparse, parse_qs
        return int(parse_qs(urlparse(match[1]).query)['page'][0])
    return len(first_page)


def refresh():
    now = datetime.now(timezone.utc)
    start = now.date() - timedelta(days=89)
    data = {'schema': 2, 'as_of': now.date().isoformat(), 'updated_at': now.isoformat(timespec='seconds'), 'window_days': 90, 'repositories': {}}
    for name in NAMES:
        metadata, _ = get(name)
        if metadata.get('private') or metadata.get('full_name') != 'den9911/' + name:
            raise RuntimeError('Refusing non-public or unexpected repository ' + name)
        branch = metadata['default_branch']
        head, _ = get(name + '/commits/' + branch)
        tree, _ = get(name + '/git/trees/' + head['commit']['tree']['sha'] + '?recursive=1')
        if tree.get('truncated'):
            raise RuntimeError('Incomplete tree ' + name)
        commits, seen, page = [], set(), 1
        while True:
            batch, _ = get(name + '/commits?' + urlencode({'sha': head['sha'], 'since': start.isoformat() + 'T00:00:00Z', 'until': now.isoformat(), 'per_page': 100, 'page': page}))
            for c in batch:
                if c['sha'] not in seen:
                    seen.add(c['sha'])
                    commits.append({'sha': c['sha'], 'date': c['commit']['committer']['date']})
            if len(batch) < 100:
                break
            page += 1
        first, link = get(name + '/commits?' + urlencode({'sha': head['sha'], 'per_page': 1}))
        data['repositories'][name] = {
            'head': head['sha'], 'branch': branch, 'total_commits': history_total(first, link),
            'files': [{'path': f['path'], 'size': f['size']} for f in tree['tree'] if f['type'] == 'blob'],
            'commits': commits}
    # Fetch the complete snapshot first: an API error leaves the last good snapshot intact.
    path = ROOT / 'profile/data.json'
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, indent=2) + '\n')
    temporary.replace(path)
    subprocess.run([sys.executable, str(ROOT / 'profile/render.py')], check=True)


if __name__ == '__main__':
    refresh()
