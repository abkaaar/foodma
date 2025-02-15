import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Mock data for posts
const posts = [
  { id: '1', video: 'https://example.com/video1.mp4', caption: 'This is the first post' },
  { id: '2', video: 'https://example.com/video2.mp4', caption: 'This is the second post' },
  { id: '3', video: 'https://example.com/video3.mp4', caption: 'This is the third post' },
];

// TikTok-like post component
interface PostProps {
  video: string;
  caption: string;
}

const Post: React.FC<PostProps> = ({ video, caption }) => {
  return (
    <View style={styles.postContainer}>
      <Image source={{ uri: video }} style={styles.video} />
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
};

// Explore Screen
const ExploreScreen = () => {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Post video={item.video} caption={item.caption} />}
    />
  );
};

// Nearby Screen
const NearbyScreen = () => {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Post video={item.video} caption={item.caption} />}
    />
  );
};

// Top Tab Navigator
const Tab = createMaterialTopTabNavigator();

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Explore" component={ExploreScreen} />
          <Tab.Screen name="Nearby" component={NearbyScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  postContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  caption: {
    position: 'absolute',
    bottom: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;