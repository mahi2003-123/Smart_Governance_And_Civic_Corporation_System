import os
import pandas as pd
import json
import glob

def run_inspection():
    csv_files = glob.glob('*.csv')
    report = {}
    
    for f in csv_files:
        if 'dictionary' in f: continue
        size = os.path.getsize(f)
        try:
            df = pd.read_csv(f, engine='python', on_bad_lines='skip')
            text_cols = [c for c in df.columns if any(x in c.lower() for x in ['text','desc','msg','complaint','detail'])]
            cat_cols = [c for c in df.columns if any(x in c.lower() for x in ['cat','lbl','type','class'])]
            
            report[f] = {
                'size_bytes': size,
                'rows': len(df),
                'columns': df.columns.tolist(),
                'text_cols': text_cols,
                'cat_cols': cat_cols
            }
            if text_cols:
                report[f]['text_sample'] = df[text_cols[0]].dropna().head(3).tolist()
            if cat_cols:
                report[f]['cat_dist'] = df[cat_cols[0]].value_counts().to_dict()
                
            report[f]['duplicate_count'] = int(df.duplicated().sum())
            if text_cols and cat_cols:
                report[f]['text_duplicate_count'] = int(df.duplicated(subset=[text_cols[0]]).sum())
            
        except Exception as e:
            report[f] = {'error': str(e)}

    # also check sgcs
    try:
        sf = '../ai_service/dataset.csv'
        df = pd.read_csv(sf)
        report['sgcs'] = {
            'rows': len(df),
            'columns': df.columns.tolist(),
            'cat_dist': df['category'].value_counts().to_dict()
        }
    except Exception as e:
        report['sgcs'] = str(e)
        
    with open('inspection_report.json', 'w') as out:
        json.dump(report, out, indent=2)

run_inspection()
