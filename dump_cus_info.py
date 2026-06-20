import json
import re

html_path = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\img\Diagrama de Secuencia.html"

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Locate CUS array
start_idx = content.find("const CUS = [")
if start_idx == -1:
    print("Not found")
    exit()

# Extract from const CUS = [ to the end of script
script_end = content.find("</script>", start_idx)
js_code = content[start_idx:script_end]

# Let's search for "id:", "name:", "msgs:"
cus_blocks = []
# Find lines with id: "CU-XX"
for match in re.finditer(r'id:\s*"CU-(\d+)"', js_code):
    # Find matching closing block
    start_pos = match.start()
    # Simple search for the block contents
    # We find where it says name: "..."
    # and we can search for SQL or database queries inside the msgs of this block
    # Let's print out the first 500 chars of each block or look for database/SQL operations
    block_end = js_code.find('},', start_pos)
    if block_end == -1:
        block_end = start_pos + 1000
    block_text = js_code[start_pos:block_end]
    
    cu_id = f"CU-{match.group(1)}"
    name_match = re.search(r'name:\s*"(.*?)"', block_text)
    cu_name = name_match.group(1) if name_match else ""
    
    # Check for SQL or db operations in the msgs array
    # e.g. Controller -> DB: SELECT * ...
    db_ops = []
    msg_matches = re.finditer(r'from:\s*"(.*?)",\s*to:\s*"(.*?)",\s*text:\s*"(.*?)"', js_code[start_pos:start_pos+5000]) # search larger block
    
    # We want to trace messages where the recipient is "DB" or "Base de Datos" or "Database" or similar
    # Let's print some info
    cus_blocks.append((cu_id, cu_name))

print(f"Total CUS found in JS: {len(cus_blocks)}")
for cu_id, cu_name in cus_blocks[:10]:
    print(f"- {cu_id}: {cu_name}")
