import re
def norm(t):
    """Ajustes de pronunciación solo para la voz (no cambian el texto en pantalla).
    Chatterbox lee la 'y' y la 'll' antes de vocal como 'ch'; se reemplazan por 'i'."""
    t = re.sub(r'(?i)ll(?=[aeiouáéíóú])', lambda m: 'I' if m.group(0)[0].isupper() else 'i', t)
    t = re.sub(r'(?i)y(?=[aeiouáéíóú])', lambda m: 'I' if m.group(0).isupper() else 'i', t)
    return t
if __name__ == "__main__":
    for s in ["Ábrelo y ayúdala a responder:", "Yo llamo al desayuno, y es así."]: print(s, "→", norm(s))
