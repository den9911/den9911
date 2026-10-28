"""Fetch public repository metadata from GitHub; never fetch private repositories."""
from pathlib import Path
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import json, os, subprocess, sys

ROOT=Path(__file__).resolve().parents[1]
NAMES=['caption-club','majority-vote','meme-arena','memory-sketch','excuse-bureau','crowd-decides','pixel-rooms','daily-minute','odd-finds']
def get(endpoint):
    headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'den9911-profile'}
    token=os.environ.get('GITHUB_TOKEN')
    if token:headers['Authorization']='Bearer '+token
    with urlopen(Request('https://api.github.com/repos/den9911/'+endpoint,headers=headers),timeout=30) as response:return json.load(response)

today=datetime.now(timezone.utc).date();start=today-timedelta(days=13)
data={'as_of':today.isoformat(),'repositories':{}}
for name in NAMES:
    metadata=get(name)
    if metadata.get('private'):raise RuntimeError('Refusing private repository '+name)
    tree=get(name+'/git/trees/'+metadata['default_branch']+'?recursive=1')
    if tree.get('truncated'):raise RuntimeError('Incomplete tree '+name)
    commits=[];page=1
    while True:
        batch=get(name+'/commits?'+urlencode({'since':start.isoformat()+'T00:00:00Z','until':today.isoformat()+'T23:59:59Z','per_page':100,'page':page}))
        commits.extend({'sha':c['sha'],'date':c['commit']['committer']['date']} for c in batch)
        if len(batch)<100:break
        page+=1
    data['repositories'][name]={'files':[{'path':f['path'],'size':f['size']} for f in tree['tree'] if f['type']=='blob'],'commits':commits}
path=ROOT/'profile/data.json';path.write_text(json.dumps(data,indent=2)+'\n')
subprocess.run([sys.executable,str(ROOT/'profile/render.py')],check=True)
