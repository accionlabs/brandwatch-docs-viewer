#!/usr/bin/env python3
"""
Validate that all PDF references in JSON files point to existing PDF files.
This script checks that PDFs exist in the public/pdfs/[Module]/... structure.
"""

import json
import os
from pathlib import Path

def validate_pdf_references():
    # Base paths
    base_dir = Path('/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer')
    json_dir = base_dir / 'public' / 'data'
    pdf_base_dir = base_dir / 'public' / 'pdfs'

    # JSON files to check
    json_files = [
        'advertise_user_flows_with_citations.json',
        'audience_user_flows_with_citations.json',
        'benchmark_user_flows_with_citations.json',
        'brandwatch_reviews_user_flows_with_citations.json',
        'consumer_research_user_flows_with_citations.json',
        'engage_user_flows_with_citations.json',
        'influence_user_flows_with_citations.json',
        'listen_user_flows_with_citations.json',
        'measure_user_flows_with_citations.json',
        'publish_user_flows_with_citations.json',
        'vizia_user_flows_with_citations.json'
    ]

    all_valid = True
    total_refs = 0
    invalid_refs = []

    for json_file in json_files:
        json_path = json_dir / json_file
        if not json_path.exists():
            print(f"⚠️  JSON file not found: {json_file}")
            continue

        with open(json_path, 'r') as f:
            data = json.load(f)

        module_name = data.get('module', 'Unknown')
        print(f"\nChecking {module_name} module ({json_file})...")

        module_refs = 0
        module_invalid = []

        for flow in data.get('user_flows', []):
            for pdf_ref in flow.get('source_documents', []):
                module_refs += 1
                total_refs += 1

                # The PDF reference in JSON includes the module prefix
                # e.g., "Engage/Getting Started/Introduction to Engage.pdf"
                # This needs to be checked at public/pdfs/[full_path]
                pdf_full_path = pdf_base_dir / pdf_ref

                if not pdf_full_path.exists():
                    module_invalid.append(pdf_ref)
                    invalid_refs.append((module_name, pdf_ref))
                    all_valid = False

        if module_invalid:
            print(f"  ❌ Found {len(module_invalid)} invalid references:")
            for ref in module_invalid:
                print(f"     - {ref}")
                print(f"       Expected at: {pdf_base_dir / ref}")
        else:
            print(f"  ✅ All {module_refs} PDF references are valid")

    print(f"\n{'='*60}")
    print(f"SUMMARY:")
    print(f"Total PDF references checked: {total_refs}")

    if all_valid:
        print(f"✅ All PDF references are valid!")
    else:
        print(f"❌ Found {len(invalid_refs)} invalid PDF references")
        print(f"\nInvalid references by module:")

        # Group by module
        by_module = {}
        for module, ref in invalid_refs:
            if module not in by_module:
                by_module[module] = []
            by_module[module].append(ref)

        for module, refs in by_module.items():
            print(f"\n{module}: {len(refs)} invalid")
            for ref in refs[:3]:  # Show first 3
                print(f"  - {ref}")
            if len(refs) > 3:
                print(f"  ... and {len(refs) - 3} more")

    return all_valid

if __name__ == '__main__':
    validate_pdf_references()