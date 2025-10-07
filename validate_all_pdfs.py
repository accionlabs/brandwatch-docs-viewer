#!/usr/bin/env python3
import json
import os
from pathlib import Path
import sys

def validate_all_module_pdfs():
    """Validate all PDF references across all modules"""

    base_path = '/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer'
    public_pdfs_path = os.path.join(base_path, 'public', 'pdfs')

    # All module JSON files
    modules = [
        'advertise',
        'audience',
        'benchmark',
        'brandwatch_reviews',
        'consumer_research',
        'engage',
        'influence',
        'listen',
        'measure',
        'publish',
        'vizia'
    ]

    total_issues = 0
    total_refs = 0

    print("=" * 80)
    print("VALIDATING ALL MODULE PDF REFERENCES")
    print("=" * 80)

    for module_name in modules:
        json_file = os.path.join(base_path, 'public', 'data', f'{module_name}_user_flows_with_citations.json')

        if not os.path.exists(json_file):
            print(f"\n❌ Missing JSON file: {module_name}_user_flows_with_citations.json")
            continue

        print(f"\n📁 Module: {module_name.upper()}")
        print("-" * 40)

        with open(json_file, 'r') as f:
            data = json.load(f)

        # Extract flows based on module structure variations
        flows = []
        if f'brandwatch_{module_name}_user_flows' in data:
            flows = data[f'brandwatch_{module_name}_user_flows'].get('user_flows', [])
        elif 'user_flows' in data:
            flows = data.get('user_flows', [])
        elif 'flows' in data:
            flows = data.get('flows', [])
        elif isinstance(data, list):
            flows = data

        module_refs = 0
        module_issues = 0
        missing_pdfs = set()

        for flow in flows:
            # Check main source_documents
            if 'source_documents' in flow:
                for doc in flow['source_documents']:
                    module_refs += 1
                    total_refs += 1

                    # Clean any "Source: " prefix if present
                    clean_doc = doc.replace('Source: ', '') if doc.startswith('Source: ') else doc

                    # Construct full path
                    module_dir = get_module_dir_name(module_name)
                    full_path = os.path.join(public_pdfs_path, module_dir, clean_doc)

                    if not os.path.exists(full_path):
                        missing_pdfs.add(clean_doc)
                        module_issues += 1
                        total_issues += 1

            # Also check steps if they have source_documents
            if 'steps' in flow:
                for step in flow['steps']:
                    if isinstance(step, dict) and 'source_documents' in step:
                        for doc in step['source_documents']:
                            module_refs += 1
                            total_refs += 1

                            clean_doc = doc.replace('Source: ', '') if doc.startswith('Source: ') else doc
                            module_dir = get_module_dir_name(module_name)
                            full_path = os.path.join(public_pdfs_path, module_dir, clean_doc)

                            if not os.path.exists(full_path):
                                missing_pdfs.add(clean_doc)
                                module_issues += 1
                                total_issues += 1

        # Report module results
        if module_issues == 0:
            print(f"✅ All {module_refs} PDF references are valid")
        else:
            print(f"❌ Found {module_issues}/{module_refs} invalid PDF references:")
            for pdf in sorted(missing_pdfs):
                print(f"   • {pdf}")
                # Try to find similar files
                module_dir = get_module_dir_name(module_name)
                module_path = os.path.join(public_pdfs_path, module_dir)
                if os.path.exists(module_path):
                    similar = find_similar_pdfs(pdf, module_path)
                    if similar:
                        print(f"     Possible match: {similar}")

    print("\n" + "=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    print(f"Total PDF references checked: {total_refs}")
    print(f"Total issues found: {total_issues}")
    if total_issues == 0:
        print("✅ All PDF references are valid!")
    else:
        print(f"❌ {total_issues} PDF references need to be fixed")
        print("\nRun fix scripts for affected modules to resolve issues.")

    return total_issues

def get_module_dir_name(module_name):
    """Get the actual directory name for a module"""
    dir_mapping = {
        'advertise': 'Advertise',
        'audience': 'Audience',
        'benchmark': 'Benchmark',
        'brandwatch_reviews': 'Brandwatch Reviews',
        'consumer_research': 'Consumer Research',
        'engage': 'Engage',
        'influence': 'Influence',
        'listen': 'Listen',
        'measure': 'Measure',
        'publish': 'Publish',
        'vizia': 'VIZIA'
    }
    return dir_mapping.get(module_name, module_name)

def find_similar_pdfs(target_pdf, module_path):
    """Find similar PDF names in the module directory"""
    if not os.path.exists(module_path):
        return None

    target_name = os.path.basename(target_pdf).lower()
    target_parts = target_name.replace('.pdf', '').replace('_', ' ').replace('-', ' ').split()

    best_match = None
    best_score = 0

    for root, dirs, files in os.walk(module_path):
        for file in files:
            if file.endswith('.pdf'):
                file_lower = file.lower()
                file_parts = file_lower.replace('.pdf', '').replace('_', ' ').replace('-', ' ').split()

                # Count matching words
                matches = sum(1 for part in target_parts if part in file_parts)
                if matches > best_score:
                    best_score = matches
                    rel_path = os.path.relpath(os.path.join(root, file), module_path)
                    best_match = rel_path

    # Only return if we have a good match
    if best_score >= len(target_parts) * 0.5:
        return best_match
    return None

if __name__ == "__main__":
    issues = validate_all_module_pdfs()
    sys.exit(0 if issues == 0 else 1)