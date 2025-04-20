import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import PostItem from '../../Components/PostItem'

export default function LatestItemList({ latestItemList }) {
  
  if (!latestItemList || latestItemList.length === 0) {
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
        data={latestItemList}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  )
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
  }
});