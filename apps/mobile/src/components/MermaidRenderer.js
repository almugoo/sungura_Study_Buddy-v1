import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const MermaidRenderer = ({ definition }) => {
    // Sanitize the definition to avoid breaking the script
    const sanitizedDefinition = definition.replace(/`/g, '\\`');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; margin: 0; padding: 10px; background-color: #f9f9f9; }
          #mermaid { width: 100%; }
        </style>
      </head>
      <body>
        <div id="mermaid" class="mermaid">
          ${sanitizedDefinition}
        </div>
        <script>
          mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
          
          // Send back the height once rendered for auto-sizing (optional)
          window.onload = () => {
             // We can detect when it's done rendering if needed
          };
        </script>
      </body>
    </html>
  `;

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={styles.webview}
                scrollEnabled={false}
                mixedContentMode="always"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 250, // Fixed height for now, could be dynamic
        width: width * 0.75,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default MermaidRenderer;
