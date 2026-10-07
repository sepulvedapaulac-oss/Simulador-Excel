import re,sys,subprocess,os
d=sys.argv[1];src=open(f'{d}/src.html').read()
dur=lambda f:float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def rep(m):
    k=m.group(1);f=f'{d}/aud/{k}.mp3'
    if not os.path.exists(f):return m.group(0)
    s=round(dur(f));return f'data-audio="{k}" data-dur="{s//60}:{s%60:02d}"'
src2=re.sub(r'data-audio="([\w-]+)" data-dur="[^"]*"',rep,src)
tot=sum(dur(f'{d}/aud/video_{i}.mp3') for i in range(1,8) if os.path.exists(f'{d}/aud/video_{i}.mp3'))
print(d,'video total',round(tot),'s', 'cambios', sum(1 for a,b in zip(re.findall(r'data-dur="[^"]*"',src),re.findall(r'data-dur="[^"]*"',src2)) if a!=b))
open(f'{d}/src.html','w').write(src2)
