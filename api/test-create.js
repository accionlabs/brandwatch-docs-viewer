// Using native fetch (available in Node.js 18+)

async function demonstrateFileModification() {
    console.log('Demonstrating that API modifies actual JSON files...\n');

    // Create a new flow
    const newFlow = {
        flow_name: "Demo Flow - File System Test",
        description: "This flow demonstrates that the API directly modifies JSON files",
        flowCategory: "API Demo",
        steps: [
            "This flow was created via API",
            "It will be saved directly to the JSON file",
            "You can verify this in the listen_user_flows_with_citations.json file"
        ],
        source_documents: ["API Documentation"]
    };

    try {
        const response = await fetch('http://localhost:3001/api/flows/listen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFlow)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Flow created successfully!');
            console.log('Flow ID:', result.flow.flow_id);
            console.log('\n📁 The flow has been saved to:');
            console.log('   public/data/listen_user_flows_with_citations.json');
            console.log('\n🔍 You can verify by:');
            console.log('   1. Opening the JSON file and searching for:', result.flow.flow_id);
            console.log('   2. Refreshing the main app to see the new flow');
            console.log('\n💾 A backup was created in: api/backups/');

            return result.flow.flow_id;
        } else {
            console.log('❌ Error:', result.error);
        }
    } catch (error) {
        console.log('❌ Connection error:', error.message);
    }
}

demonstrateFileModification();