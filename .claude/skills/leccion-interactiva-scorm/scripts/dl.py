import json,sys,re,subprocess,os,urllib.request
# uso: dl.py status.json carpeta_destino "key=session,key=session,..."
st=json.load(open(sys.argv[1]));out=sys.argv[2];os.makedirs(out,exist_ok=True)
mp=dict(x.split('=') for x in sys.argv[3].split(','))
inv={v:k for k,v in mp.items()}
done=0
for g in st.get('generations',[]):
    u=g.get('content_url') or ''
    m=re.search(r'content_generation/([^/]+)/',u)
    if g.get('status')!='completed' or not m or m.group(1) not in inv: continue
    k=inv[m.group(1)];dst=f'{out}/{k}.mp3'
    if os.path.exists(dst): done+=1;continue
    raw=f'{out}/_{k}.mp3';urllib.request.urlretrieve(u,raw)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-ac','1','-b:a','64k',dst],check=True);os.remove(raw);done+=1
print('descargados',done,'de',len(mp),'| faltan',[k for k in mp if not os.path.exists(f'{out}/{k}.mp3')])
