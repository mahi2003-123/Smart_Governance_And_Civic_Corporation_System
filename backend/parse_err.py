import re

lines = open('test_out.txt', encoding='utf-16le').read().splitlines()
errors = []
for i, line in enumerate(lines):
    if "[ERROR]" in line or "Failures:" in line or "Exception" in line or "failed" in line.lower():
        errors.append(line)

with open("parsed_errors.json", "w") as f:
    for e in errors:
        f.write(e + "\n")
