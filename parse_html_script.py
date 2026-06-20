with open(r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\img\Diagrama de Secuencia.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Let's search for script tags and key lines
for idx, line in enumerate(lines):
    if "<script>" in line or "<script " in line:
        print(f"Script tag at line {idx+1}")
    if "const " in line or "let " in line or "var " in line:
        if "CUS" in line or "cus" in line or "diagram" in line:
            print(f"Var decl at line {idx+1}: {line.strip()[:100]}")
