"""Lee curso.json (raíz del repositorio): nombre del curso y datos de cada módulo para los compiladores."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent

def curso():
    p = ROOT / "curso.json"
    d = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    d.setdefault("nombre", "Nombre del curso")
    d.setdefault("nombre_corto", d["nombre"].upper())
    d.setdefault("modulos", {})
    return d

NOMBRE = curso()["nombre"]
