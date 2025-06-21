import { Button } from '@react-navigation/elements';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HomeScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>home screen at center</Text>
        <Button
            onPress={() => {
                // Navigate to the Explore screen
                // This is just a placeholder, replace with actual navigation logic
                console.log('Navigate to Explore');
            }}
        >
            Go to Explore
        </Button>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
    },
});

export default HomeScreen;