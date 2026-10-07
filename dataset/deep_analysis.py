import pandas as pd
import json
import re

with open('deep_out.txt', 'w') as f:
    for fname in ['complaints_text.csv', 'manual_complaints_5000.csv']:
        f.write(f"\n==== {fname} ====\n")
        df = pd.read_csv(fname)
        
        text_col = 'complaint_text'
        texts = df[text_col].dropna().astype(str)
        
        f.write(f"Total Rows: {len(df)}\n")
        f.write(f"Nulls in text: {df[text_col].isnull().sum()}\n")
        f.write(f"Exact Duplicates (entire row): {df.duplicated().sum()}\n")
        f.write(f"Exact Duplicates (text only): {df.duplicated(subset=[text_col]).sum()}\n")
        
        lens = texts.apply(lambda x: len(x.split()))
        f.write(f"Short complaints (<3 words): {(lens < 3).sum()}\n")
        f.write(f"Long complaints (>50 words): {(lens > 50).sum()}\n")
        f.write(f"Avg words: {lens.mean():.2f}\n")
        
        nums_only = texts.apply(lambda x: bool(re.match(r'^\d+$', x.strip())))
        f.write(f"Numbers only: {nums_only.sum()}\n")
        
        urls = texts.apply(lambda x: 'http://' in x or 'https://' in x or 'www.' in x)
        f.write(f"URLs found: {urls.sum()}\n")
        
        html = texts.apply(lambda x: bool(re.search(r'<[^>]+>', x)))
        f.write(f"HTML tags found: {html.sum()}\n")
