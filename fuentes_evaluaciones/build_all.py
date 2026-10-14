#!/usr/bin/env python3
"""Reconstruye todos los entregables de actividades y evaluaciones con el motor actual.
Lee de cada paquete existente en entregables/ el título, el id SCORM y el código del caso, y vuelve a construirlo desde su fuente."""
import glob,os,re,subprocess,zipfile,shutil
R=os.path.dirname(os.path.abspath(__file__));B=os.path.join(R,'..','.claude','skills','leccion-interactiva-scorm','scripts')
for z in sorted(glob.glob(os.path.join(R,'..','entregables','*','*_SCORM12.zip'))):
  zf=zipfile.ZipFile(z);man=zf.read('imsmanifest.xml').decode();idx=zf.read('index.html').decode()
  sid=re.search(r'<manifest identifier="([^"]+)"',man).group(1);title=re.search(r'<organization[^>]*><title>([^<]+)</title>',man).group(1)
  cod=re.search(r"codigo:\s*'([^']+)'",idx).group(1);m=re.match(r'(M\d|EF)_(AP\d|LAB|CI)',cod)
  mod='final' if m.group(1)=='EF' else m.group(1).lower();src={'LAB':'lab','CI':'lab'}.get(m.group(2),m.group(2).lower())
  src=os.path.join(R,mod,src+'.html');name=os.path.basename(z)[:-len('_SCORM12.zip')];out=os.path.dirname(z)
  subprocess.run(['python3',os.path.join(B,'build.py'),'caso',src,'--title',title,'--id',sid,'--name',name,'--out',out],check=True)
  a=os.path.join(out,name+'.artifact.html')
  if os.path.exists(a):os.remove(a)
