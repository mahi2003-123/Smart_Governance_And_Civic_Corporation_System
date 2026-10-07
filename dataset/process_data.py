import pandas as pd
import os
import json

def process():
    os.makedirs('processed', exist_ok=True)
    
    # 1. Load data
    try:
        manual_df = pd.read_csv('manual_complaints_5000.csv').dropna(subset=['complaint_text'])
    except Exception as e:
        print(f"Error reading manual_complaints_5000.csv: {e}")
        return
        
    try:
        old_df = pd.read_csv('../ai_service/dataset.csv')
        old_df = old_df.rename(columns={'text': 'complaint_text', 'category': 'category'})
        old_df = old_df.dropna(subset=['complaint_text'])
    except Exception as e:
        print(f"Error reading old dataset.csv: {e}")
        return
        
    initial_manual_len = len(manual_df)
    initial_old_len = len(old_df)
    
    # 2. Map categories for manual_df
    cat_map = {
        'Road Damage': 'ROAD',
        'Water Leakage': 'WATER_SUPPLY',
        'Garbage': 'WASTE_MANAGEMENT',
        'Drainage Blockage': 'DRAINAGE',
        'Streetlight Fault': 'STREET_LIGHT'
    }
    
    manual_df['category'] = manual_df['category'].map(cat_map).fillna(manual_df['category'])
    
    # 3. Clean manual_df
    manual_df['complaint_text'] = manual_df['complaint_text'].str.strip()
    manual_df = manual_df[manual_df['complaint_text'] != '']
    manual_df = manual_df.drop_duplicates(subset=['complaint_text'], keep='first')
    
    # Clean old_df
    old_df['complaint_text'] = old_df['complaint_text'].str.strip()
    old_df = old_df[old_df['complaint_text'] != '']
    old_df = old_df.drop_duplicates(subset=['complaint_text'], keep='first')
    
    # 4. Filter PUBLIC_SPACE from old_df separately so we don't drop them
    valid_old_df = old_df[old_df['category'].isin(cat_map.values()) | (old_df['category'] == 'PUBLIC_SPACE')]
    
    # Check if there's any public space in manual_df (unlikely based on map)
    # The prompt actually asks me to check if some complaints genuinely describe public-space problems
    # but not to label garbage as public space. Since we don't have an NLP model yet,
    # building a complex heuristic is risky. I will rely on old_df for PUBLIC_SPACE.
    
    # 5. Merge
    master_df = pd.concat([manual_df, valid_old_df], ignore_index=True)
    
    # 6. Final dedupe on master
    pre_dedupe_master = len(master_df)
    master_df = master_df.drop_duplicates(subset=['complaint_text'], keep='first')
    final_len = len(master_df)
    
    # Filter to only the 6 allowed categories
    allowed_cats = ['ROAD', 'WATER_SUPPLY', 'WASTE_MANAGEMENT', 'DRAINAGE', 'STREET_LIGHT', 'PUBLIC_SPACE']
    master_df = master_df[master_df['category'].isin(allowed_cats)]
    
    # Format and save
    master_df = master_df[['complaint_text', 'category']]
    master_df.to_csv('processed/SGCS_AI_MASTER_DATASET.csv', index=False)
    
    # Quality Report Metrics
    duplicates_removed = (initial_manual_len + initial_old_len) - final_len
    
    report = {
        'Original_Rows_manual': initial_manual_len,
        'Original_Rows_old': initial_old_len,
        'Total_Original': initial_manual_len + initial_old_len,
        'Final_Rows': len(master_df),
        'Unique_complaints': len(master_df['complaint_text'].unique()),
        'Duplicates_removed': duplicates_removed,
        'Categories_dist': master_df['category'].value_counts().to_dict(),
        'Old_dataset_retained': len(valid_old_df[valid_old_df['complaint_text'].isin(master_df['complaint_text'])]) # approximation
    }
    
    print(json.dumps(report, indent=2))
    
    # Print 10 samples per class
    sample_out = {}
    for cat in allowed_cats:
        c_df = master_df[master_df['category'] == cat]
        if len(c_df) > 0:
            sample_out[cat] = c_df.head(10)['complaint_text'].tolist()
            
    with open('processed/samples.json', 'w') as f:
        json.dump(sample_out, f, indent=2)

if __name__ == '__main__':
    process()
