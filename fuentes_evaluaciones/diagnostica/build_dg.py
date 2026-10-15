#!/usr/bin/env python3
"""Construye la evaluación diagnóstica: plantilla.html + dg.json -> out/<nombre>.html y _SCORM12.zip
Uso: python3 build_dg.py [carpeta_salida]"""
import json,os,sys,zipfile,shutil
here=os.path.dirname(os.path.abspath(__file__))
out=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(here,'out'))
name='Evaluacion_diagnostica_Legislacion_laboral'
D=json.load(open(os.environ.get('DG',os.path.join(here,'dg.json')),encoding='utf-8'))
for k,a in enumerate(D['AE']): a['ae']='RA%d'%(k+1)
tpl=open(os.path.join(here,'plantilla.html'),encoding='utf-8').read()
assert tpl.count('/*{{DG}}*/null')==1
html=tpl.replace('/*{{DG}}*/null',json.dumps(D,ensure_ascii=False).replace('</','<\\/'))
os.makedirs(os.path.join(out,'img'),exist_ok=True)
open(os.path.join(out,name+'.html'),'w',encoding='utf-8').write(html)
shutil.copy(os.path.join(here,'diag_reunion.jpg'),os.path.join(out,'img','diag_reunion.jpg'))
T='Evaluación diagnóstica — Legislación Laboral'
man=f'''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="LEGLAB_DIAGNOSTICO" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="ORG-LEGLAB_DIAGNOSTICO"><organization identifier="ORG-LEGLAB_DIAGNOSTICO"><title>{T}</title>
    <item identifier="ITEM-LEGLAB_DIAGNOSTICO" identifierref="RES-LEGLAB_DIAGNOSTICO" isvisible="true"><title>{T}</title><adlcp:masteryscore>0</adlcp:masteryscore></item></organization></organizations>
  <resources><resource identifier="RES-LEGLAB_DIAGNOSTICO" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="img/diag_reunion.jpg"/>
      <file href="index.html"/>
  </resource></resources>
</manifest>
'''
z=os.path.join(out,name+'_SCORM12.zip')
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as f:
    f.writestr('imsmanifest.xml',man);f.writestr('index.html',html);f.write(os.path.join(here,'diag_reunion.jpg'),'img/diag_reunion.jpg')
print('OK',os.path.join(out,name+'.html'),'·',z)
