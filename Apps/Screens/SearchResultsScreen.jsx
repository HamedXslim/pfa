import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebase.native.js';
import PostItem from '../Components/PostItem';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SearchResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { searchQuery } = route.params || {};
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the header with back button
    navigation.setOptions({
      title: `Search: ${searchQuery || ''}`,
      headerStyle: { backgroundColor: '#3b82f6' },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });

    // Search for items
    if (searchQuery) {
      searchItems(searchQuery);
    }
  }, [searchQuery, navigation]);

  const searchItems = async (query) => {
    try {
      setLoading(true);
      console.log('Searching for:', query);

      const db = firebase.firestore();
      const postsRef = db.collection('UserPost');
      const snapshot = await postsRef.get();

      const matchingItems = [];
      const searchTerm = query.toLowerCase().trim();

      snapshot.forEach(doc => {
        const data = doc.data();
        const postWithId = { ...data, id: doc.id };
        let isMatch = false;

        // Check title
        if (data.title && data.title.toLowerCase().includes(searchTerm)) {
          isMatch = true;
        }

        // Check description
        if (!isMatch && data.description && data.description.toLowerCase().includes(searchTerm)) {
          isMatch = true;
        }

        // Check category
        if (!isMatch && data.category && data.category.toLowerCase().includes(searchTerm)) {
          isMatch = true;
        }

        // Check subcategory details
        if (!isMatch && data.subcategoryDetails) {
          const details = data.subcategoryDetails;
          for (const key in details) {
            if (details[key] && typeof details[key] === 'string' && 
                details[key].toLowerCase().includes(searchTerm)) {
              isMatch = true;
              break;
            }
          }
        }

        if (isMatch) {
          console.log('Found matching item:', postWithId.title);
          matchingItems.push(postWithId);
        }
      });

      console.log(`Found ${matchingItems.length} items matching '${query}'`);
      setResults(matchingItems);
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ width: '48%' }}>
      <PostItem post={item} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Searching...</Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={70} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyText}>
          We couldn't find any items matching "{searchQuery}"
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.resultsText}>
        {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchQuery}"
      </Text>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    color: '#666',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
});
