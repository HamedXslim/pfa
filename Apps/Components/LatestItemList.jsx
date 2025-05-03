import { View, Text, StyleSheet, FlatList } from 'react-native';
import React from 'react';
import PostItem from './PostItem';

export default function LatestItemList({ latestItemList }) {
  // Ensure latestItemList is an array and filter out invalid items
  const validItemList = Array.isArray(latestItemList)
    ? latestItemList.filter(item => item && typeof item === 'object' && item.id && item.image && typeof item.image === 'string')
    : [];

  console.log('LatestItemList validItemList:', validItemList);

  if (validItemList.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noItemsText}>
          Aucun article disponible pour le moment
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Derniers articles</Text>
      <FlatList
        data={validItemList}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5,
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});