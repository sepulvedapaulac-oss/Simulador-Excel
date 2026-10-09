#!/bin/bash
# uso: getdl.sh l4X  -> descarga desde el último status guardado
F=$(ls -t /root/.claude/projects/-home-user-Simulador-Excel/34eec09f-4f41-5a86-8358-64d436371cfb/tool-results/mcp-ElevenLabs-creative_get_flow_run_status-*.txt | head -1)
cd /home/user/Simulador-Excel/fuentes_modulo4
python3 -c "import json;d=json.load(open('$F'));print('completo',d['all_completed'],'fallos',d['has_failures'])"
python3 ../.claude/skills/leccion-interactiva-scorm/scripts/dl.py $F $1/aud "$(cat $1/sessions.txt)"
