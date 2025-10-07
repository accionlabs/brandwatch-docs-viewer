#!/usr/bin/env python3
import json
import re

def fix_engage_source_documents():
    """Remove 'Source: ' prefix from PDF references in Engage flows"""

    file_path = '/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer/public/data/engage_user_flows_with_citations.json'

    with open(file_path, 'r') as f:
        data = json.load(f)

    changes_made = 0

    # Process each flow - handle nested structure
    flows = []
    if 'brandwatch_engage_user_flows' in data:
        flows = data['brandwatch_engage_user_flows'].get('user_flows', [])
    elif 'user_flows' in data:
        flows = data.get('user_flows', [])
    elif 'flows' in data:
        flows = data.get('flows', [])
    else:
        flows = data if isinstance(data, list) else []

    for flow in flows:
        # Fix source_documents
        if 'source_documents' in flow:
            new_docs = []
            for doc in flow['source_documents']:
                # Remove "Source: " prefix if present
                if doc.startswith('Source: '):
                    clean_doc = doc.replace('Source: ', '')
                    new_docs.append(clean_doc)
                    changes_made += 1
                    print(f"Fixed: {doc} -> {clean_doc}")
                else:
                    new_docs.append(doc)
            flow['source_documents'] = new_docs

        # Also check for steps with source_documents
        if 'steps' in flow:
            for step in flow['steps']:
                if isinstance(step, dict) and 'source_documents' in step:
                    new_docs = []
                    for doc in step['source_documents']:
                        if doc.startswith('Source: '):
                            clean_doc = doc.replace('Source: ', '')
                            new_docs.append(clean_doc)
                            changes_made += 1
                            print(f"Fixed in step: {doc} -> {clean_doc}")
                        else:
                            new_docs.append(doc)
                    step['source_documents'] = new_docs

    # Save the fixed file
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ Fixed {changes_made} PDF references in Engage flows")
    print(f"Updated file: {file_path}")

    return changes_made

if __name__ == "__main__":
    fix_engage_source_documents()