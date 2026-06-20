import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\img\Diagrama de Secuencia.html", "r", encoding="utf-8") as f:
    content = f.read()

start_idx = content.find("const CUS = [")
script_end = content.find("</script>", start_idx)
js_code = content[start_idx:script_end]

cu02_start = js_code.find('id:"CU-02"')
print(js_code[:cu02_start])
