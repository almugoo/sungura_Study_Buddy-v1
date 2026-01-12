async function testMermaid() {
    try {
        console.log('--- Sending Mermaid Test Request ---');
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Explain the nitrogen cycle using a Mermaid flowchart",
                learningStyle: "Visual",
                courseContext: "Environment Science"
            })
        });

        const data = await response.json();
        console.log('\n--- AI Response ---');
        console.log(data.response);

        if (data.response.includes('```mermaid')) {
            console.log('\n✅ Mermaid block detected!');
        } else {
            console.log('\n❌ No Mermaid block found.');
        }
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testMermaid();
