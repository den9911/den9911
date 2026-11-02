"""Render local, theme-aware profile diagrams from the committed public-data snapshot."""
from pathlib import Path
from datetime import date, timedelta
from collections import Counter
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'profile'
OUT.mkdir(parents=True, exist_ok=True)
DATA = json.loads((ROOT / 'profile/data.json').read_text())
AS_OF = date.fromisoformat(DATA['as_of'])

def source_totals(data):
    counts = Counter()
    extensions = {'.js':'JavaScript','.mjs':'JavaScript','.ts':'TypeScript','.mts':'TypeScript','.css':'CSS','.html':'HTML','.rs':'Rust','.py':'Python'}
    for repo in data['repositories'].values():
        paths = {f['path'] for f in repo['files']}
        generated = {'public/shared/preferences.js','public/shared/preferences-model.js','server/validation.mjs'} if 'src/contracts.ts' in paths else set()
        for f in repo['files']:
            p=f['path']
            if not p.startswith(('src/','server/','public/','web/','docs/','profile/')) or '/locales/' in p or p in generated or p.startswith(('docs/assets/','docs/activity')) or p.endswith('.test.mjs'): continue
            language = extensions.get(Path(p).suffix)
            if language: counts[language] += f['size']
    return counts

COUNTS = source_totals(DATA)
DAYS = [AS_OF-timedelta(days=n) for n in range(29,-1,-1)]
ACTIVITY=Counter(c['date'][:10] for r in DATA['repositories'].values() for c in r['commits'])

for dark in (False,True):
    theme='dark' if dark else 'light'
    bg,card,ink,muted,line,accent = ('#111b22','#1a2933','#edf2ef','#b2c4ce','#364b58','#ffb38d') if dark else ('#f6f4ee','#fffefa','#203b3b','#536b70','#ccd6d2','#a84324')
    def text(x,y,value,size=18,fill=None,weight=400,family='Arial, sans-serif'):
        return f'<text x="{x}" y="{y}" fill="{fill or ink}" font-family="{family}" font-size="{size}" font-weight="{weight}">{escape(str(value))}</text>'
    def box(x,y,w,h,fill=card,stroke=line,r=16):
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>'
    def svg(name,lang,height,body,title,description):
        value=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc>{box(1,1,1078,height-2,bg,line,20)}{body}</svg>\n'
        (OUT/f'{name}-{lang}-{theme}.svg').write_text(value)
    for lang in ('en','ru'):
        ru=lang=='ru'
        b=text(40,48,'DEN9911 / SOFTWARE ENGINEERING',15,muted,600,'monospace')
        b+=text(40,118,'Rust — в центре.' if ru else 'Rust at the core.',55,ink,700)
        b+=text(40,162,'Системы. Сервисы. Инструменты.' if ru else 'Systems. Services. Useful tools.',25,accent)
        b+=text(40,218,'Backend · Full-stack · AI & automation',18,muted)
        b+=f'<circle cx="905" cy="138" r="89" fill="{card}" stroke="{accent}" stroke-width="2"/><circle cx="905" cy="138" r="73" fill="none" stroke="{line}" stroke-dasharray="3 8"/>'
        b+=text(873,163,'R',78,accent,700)+text(851,256,'OWNERSHIP / ASYNC',11,muted,400,'monospace')
        svg('intro',lang,286,b,'den9911 — Rust','Rust, backend, full-stack development, AI tooling and automation.')
        groups=[
            ('01','RUST / '+('ОСНОВНОЙ ФОКУС' if ru else 'PRIMARY FOCUS'),['Rust · Tokio','Serde · teloxide']),
            ('02','WEB / FULL-STACK',['TypeScript · JavaScript','React · Next.js · Vue · Nuxt']),
            ('03','BACKEND / API',['Node.js · Express','REST · GraphQL · WebSockets']),
            ('04','DATA / '+('ХРАНЕНИЕ' if ru else 'STORAGE'),['PostgreSQL · Redis · SQLite','MongoDB · MySQL']),
            ('05','INFRA / '+('ЭКСПЛУАТАЦИЯ' if ru else 'OPERATIONS'),['Docker · Kubernetes · Terraform','Nginx · Prometheus · Grafana']),
            ('06','PYTHON / '+('АВТОМАТИЗАЦИЯ' if ru else 'AUTOMATION'),['Python · Flask · OpenCV','AI tooling · '+('интеграции' if ru else 'integrations')]),
        ]
        b=''
        for i,(n,heading,rows) in enumerate(groups):
            x=24+(i%2)*528;y=24+(i//2)*140
            b+=box(x,y,504,124,card,accent if i==0 else line,12)
            b+=text(x+20,y+33,n,15,accent,600,'monospace')+text(x+59,y+33,heading,15,accent if i==0 else muted,600)
            b+=text(x+20,y+71,rows[0],21,ink,600)+text(x+20,y+101,rows[1],18,muted)
        svg('stack',lang,444,b,'Рабочий стек' if ru else 'Working stack','; '.join(h+': '+', '.join(rows) for _,h,rows in groups))
        b=text(32,45,('ПУБЛИЧНЫЙ КОД / ' if ru else 'PUBLIC CODE / ')+str(len(DATA['repositories']))+(' РЕПОЗИТОРИЕВ' if ru else ' REPOSITORIES'),16,muted,600)
        b+=text(680,45,str(sum(r.get('total_commits',0) for r in DATA['repositories'].values()))+(' коммитов за всё время' if ru else ' all-time commits'),16,muted)
        b+=text(32,83,'Состав исходников' if ru else 'Source composition',25,ink,600)
        colors={'JavaScript':'#c39233','HTML':'#dc704a','CSS':'#5b8fcc','TypeScript':'#6a7bc8','Rust':'#b76548','Python':'#548b72'}
        total=sum(COUNTS.values())
        for i,(name,value) in enumerate(COUNTS.most_common()):
            y=120+i*40;pct=value/max(total,1)*100
            b+=text(32,y,name,18)+text(398,y,f'{pct:.1f}%',18,muted)
            b+=box(32,y+12,435,10,line,line,5)+box(32,y+12,435*value/max(total,1),10,colors[name],colors[name],5)
        b+=f'<path d="M520 72v280" stroke="{line}"/>'
        b+=text(558,83,'Коммиты за 30 дней' if ru else 'Commits over 30 days',25,ink,600)
        vals=[ACTIVITY[d.isoformat()] for d in DAYS];peak=max(vals+[1])
        for i,(d,v) in enumerate(zip(DAYS,vals)):
            x=558+i*15;h=170*v/peak;y=315-h
            b+=box(x,y,10,max(h,2),accent if v else line,accent if v else line,3)
            if v and v==peak:b+=text(x,y-10,v,12,ink)
            if i in (0,14,29):b+=text(x,340,d.strftime('%d.%m'),11,muted)
        b+=text(558,127,str(sum(vals)),30,accent,700)+text(620,123,('по ' if ru else 'across ')+str(len(DATA['repositories']))+(' репозиториям' if ru else ' repositories'),17,muted)
        b+=text(32,393,('Снимок: ' if ru else 'Snapshot: ')+DATA.get('updated_at',DATA['as_of']).replace('T',' ')[:19]+' UTC',13,muted)
        b+=text(32,418,'Объём файлов, не уровень навыка. Сгенерированные переводы исключены.' if ru else 'File bytes, not skill ratings. Generated translations are excluded.',13,muted)
        svg('activity',lang,460,b,'Публичные репозитории' if ru else 'Public repositories','Source file sizes by extension and repository commit counts; snapshot '+DATA['as_of'])

# Small same-shape public payload for the interactive Pages view (no file inventory).
public = {key: DATA[key] for key in ('schema', 'as_of', 'updated_at', 'window_days') if key in DATA}
public['repositories'] = {name: {key: repo[key] for key in ('branch', 'total_commits', 'commits') if key in repo} for name, repo in DATA['repositories'].items()}
(ROOT / 'docs/activity.json').write_text(json.dumps(public, indent=2)+'\n')

# Change the image URL when the data changes, so README image proxies can refresh.
import re
version = ''.join(c for c in DATA.get('updated_at', DATA['as_of']) if c.isdigit())
for name in ('README.md', 'README.ru.md'):
    path = ROOT / name
    content = path.read_text()
    content = re.sub(r'(assets/profile/activity-[a-z]+-(?:dark|light)\.svg)(?:\?v=[0-9]+)?', lambda m: m[1]+'?v='+version, content)
    path.write_text(content)
