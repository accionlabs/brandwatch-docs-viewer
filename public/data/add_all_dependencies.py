#!/usr/bin/env python3
import json

def add_measure_dependencies():
    """Add dependencies for Measure module"""
    with open('measure_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['brandwatch_measure_user_flows']['flows']

    # Define relationships for Measure module
    relationships = {
        'MEASURE_001': ['MEASURE_002', 'MEASURE_003', 'MEASURE_004'],
        'MEASURE_002': ['MEASURE_001', 'MEASURE_005', 'MEASURE_007'],
        'MEASURE_003': ['MEASURE_001', 'MEASURE_006'],
        'MEASURE_004': ['MEASURE_001', 'MEASURE_008', 'MEASURE_009'],
        'MEASURE_005': ['MEASURE_002', 'MEASURE_007'],
        'MEASURE_006': ['MEASURE_003', 'MEASURE_001'],
        'MEASURE_007': ['MEASURE_002', 'MEASURE_005', 'MEASURE_001'],
        'MEASURE_008': ['MEASURE_004', 'MEASURE_009'],
        'MEASURE_009': ['MEASURE_004', 'MEASURE_008'],
        'MEASURE_010': ['MEASURE_001', 'MEASURE_008']
    }

    for flow in flows:
        flow_id = flow.get('flow_id', '')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['MEASURE_001']

    with open('measure_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Measure: Added dependencies to', len(flows), 'flows')

def add_publish_dependencies():
    """Add dependencies for Publish module"""
    with open('publish_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['brandwatch_publish_user_flows']['flows']

    # Define relationships for key Publish flows
    relationships = {
        'PUB_001': ['PUB_002', 'PUB_003', 'PUB_004'],
        'PUB_002': ['PUB_001', 'PUB_005', 'PUB_006'],
        'PUB_003': ['PUB_001', 'PUB_004'],
        'PUB_004': ['PUB_001', 'PUB_003', 'PUB_007'],
        'PUB_005': ['PUB_002', 'PUB_006'],
        'PUB_006': ['PUB_002', 'PUB_005', 'PUB_001'],
        'PUB_007': ['PUB_004', 'PUB_008'],
        'PUB_008': ['PUB_007', 'PUB_009'],
        'PUB_009': ['PUB_008', 'PUB_004'],
        'PUB_010': ['PUB_001', 'PUB_011', 'PUB_012'],
        'PUB_011': ['PUB_010', 'PUB_001'],
        'PUB_012': ['PUB_010', 'PUB_013'],
        'PUB_013': ['PUB_012', 'PUB_001'],
        'PUB_014': ['PUB_001', 'PUB_002'],
        'PUB_015': ['PUB_002', 'PUB_005'],
        'PUB_016': ['PUB_004', 'PUB_007'],
        'PUB_017': ['PUB_001', 'PUB_018'],
        'PUB_018': ['PUB_017', 'PUB_019'],
        'PUB_019': ['PUB_018', 'PUB_020'],
        'PUB_020': ['PUB_019', 'PUB_001'],
        'PUB_021': ['PUB_008', 'PUB_009'],
        'PUB_022': ['PUB_001', 'PUB_023'],
        'PUB_023': ['PUB_022', 'PUB_001'],
        'PUB_024': ['PUB_001', 'PUB_025'],
        'PUB_025': ['PUB_024', 'PUB_001']
    }

    for flow in flows:
        flow_id = flow.get('flow_id', '')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['PUB_001', 'PUB_002']

    with open('publish_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Publish: Added dependencies to', len(flows), 'flows')

def add_listen_dependencies():
    """Add dependencies for Listen module"""
    with open('listen_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for Listen module
    relationships = {
        'LISTEN_001': ['LISTEN_002', 'LISTEN_003', 'LISTEN_004'],
        'LISTEN_002': ['LISTEN_001', 'LISTEN_005', 'LISTEN_006'],
        'LISTEN_003': ['LISTEN_001', 'LISTEN_007'],
        'LISTEN_004': ['LISTEN_001', 'LISTEN_008', 'LISTEN_009'],
        'LISTEN_005': ['LISTEN_002', 'LISTEN_001'],
        'LISTEN_006': ['LISTEN_002', 'LISTEN_010'],
        'LISTEN_007': ['LISTEN_003', 'LISTEN_001'],
        'LISTEN_008': ['LISTEN_004', 'LISTEN_009'],
        'LISTEN_009': ['LISTEN_004', 'LISTEN_008'],
        'LISTEN_010': ['LISTEN_006', 'LISTEN_002']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'LISTEN_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['LISTEN_001']

    with open('listen_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Listen: Added dependencies to', len(flows), 'flows')

def add_consumer_research_dependencies():
    """Add dependencies for Consumer Research module"""
    with open('consumer_research_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for Consumer Research
    relationships = {
        'CR_001': ['CR_002', 'CR_003', 'CR_004'],
        'CR_002': ['CR_001', 'CR_005'],
        'CR_003': ['CR_001', 'CR_006'],
        'CR_004': ['CR_001', 'CR_007', 'CR_008'],
        'CR_005': ['CR_002', 'CR_009'],
        'CR_006': ['CR_003', 'CR_001'],
        'CR_007': ['CR_004', 'CR_008'],
        'CR_008': ['CR_004', 'CR_007'],
        'CR_009': ['CR_005', 'CR_002'],
        'CR_010': ['CR_001', 'CR_004']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'CR_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['CR_001']

    with open('consumer_research_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Consumer Research: Added dependencies to', len(flows), 'flows')

def add_advertise_dependencies():
    """Add dependencies for Advertise module"""
    with open('advertise_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for Advertise
    relationships = {
        'ADV_001': ['ADV_002', 'ADV_003', 'ADV_004'],
        'ADV_002': ['ADV_001', 'ADV_005', 'ADV_006'],
        'ADV_003': ['ADV_001', 'ADV_007'],
        'ADV_004': ['ADV_001', 'ADV_008', 'ADV_009'],
        'ADV_005': ['ADV_002', 'ADV_010'],
        'ADV_006': ['ADV_002', 'ADV_001'],
        'ADV_007': ['ADV_003', 'ADV_011'],
        'ADV_008': ['ADV_004', 'ADV_009'],
        'ADV_009': ['ADV_004', 'ADV_008', 'ADV_012'],
        'ADV_010': ['ADV_005', 'ADV_002'],
        'ADV_011': ['ADV_007', 'ADV_003'],
        'ADV_012': ['ADV_009', 'ADV_001']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'ADV_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['ADV_001']

    with open('advertise_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Advertise: Added dependencies to', len(flows), 'flows')

def add_audience_dependencies():
    """Add dependencies for Audience module"""
    with open('audience_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for Audience
    relationships = {
        'AUD_001': ['AUD_002', 'AUD_003', 'AUD_004'],
        'AUD_002': ['AUD_001', 'AUD_005', 'AUD_006'],
        'AUD_003': ['AUD_001', 'AUD_007'],
        'AUD_004': ['AUD_001', 'AUD_008'],
        'AUD_005': ['AUD_002', 'AUD_009'],
        'AUD_006': ['AUD_002', 'AUD_001'],
        'AUD_007': ['AUD_003', 'AUD_010'],
        'AUD_008': ['AUD_004', 'AUD_001'],
        'AUD_009': ['AUD_005', 'AUD_002'],
        'AUD_010': ['AUD_007', 'AUD_003']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'AUD_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['AUD_001']

    with open('audience_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Audience: Added dependencies to', len(flows), 'flows')

def add_benchmark_dependencies():
    """Add dependencies for Benchmark module"""
    with open('benchmark_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for Benchmark
    relationships = {
        'BENCH_001': ['BENCH_002', 'BENCH_003', 'BENCH_004'],
        'BENCH_002': ['BENCH_001', 'BENCH_005'],
        'BENCH_003': ['BENCH_001', 'BENCH_006'],
        'BENCH_004': ['BENCH_001', 'BENCH_007'],
        'BENCH_005': ['BENCH_002', 'BENCH_001'],
        'BENCH_006': ['BENCH_003', 'BENCH_007'],
        'BENCH_007': ['BENCH_004', 'BENCH_006']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'BENCH_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['BENCH_001']

    with open('benchmark_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Benchmark: Added dependencies to', len(flows), 'flows')

def add_reviews_dependencies():
    """Add dependencies for Reviews module"""
    with open('reviews_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for Reviews
    relationships = {
        'REV_001': ['REV_002', 'REV_003', 'REV_004'],
        'REV_002': ['REV_001', 'REV_005'],
        'REV_003': ['REV_001', 'REV_006'],
        'REV_004': ['REV_001', 'REV_007'],
        'REV_005': ['REV_002', 'REV_001'],
        'REV_006': ['REV_003', 'REV_007'],
        'REV_007': ['REV_004', 'REV_006']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'REV_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['REV_001']

    with open('reviews_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Reviews: Added dependencies to', len(flows), 'flows')

def add_vizia_dependencies():
    """Add dependencies for VIZIA module"""
    with open('vizia_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for VIZIA
    relationships = {
        'VIZ_001': ['VIZ_002', 'VIZ_003', 'VIZ_004'],
        'VIZ_002': ['VIZ_001', 'VIZ_005', 'VIZ_006'],
        'VIZ_003': ['VIZ_001', 'VIZ_007'],
        'VIZ_004': ['VIZ_001', 'VIZ_008'],
        'VIZ_005': ['VIZ_002', 'VIZ_009'],
        'VIZ_006': ['VIZ_002', 'VIZ_001'],
        'VIZ_007': ['VIZ_003', 'VIZ_010'],
        'VIZ_008': ['VIZ_004', 'VIZ_001'],
        'VIZ_009': ['VIZ_005', 'VIZ_002'],
        'VIZ_010': ['VIZ_007', 'VIZ_003']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'VIZ_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['VIZ_001']

    with open('vizia_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ VIZIA: Added dependencies to', len(flows), 'flows')

def add_influence_dependencies():
    """Add dependencies for Influence module"""
    with open('influence_user_flows_with_citations.json', 'r') as f:
        data = json.load(f)

    flows = data['user_flows']

    # Define relationships for Influence
    relationships = {
        'INF_001': ['INF_002', 'INF_003'],
        'INF_002': ['INF_001', 'INF_003'],
        'INF_003': ['INF_001', 'INF_002']
    }

    for i, flow in enumerate(flows):
        flow_id = flow.get('flow_id', f'INF_{i+1:03d}')
        if flow_id in relationships:
            flow['related_flows'] = relationships[flow_id]
        else:
            flow['related_flows'] = ['INF_001']

    with open('influence_user_flows_with_citations.json', 'w') as f:
        json.dump(data, f, indent=4)

    print('✓ Influence: Added dependencies to', len(flows), 'flows')

# Main execution
if __name__ == '__main__':
    print('Adding dependencies to all modules...\n')

    add_measure_dependencies()
    add_publish_dependencies()
    add_listen_dependencies()
    add_consumer_research_dependencies()
    add_advertise_dependencies()
    add_audience_dependencies()
    add_benchmark_dependencies()
    add_reviews_dependencies()
    add_vizia_dependencies()
    add_influence_dependencies()

    print('\n✅ Successfully added dependencies to all modules!')