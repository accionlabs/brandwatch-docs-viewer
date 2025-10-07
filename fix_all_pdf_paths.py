#!/usr/bin/env python3
import json
import os
import re

def fix_all_module_pdf_paths():
    """Fix PDF paths in all module JSON files by removing module prefix"""

    base_path = '/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer'

    # All module JSON files
    modules = [
        'advertise',
        'audience',
        'benchmark',
        'consumer_research',
        'engage',
        'influence',
        'listen',
        'measure',
        'publish',
        'vizia'
    ]

    total_fixes = 0

    print("=" * 80)
    print("FIXING PDF PATHS IN ALL MODULES")
    print("=" * 80)

    for module_name in modules:
        json_file = os.path.join(base_path, 'public', 'data', f'{module_name}_user_flows_with_citations.json')

        if not os.path.exists(json_file):
            print(f"\n❌ Skipping {module_name} - JSON file not found")
            continue

        print(f"\n📁 Processing {module_name.upper()}")
        print("-" * 40)

        with open(json_file, 'r') as f:
            data = json.load(f)

        module_fixes = 0

        # Process based on module structure variations
        if f'brandwatch_{module_name}_user_flows' in data:
            flows_key = f'brandwatch_{module_name}_user_flows'
            flows = data[flows_key].get('user_flows', [])
            process_flows(flows, module_name, module_fixes)
            data[flows_key]['user_flows'] = flows
        elif 'user_flows' in data:
            flows = data.get('user_flows', [])
            process_flows(flows, module_name, module_fixes)
            data['user_flows'] = flows
        elif 'flows' in data:
            flows = data.get('flows', [])
            process_flows(flows, module_name, module_fixes)
            data['flows'] = flows
        elif isinstance(data, list):
            flows = data
            process_flows(flows, module_name, module_fixes)
            data = flows

        # Count fixes
        for flow in flows:
            if 'source_documents' in flow:
                for i, doc in enumerate(flow['source_documents']):
                    fixed_doc = fix_pdf_path(doc, module_name)
                    if fixed_doc != doc:
                        flow['source_documents'][i] = fixed_doc
                        module_fixes += 1
                        print(f"   Fixed: {doc}")
                        print(f"      -> {fixed_doc}")

            if 'steps' in flow:
                for step in flow['steps']:
                    if isinstance(step, dict) and 'source_documents' in step:
                        for i, doc in enumerate(step['source_documents']):
                            fixed_doc = fix_pdf_path(doc, module_name)
                            if fixed_doc != doc:
                                step['source_documents'][i] = fixed_doc
                                module_fixes += 1
                                print(f"   Fixed in step: {doc}")
                                print(f"      -> {fixed_doc}")

        # Save the fixed file
        with open(json_file, 'w') as f:
            json.dump(data, f, indent=2)

        total_fixes += module_fixes
        print(f"✅ Fixed {module_fixes} PDF references in {module_name}")

    print("\n" + "=" * 80)
    print("FIX SUMMARY")
    print("=" * 80)
    print(f"Total PDF references fixed: {total_fixes}")
    print("✅ All modules have been processed!")

    return total_fixes

def process_flows(flows, module_name, module_fixes):
    """Process flows list in place"""
    # This function modifies flows in place
    pass

def fix_pdf_path(pdf_path, module_name):
    """Fix a PDF path by removing module prefix if present"""
    # Remove any "Source: " prefix first
    clean_path = pdf_path.replace('Source: ', '') if pdf_path.startswith('Source: ') else pdf_path

    # Module name variations to remove
    module_prefixes = [
        f"{module_name.replace('_', ' ').title()}/",
        f"{module_name.title()}/",
        "Advertise/",
        "Audience/",
        "Benchmark/",
        "Brandwatch Reviews/",
        "Consumer Research/",
        "Engage/",
        "Influence/",
        "Listen/",
        "Measure/",
        "Publish/",
        "VIZIA/",
        "Vizia/"
    ]

    # Remove module prefix if present at the start
    for prefix in module_prefixes:
        if clean_path.startswith(prefix):
            # Only remove if this is the module's own prefix
            module_dir = get_module_dir_name(module_name)
            if prefix.rstrip('/') == module_dir:
                clean_path = clean_path[len(prefix):]
                break

    return clean_path

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

if __name__ == "__main__":
    fix_all_module_pdf_paths()