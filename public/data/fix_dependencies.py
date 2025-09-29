#!/usr/bin/env python3
import json

def fix_listen_dependencies():
    """Fix Listen module dependencies to use actual flow IDs"""
    with open('listen_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Create mapping of actual IDs
    flow_ids = [flow.get('id', f'flow_{i+1:03d}') for i, flow in enumerate(flows)]

    # Define relationships using actual flow IDs
    relationships = {
        'flow_001': ['flow_002', 'flow_003', 'flow_004'],
        'flow_002': ['flow_001', 'flow_005', 'flow_006'],
        'flow_003': ['flow_001', 'flow_007'],
        'flow_004': ['flow_001', 'flow_008', 'flow_009'],
        'flow_005': ['flow_002', 'flow_001'],
        'flow_006': ['flow_002', 'flow_010'],
        'flow_007': ['flow_003', 'flow_001'],
        'flow_008': ['flow_004', 'flow_009'],
        'flow_009': ['flow_004', 'flow_008'],
        'flow_010': ['flow_006', 'flow_002'],
        'flow_011': ['flow_001'],
        'flow_012': ['flow_001'],
        'flow_013': ['flow_001'],
        'flow_014': ['flow_001'],
        'flow_015': ['flow_001']
    }

    # Update flows with correct related_flows
    for flow in flows:
        flow_id = flow.get('id', '')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['flow_001']

    with open('listen_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Listen: Fixed dependencies with correct flow IDs')

def check_and_fix_other_modules():
    """Check and fix other modules that might have similar issues"""

    modules_to_check = [
        ('measure', 'measure_user_flows_with_citations.json', 'brandwatch_measure_user_flows'),
        ('publish', 'publish_user_flows_with_citations.json', 'brandwatch_publish_user_flows'),
        ('consumer_research', 'consumer_research_user_flows_with_citations.json', None),
        ('advertise', 'advertise_user_flows_with_citations.json', None),
        ('audience', 'audience_user_flows_with_citations.json', None),
        ('benchmark', 'benchmark_user_flows_with_citations.json', None),
        ('reviews', 'reviews_user_flows_with_citations.json', None),
        ('vizia', 'vizia_user_flows_with_citations.json', None),
        ('influence', 'influence_user_flows_with_citations.json', None)
    ]

    for module, file, nested_key in modules_to_check:
        with open(file, 'r') as f:
            data = json.load(f)

        if nested_key:
            flows = data[nested_key].get('flows', data[nested_key].get('user_flows', []))
        else:
            flows = data.get('flows', data.get('user_flows', []))

        # Get actual flow IDs
        actual_ids = []
        for flow in flows:
            # Try different ID fields
            flow_id = flow.get('flow_id') or flow.get('id') or flow.get('flow_name', '').replace(' ', '_')
            actual_ids.append(flow_id)

        # Check if related_flows match actual IDs format
        needs_fix = False
        for flow in flows:
            if 'related_flows' in flow:
                for related_id in flow['related_flows']:
                    # If the related ID doesn't exist in actual IDs, we need to fix
                    if related_id not in actual_ids and not any(related_id.lower() == aid.lower() for aid in actual_ids):
                        needs_fix = True
                        break

        if needs_fix:
            print(f'⚠️  {module.upper()}: May need fixing - related_flows don\'t match actual IDs')
            print(f'    Actual IDs sample: {actual_ids[:3]}')
            if flows and 'related_flows' in flows[0]:
                print(f'    Related flows sample: {flows[0]["related_flows"][:3]}')
        else:
            print(f'✓ {module.upper()}: Dependencies look correct')

# Main execution
if __name__ == '__main__':
    print('Fixing flow dependencies...\n')

    # Fix Listen module
    fix_listen_dependencies()

    # Check other modules
    print('\nChecking other modules...')
    check_and_fix_other_modules()

    print('\n✅ Dependency check complete!')