import re

try:
    with open('test_out.txt', 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()
except UnicodeDecodeError:
    with open('test_out.txt', 'r', encoding='utf-16le') as f:
        lines = f.read().splitlines()

errors = []
for i, line in enumerate(lines):
    if "[ERROR]" in line or "Failures:" in line or "Exception" in line or "failed" in line.lower() or "Cannot find" in line or "NoClassDefFoundError" in line:
        errors.append(line)

with open("parsed_errors.json", "w") as f:
    for e in errors[-50:]:
        f.write(e + "\n")
