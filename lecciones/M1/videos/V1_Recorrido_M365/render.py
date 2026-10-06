#!/usr/bin/env python3
"""Video 1 · Recorrido por Microsoft 365 — renderiza MP4 1920x1080 con capturas oficiales,
acercamientos, recuadros destacados, subtítulos incrustados y narración (voz Ninoska).
uso: python3 render.py <carpeta_capturas> <carpeta_audios> <salida.mp4>"""
import sys, os, re, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from mutagen.mp3 import MP3

SEL, AUD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, FPS = 1920, 1080, 25
FONTS = '/usr/share/fonts/opentype/inter/'
F = lambda n, s: ImageFont.truetype(FONTS + n, s)
f_sub, f_tag, f_lbl, f_title, f_small = F('Inter-SemiBold.otf', 40), F('Inter-Bold.otf', 30), F('Inter-Bold.otf', 30), F('InterDisplay-Bold.otf', 92), F('Inter-Medium.otf', 28)
PETROL, TEAL, MINT, BG = (18, 59, 74), (15, 119, 128), (143, 228, 223), (232, 239, 241)

# (imagen, etiqueta, narración, cámara inicio, cámara fin, [(caja, texto, desde_fracción)])
# cámara = (cx, cy, ancho) en píxeles de la captura; alto = ancho * 9/16
S = [
 ('s01_apps', 'Microsoft 365', 'Bienvenida a este recorrido por Microsoft 365. Con una sola cuenta del negocio accedes a Outlook, OneDrive, Word, Excel, PowerPoint y Teams. Veamos para qué sirve cada una en una pyme como la de María.',
  (800, 450, 1600), (800, 450, 1380), []),
 ('s02_outlook', 'Outlook · Correo', 'Outlook es el correo del negocio. A la izquierda están las carpetas, al centro la bandeja de entrada y a la derecha el mensaje abierto. Úsalo para las comunicaciones formales con clientes y proveedores, porque deja registro de lo acordado.',
  (800, 330, 1150), (800, 330, 980), [((368, 150, 522, 430), 'Carpetas', .12), ((527, 150, 760, 405), 'Bandeja de entrada', .27), ((777, 150, 1256, 590), 'Mensaje abierto', .42)]),
 ('s03_outlook_devices', 'Outlook · Computador y celular', 'El mismo correo está disponible en el computador y en el celular. Si alguien del equipo no está, la información sigue en la cuenta del negocio y no en un teléfono personal.',
  (680, 560, 1300), (900, 600, 1050), [((230, 220, 1150, 730), 'En el computador', .05), ((1035, 370, 1300, 900), 'En el celular', .35)]),
 ('s04_calendar', 'Outlook · Calendario', 'En el calendario de Outlook agendas entregas y reuniones. Con el botón Nuevo evento invitas a tu equipo, y todos ven quién hace qué y cuándo.',
  (500, 300, 1000), (430, 330, 920), [((36, 80, 152, 112), 'Nuevo evento', .3), ((218, 150, 555, 590), 'Reuniones y entregas', .55)]),
 ('s05_onedrive', 'OneDrive · Archivos en la nube', 'OneDrive guarda los archivos del negocio en la nube. Organízalos en pocas carpetas principales, con nombres claros, para encontrar siempre la versión vigente desde cualquier equipo.',
  (800, 380, 1450), (795, 285, 560), [((650, 315, 1005, 415), 'Carpetas del negocio', .4)]),
 ('s06_onedrive_backup', 'OneDrive · Respaldo', 'Además, OneDrive puede respaldar automáticamente carpetas importantes del computador, como el Escritorio y Documentos. Si un equipo falla, los archivos siguen disponibles.',
  (800, 520, 1500), (800, 450, 1050), [((540, 190, 1060, 310), 'Respaldo automático', .2)]),
 ('s07_excel', 'Excel · Planillas compartidas', 'En Excel para la web, varias personas pueden trabajar al mismo tiempo sobre la misma planilla, por ejemplo, la de pedidos. Se acaban las copias que viajan por correo.',
  (820, 350, 1150), (820, 330, 980), [((995, 125, 1085, 165), 'Personas editando', .15), ((300, 215, 1150, 640), 'Una sola planilla para todos', .5)]),
 ('s08_word', 'Word · Documentos', 'Word sirve para redactar procedimientos, cotizaciones y otros documentos del negocio. Al guardarlos en OneDrive, quedan disponibles para quienes los necesitan.',
  (800, 420, 1250), (800, 400, 1150), [((248, 140, 1345, 190), 'Herramientas del documento', .12), ((1262, 150, 1345, 185), 'Compartir', .6)]),
 ('s09_comments', 'Comentarios y menciones', 'Con los comentarios y las menciones, el equipo puede sugerir cambios y avisar a una persona específica, sin modificar el texto original.',
  (800, 520, 1600), (1050, 470, 1150), [((900, 285, 1548, 620), 'Comentario con @mención', .2)]),
 ('s10_share', 'Compartir con permisos', 'Para compartir un archivo, usa el botón Compartir. Escribe el correo de la persona y elige el permiso según la tarea: ver o editar. Antes de enviar, revisa si el enlace es solo para personas específicas.',
  (800, 480, 1550), (1000, 480, 1100), [((650, 305, 1320, 398), 'Persona', .18), ((1322, 305, 1452, 398), 'Permiso: ver o editar', .42), ((992, 693, 1262, 760), 'Alcance del enlace', .7)]),
 ('s11_teams_chat', 'Teams · Chat', 'Teams reúne el chat del equipo, organizado por conversaciones y canales. Úsalo para la coordinación rápida del día a día.',
  (800, 343, 1220), (760, 343, 1120), [((60, 60, 432, 687), 'Conversaciones y canales', .15), ((440, 90, 1150, 687), 'Mensajes del equipo', .5)]),
 ('s12_teams_meeting', 'Teams · Reuniones', 'Y cuando hay que conversar y decidir, Teams permite hacer videollamadas, compartir la pantalla y chatear durante la reunión.',
  (800, 500, 1600), (800, 500, 1600), [((0, 152, 1242, 968), 'Videollamada', .1), ((206, 86, 266, 138), 'Compartir pantalla', .4), ((1246, 150, 1600, 968), 'Chat de la reunión', .62)]),
 ('s13_cierre', 'Microsoft 365', 'Recuerda: no se trata de usar todas las aplicaciones, sino de acordar para qué sirve cada una. Primero la necesidad, después la herramienta.',
  (800, 450, 1380), (800, 450, 1600), []),
]

def ease(t): return t * t * (3 - 2 * t)

def sentences(text, dur, start):
    parts = [p.strip() for p in re.split(r'(?<=[.:?!])\s+', text) if p.strip()]
    tot = sum(len(p) for p in parts); out, t = [], start
    for p in parts:
        d = dur * len(p) / tot; out.append((t, t + d, p)); t += d
    return out

def wrap(d, text, font, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) > maxw and cur: lines.append(cur); cur = w
        else: cur = t
    lines.append(cur); return lines

def frame(img, cam, boxes, tag, sub, title=None, note=None, alpha_hl=None):
    cx, cy, cw = cam; ch = cw * 9 / 16
    x0, y0 = cx - cw / 2, cy - ch / 2
    sx = W / cw
    # fondo + captura recortada (lo que queda fuera de la imagen se rellena)
    canvas = Image.new('RGB', (W, H), BG)
    bx0, by0 = max(0, x0), max(0, y0); bx1, by1 = min(img.width, x0 + cw), min(img.height, y0 + ch)
    crop = img.crop((int(bx0), int(by0), int(math.ceil(bx1)), int(math.ceil(by1))))
    crop = crop.resize((max(1, round((bx1 - bx0) * sx)), max(1, round((by1 - by0) * sx))), Image.BILINEAR)
    canvas.paste(crop, (round((bx0 - x0) * sx), round((by0 - y0) * sx)))
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    # recuadro destacado: oscurece el resto y marca la zona
    for (bx, label, a) in boxes:
        X0, Y0, X1, Y1 = [(bx[0] - x0) * sx, (bx[1] - y0) * sx, (bx[2] - x0) * sx, (bx[3] - y0) * sx]
        X0, Y0, X1, Y1 = X0 - 10, Y0 - 10, X1 + 10, Y1 + 10
        dim = Image.new('L', (W, H), int(110 * a)); ImageDraw.Draw(dim).rounded_rectangle((X0, Y0, X1, Y1), 18, fill=0)
        ov.paste((10, 30, 38, 255), (0, 0), dim)
        d.rounded_rectangle((X0, Y0, X1, Y1), 18, outline=MINT + (int(255 * a),), width=7)
        tw = d.textlength(label, font=f_lbl); lx = min(max(X0, 30), W - tw - 70); ly = Y0 - 62 if Y0 > 150 else Y1 + 14
        if ly + 52 > H - 170: ly = Y0 + 14
        d.rounded_rectangle((lx, ly, lx + tw + 40, ly + 52), 26, fill=TEAL + (int(255 * a),))
        d.text((lx + 20, ly + 9), label, font=f_lbl, fill=(255, 255, 255, int(255 * a)))
    # etiqueta de la aplicación
    if tag:
        tw = d.textlength(tag, font=f_tag)
        d.rounded_rectangle((40, 36, 40 + tw + 48, 96), 30, fill=PETROL + (235,))
        d.ellipse((60, 58, 76, 74), fill=MINT + (255,)); d.text((86, 47), tag, font=f_tag, fill=(255, 255, 255, 255))
    if title:
        t, a = title
        d.rectangle((0, 0, W, H), fill=PETROL + (int(205 * a),))
        y = 360
        for line in t:
            tw = d.textlength(line, font=f_title); d.text(((W - tw) / 2, y), line, font=f_title, fill=(255, 255, 255, int(255 * a))); y += 110
    if note:
        tw = d.textlength(note, font=f_small); d.text(((W - tw) / 2, H - 230), note, font=f_small, fill=(255, 255, 255, 230))
    # subtítulos
    if sub:
        lines = wrap(d, sub, f_sub, 1500); hh = 58 * len(lines) + 34
        d.rounded_rectangle(((W - 1600) / 2, H - 60 - hh, (W + 1600) / 2, H - 60), 20, fill=(8, 22, 28, 215))
        for k, l in enumerate(lines):
            tw = d.textlength(l, font=f_sub); d.text(((W - tw) / 2, H - 60 - hh + 17 + 58 * k), l, font=f_sub, fill=(255, 255, 255, 255))
    canvas = Image.alpha_composite(canvas.convert('RGBA'), ov).convert('RGB')
    return canvas

# ---------- línea de tiempo ----------
PAD_IN, PAD_OUT, XF = 0.5, 0.7, 0.5
srt, t0, plan = [], 0.0, []
for k, s in enumerate(S):
    a = os.path.join(AUD, 's%02d.mp3' % (k + 1)); dur = MP3(a).info.length
    total = PAD_IN + dur + PAD_OUT
    plan.append((s, a, dur, total, t0)); srt += sentences(s[2], dur, t0 + PAD_IN); t0 += total
TOTAL = t0
imgs = {s[0]: Image.open(os.path.join(SEL, (s[0] if s[0] != 's13_cierre' else 's01_apps') + '.png')).convert('RGB') for s in S}

def sub_at(t):
    for a, b, p in srt:
        if a <= t < b: return p
    return None

def render_at(t):
    k = max(i for i, p in enumerate(plan) if p[4] <= t + 1e-9)
    s, a, dur, total, st = plan[k]; lt = (t - st) / total
    e = ease(min(1, lt))
    cam = tuple(s[3][j] + (s[4][j] - s[3][j]) * e for j in range(3))
    boxes = []
    for (bx, label, fr) in s[5]:
        # cada recuadro aparece en su momento y se mantiene hasta que aparece el siguiente
        nxt = [f2 for (_, _, f2) in s[5] if f2 > fr]
        end = min(nxt) if nxt else 1.0
        if fr <= lt < end + 0.04:
            al = min(1, (lt - fr) * total / 0.4)
            if nxt and lt > end: al = max(0, 1 - (lt - end) * total / 0.4)
            boxes.append((bx, label, al))
    title = note = None
    if k == 0:
        al = 1 if lt < .3 else max(0, 1 - (lt - .3) * total / 0.8)
        title = (['Recorrido por', 'Microsoft 365'], al) if al > 0 else None
        note = 'Capturas oficiales de Microsoft · la interfaz puede variar según idioma y plan' if al > 0 else None
    if k == len(plan) - 1:
        al = min(1, max(0, (lt - .45) * total / 0.8))
        title = (['Primero la necesidad,', 'después la herramienta'], al) if al > 0 else None
    im = frame(imgs[s[0]], cam, boxes, s[1] if not title or title[1] < .5 else None, sub_at(t), title, note)
    return im

if os.environ.get('PREVIEW'):
    os.makedirs(os.environ['PREVIEW'], exist_ok=True)
    for k, p in enumerate(plan):
        for fr in (0.15, 0.55, 0.85):
            render_at(p[4] + p[3] * fr).save(os.path.join(os.environ['PREVIEW'], 'p%02d_%d.jpg' % (k + 1, int(fr * 100))), quality=80)
    sys.exit(0)

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', OUT + '.video.mp4'], stdin=subprocess.PIPE)
N = int(TOTAL * FPS); prev = None; prev_k = 0; freeze = None
for fi in range(N):
    t = fi / FPS
    k = max(i for i, p in enumerate(plan) if p[4] <= t + 1e-9)
    s, a, dur, total, st = plan[k]; lt = (t - st) / total
    e = ease(min(1, lt))
    cam = tuple(s[3][j] + (s[4][j] - s[3][j]) * e for j in range(3))
    boxes = []
    for (bx, label, fr) in s[5]:
        # cada recuadro aparece en su momento y se mantiene hasta que aparece el siguiente
        nxt = [f2 for (_, _, f2) in s[5] if f2 > fr]
        end = min(nxt) if nxt else 1.0
        if fr <= lt < end + 0.04:
            al = min(1, (lt - fr) * total / 0.4)
            if nxt and lt > end: al = max(0, 1 - (lt - end) * total / 0.4)
            boxes.append((bx, label, al))
    title = note = None
    if k == 0:
        al = 1 if lt < .3 else max(0, 1 - (lt - .3) * total / 0.8)
        title = (['Recorrido por', 'Microsoft 365'], al) if al > 0 else None
        note = 'Capturas oficiales de Microsoft · la interfaz puede variar según idioma y plan' if al > 0 else None
    if k == len(plan) - 1:
        al = min(1, max(0, (lt - .45) * total / 0.8))
        title = (['Primero la necesidad,', 'después la herramienta'], al) if al > 0 else None
    im = frame(imgs[s[0]], cam, boxes, s[1] if not title or title[1] < .5 else None, sub_at(t), title, note)
    # transición: fundido entre escenas
    if k != prev_k: freeze = prev; prev_k = k
    raw = im
    if k > 0 and freeze is not None and t - st < XF:
        im = Image.blend(freeze, im, (t - st) / XF)
    prev = raw
    ff.stdin.write(im.tobytes())
    if fi % 250 == 0: print(f'{fi}/{N}', flush=True)
ff.stdin.close(); ff.wait()

# ---------- audio: narraciones colocadas en su tiempo ----------
inputs, filt = [], []
for k, p in enumerate(plan):
    inputs += ['-i', p[1]]; ms = int((p[4] + PAD_IN) * 1000); filt.append(f'[{k}:a]adelay={ms}|{ms}[a{k}]')
mix = ''.join(f'[a{k}]' for k in range(len(plan)))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt) + f';{mix}amix=inputs={len(plan)}:normalize=0,apad[aout]',
                '-map', '[aout]', '-t', f'{TOTAL:.2f}', '-c:a', 'aac', '-b:a', '160k', OUT + '.audio.m4a'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', OUT + '.video.mp4', '-i', OUT + '.audio.m4a', '-c', 'copy', '-movflags', '+faststart', OUT], check=True)
os.remove(OUT + '.video.mp4'); os.remove(OUT + '.audio.m4a')

def ts(x):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
with open(os.path.splitext(OUT)[0] + '.srt', 'w', encoding='utf-8') as f:
    for i, (a, b, p) in enumerate(srt, 1): f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{p}\n\n')
print('listo', OUT, f'{TOTAL:.1f}s')
