import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function LiveCameraFeed() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: 'https://www.messenger.com' }}
        style={{ flex: 1 }}
      />
    </View>
  );
}