import re

html_path = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\img\Diagrama de Secuencia.html"

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for the script block containing the CUS data
match = re.search(r'const CUS\s*=\s*\{', content)
if match:
    start_pos = match.start()
    # Let's print some lines after start_pos to see how CUS are defined
    print("Found CUS definition!")
    # Let's extract the CUS block using brace counting
    brace_count = 1
    i = content.find('{', start_pos) + 1
    while brace_count > 0 and i < len(content):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
        i += 1
    cus_block = content[start_pos:i]
    print(f"Length of CUS block: {len(cus_block)} characters.")
    
    # Find all SQL queries in the js code
    queries = re.findall(r'SELECT.*?;|INSERT.*?;|UPDATE.*?;|DELETE.*?;', cus_block, re.IGNORECASE)
    print(f"Found {len(queries)} SQL-like statements in CUS block:")
    for idx, q in enumerate(queries[:30]):
        print(f"{idx+1}: {q}")
else:
    print("CUS definition not found.")
