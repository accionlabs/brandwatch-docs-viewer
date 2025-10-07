#!/usr/bin/env python3
import json
import os
from pathlib import Path

def merge_citations_to_source_documents(file_path):
    """Merge citations into source_documents, putting citations first"""

    with open(file_path, 'r') as f:
        data = json.load(f)

    # Track if any changes were made
    changes_made = False

    # Handle different JSON structures
    flows = []
    if 'user_flows' in data:
        flows = data['user_flows']
    elif 'flows' in data:
        flows = data['flows']
    elif isinstance(data, list):
        flows = data
    else:
        # Check for nested structure
        for key in data.keys():
            if 'user_flows' in data[key]:
                flows = data[key]['user_flows']
                break
            elif 'flows' in data[key]:
                flows = data[key]['flows']
                break

    # Process each flow
    for flow in flows:
        # Get existing source_documents and citations
        source_docs = flow.get('source_documents', [])
        citations = flow.get('citations', [])

        # If there are citations, merge them
        if citations:
            # Create merged list: citations first, then source_documents
            # Remove duplicates while preserving order
            merged = []
            seen = set()

            # Add citations first (they're more accurate)
            for doc in citations:
                if doc not in seen:
                    merged.append(doc)
                    seen.add(doc)

            # Then add source_documents that aren't already in citations
            for doc in source_docs:
                if doc not in seen:
                    merged.append(doc)
                    seen.add(doc)

            # Update source_documents with merged list
            flow['source_documents'] = merged

            # Remove citations field since we've merged it
            if 'citations' in flow:
                del flow['citations']
                changes_made = True

        # Process steps if they exist (for some flows that have step-level citations)
        if 'steps' in flow:
            for step in flow['steps']:
                if isinstance(step, dict) and 'citations' in step:
                    step_citations = step.get('citations', [])
                    step_source_docs = step.get('source_documents', [])

                    if step_citations:
                        # Merge step-level citations
                        step_merged = []
                        step_seen = set()

                        # Citations first
                        for doc in step_citations:
                            if doc not in step_seen:
                                step_merged.append(doc)
                                step_seen.add(doc)

                        # Then existing source_documents
                        for doc in step_source_docs:
                            if doc not in step_seen:
                                step_merged.append(doc)
                                step_seen.add(doc)

                        step['source_documents'] = step_merged
                        del step['citations']
                        changes_made = True

    # Save the updated file
    if changes_made:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    return False

def main():
    # Directory containing the data files
    data_dir = Path('/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer/public/data')

    # List of modules to process
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
        'reviews',
        'vizia'
    ]

    print("Merging citations into source_documents for all modules...")
    print("Citations will be placed first as they are more accurate.\n")

    for module in modules:
        file_name = f'{module}_user_flows_with_citations.json'
        file_path = data_dir / file_name

        if file_path.exists():
            print(f"Processing {module}...")
            if merge_citations_to_source_documents(file_path):
                print(f"  ✓ Updated {module} - citations merged into source_documents")
            else:
                print(f"  - No citations found in {module} or already merged")
        else:
            print(f"  ✗ File not found: {file_name}")

    print("\n✅ All modules processed successfully!")

if __name__ == "__main__":
    main()