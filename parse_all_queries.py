import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

html_path = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\img\Diagrama de Secuencia.html"

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("const CUS = [")
script_end = content.find("</script>", start_idx)
js_code = content[start_idx:script_end]

# Extract all blocks using brace counting
pos = js_code.find("[") + 1
cu_blocks = []
brace_count = 0
current_block_start = -1

for i in range(pos, len(js_code)):
    char = js_code[i]
    if char == '{':
        if brace_count == 0:
            current_block_start = i
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0 and current_block_start != -1:
            cu_blocks.append(js_code[current_block_start:i+1])
            current_block_start = -1

print(f"Total CUs parsed: {len(cu_blocks)}")

for block in cu_blocks:
    id_match = re.search(r'id:\s*"(.*?)"', block)
    name_match = re.search(r'name:\s*"(.*?)"', block)
    if not id_match:
        continue
    cu_id = id_match.group(1)
    cu_name = name_match.group(1) if name_match else ""
    
    # Parse parts to find database index
    # parts: [ ... ]
    parts_match = re.search(r'parts:\s*\[(.*?)\]', block, re.DOTALL)
    if not parts_match:
        continue
    parts_text = parts_match.group(1)
    # Find all objects in parts
    part_objs = re.findall(r'\{\s*name:\s*"(.*?)",\s*type:\s*"(.*?)"\s*\}', parts_text, re.DOTALL)
    
    db_indices = []
    for idx, (p_name, p_type) in enumerate(part_objs):
        if p_type == "database":
            db_indices.append(idx)
            
    if not db_indices:
        continue
        
    # Parse msgs: [ ... ]
    msgs_match = re.search(r'msgs:\s*\[(.*?)\]', block, re.DOTALL)
    if not msgs_match:
        continue
    msgs_text = msgs_match.group(1)
    # Find all objects in msgs
    # {f:0,t:1, label:"...", kind:"..."}
    # Note that f and t are integers
    msg_objs = re.findall(r'\{\s*f:\s*(\d+),\s*t:\s*(\d+),\s*label:\s*"(.*?)",\s*kind:\s*"(.*?)"\s*\}', msgs_text, re.DOTALL)
    
    db_queries = []
    for f, t, label, kind in msg_objs:
        t_int = int(t)
        if t_int in db_indices:
            db_queries.append(label.replace('\n', ' '))
            
    if db_queries:
        print(f"\n{cu_id}: {cu_name}")
        for q in db_queries:
            print(f"  - {q}")
