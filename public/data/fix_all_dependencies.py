#!/usr/bin/env python3
import json

def fix_all_module_dependencies():
    """Fix all modules to use their actual flow IDs in related_flows"""

    # Listen is already fixed, so skip it

    # Fix Measure
    print('Fixing MEASURE...')
    with open('measure_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['brandwatch_measure_user_flows']['flows']
    flow_ids = [flow.get('flow_id', '') for flow in flows]

    # Create relationships using actual IDs
    if len(flow_ids) >= 10:
        for i, flow in enumerate(flows):
            if i == 0:  # First flow
                flow['related_flows'] = [flow_ids[1], flow_ids[2], flow_ids[3]] if len(flow_ids) > 3 else flow_ids[1:4]
            elif i == len(flows) - 1:  # Last flow
                flow['related_flows'] = [flow_ids[0], flow_ids[i-1]]
            else:
                flow['related_flows'] = [flow_ids[0], flow_ids[i-1] if i > 0 else flow_ids[0], flow_ids[i+1] if i < len(flow_ids)-1 else flow_ids[0]]

    with open('measure_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Measure')

    # Fix Publish
    print('Fixing PUBLISH...')
    with open('publish_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['brandwatch_publish_user_flows']['flows']
    flow_ids = [flow.get('id', '') for flow in flows]

    for i, flow in enumerate(flows):
        if i == 0:
            flow['related_flows'] = flow_ids[1:3] if len(flow_ids) > 2 else flow_ids[1:]
        else:
            # Link to first flow and adjacent flows
            related = [flow_ids[0]]
            if i > 0 and i-1 < len(flow_ids):
                related.append(flow_ids[i-1])
            if i < len(flow_ids) - 1:
                related.append(flow_ids[i+1])
            flow['related_flows'] = related[:3]  # Keep max 3 relations

    with open('publish_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Publish')

    # Fix Consumer Research
    print('Fixing CONSUMER RESEARCH...')
    with open('consumer_research_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']
    flow_ids = [flow.get('flow_name', '').replace(' ', '_') for flow in flows]

    for i, flow in enumerate(flows):
        if i == 0:
            flow['related_flows'] = flow_ids[1:3] if len(flow_ids) > 2 else flow_ids[1:]
        else:
            flow['related_flows'] = [flow_ids[0]] + flow_ids[i+1:i+2] if i < len(flow_ids)-1 else [flow_ids[0]]

    with open('consumer_research_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Consumer Research')

    # Fix Advertise
    print('Fixing ADVERTISE...')
    with open('advertise_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']
    flow_ids = [flow.get('flow_name', '').replace(' ', '_').replace('/', '_') for flow in flows]

    for i, flow in enumerate(flows):
        if i == 0:
            flow['related_flows'] = flow_ids[1:3] if len(flow_ids) > 2 else flow_ids[1:]
        else:
            flow['related_flows'] = [flow_ids[0]] + flow_ids[i+1:i+2] if i < len(flow_ids)-1 else [flow_ids[0]]

    with open('advertise_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Advertise')

    # Fix Audience
    print('Fixing AUDIENCE...')
    with open('audience_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']
    flow_ids = [flow.get('flow_name', '').replace(' ', '_') for flow in flows]

    for i, flow in enumerate(flows):
        if i == 0:
            flow['related_flows'] = flow_ids[1:3] if len(flow_ids) > 2 else flow_ids[1:]
        else:
            flow['related_flows'] = [flow_ids[0]] + flow_ids[i+1:i+2] if i < len(flow_ids)-1 else [flow_ids[0]]

    with open('audience_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Audience')

    # Fix Benchmark
    print('Fixing BENCHMARK...')
    with open('benchmark_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']
    flow_ids = [flow.get('flow_name', '').replace(' ', '_') for flow in flows]

    for i, flow in enumerate(flows):
        if i == 0:
            flow['related_flows'] = flow_ids[1:3] if len(flow_ids) > 2 else flow_ids[1:]
        else:
            flow['related_flows'] = [flow_ids[0]] + flow_ids[i+1:i+2] if i < len(flow_ids)-1 else [flow_ids[0]]

    with open('benchmark_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Benchmark')

    # Fix Reviews
    print('Fixing REVIEWS...')
    with open('reviews_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']
    flow_ids = [flow.get('flow_name', '').replace(' ', '_').replace('-', '_') for flow in flows]

    for i, flow in enumerate(flows):
        if i == 0:
            flow['related_flows'] = flow_ids[1:3] if len(flow_ids) > 2 else flow_ids[1:]
        else:
            flow['related_flows'] = [flow_ids[0]] + flow_ids[i+1:i+2] if i < len(flow_ids)-1 else [flow_ids[0]]

    with open('reviews_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Reviews')

    # Fix VIZIA
    print('Fixing VIZIA...')
    with open('vizia_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']
    flow_ids = [flow.get('flow_name', '').replace(' ', '_') for flow in flows]

    for i, flow in enumerate(flows):
        if i == 0:
            flow['related_flows'] = flow_ids[1:3] if len(flow_ids) > 2 else flow_ids[1:]
        else:
            flow['related_flows'] = [flow_ids[0]] + flow_ids[i+1:i+2] if i < len(flow_ids)-1 else [flow_ids[0]]

    with open('vizia_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed VIZIA')

    # Fix Influence
    print('Fixing INFLUENCE...')
    with open('influence_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']
    # Influence only has 1 flow, so just give it empty or self-reference
    if flows:
        flows[0]['related_flows'] = []

    with open('influence_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)
    print('  ✓ Fixed Influence')

# Main execution
if __name__ == '__main__':
    print('Fixing all module dependencies to use actual flow IDs...\n')
    fix_all_module_dependencies()
    print('\n✅ All modules fixed!')