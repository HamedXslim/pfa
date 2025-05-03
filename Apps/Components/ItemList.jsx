import { View, ActivityIndicator, Text, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app, db, auth, storage } from '../../firebase';
import { useRoute } from '@react-navigation/native';
import PostItem from './PostItem';

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

export default function ItemList() {
    const { params } = useRoute();
    // db is now imported directly from firebase.js
    const [itemList, setItemList] = useState([]);
    const [loading,setLoading]=useState(false);
    useEffect(() => {
        if (!params) return;
        
        if (params.searchQuery) {
            // If we have a search query, use that
            searchItems(params.searchQuery);
        } else if (params.category) {
            // Otherwise use category filter
            getItemListByCategory();
        }
    }, [params]);

    // Function to search for items by query
    const searchItems = async (query) => {
        try {
            setItemList([]);
            setLoading(true);
            console.log('Searching for:', query);
            
            // Get all posts and filter by search query
            const postsRef = collection(db, 'UserPost');
            const postsSnapshot = await getDocs(postsRef);
            
            const matchingItems = [];
            const searchTerm = query.toLowerCase().trim();
            
            postsSnapshot.forEach(doc => {
                const data = doc.data();
                const postWithId = { ...data, id: doc.id };
                
                // Check if search term is in title, description, or subcategory details
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
                
                // Check subcategory details (like brand, model, etc.)
                if (!isMatch && data.subcategoryDetails) {
                    const details = data.subcategoryDetails;
                    for (const key in details) {
                        if (details[key] && details[key].toLowerCase && 
                            details[key].toLowerCase().includes(searchTerm)) {
                            isMatch = true;
                            break;
                        }
                    }
                }
                
                if (isMatch) {
                    console.log('Found matching search item:', postWithId.title);
                    matchingItems.push(postWithId);
                }
            });
            
            console.log(`Found ${matchingItems.length} items matching '${query}'`);
            setItemList(matchingItems);
        } catch (error) {
            console.error('Error searching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const getItemListByCategory = async () => {
        try {
            setItemList([]);
            setLoading(true);
            console.log('Searching for category:', params.category);
            
            // Get all posts and filter by category (more reliable)
            const postsRef = collection(db, 'UserPost');
            const postsSnapshot = await getDocs(postsRef);
            
            const matchingItems = [];
            
            postsSnapshot.forEach(doc => {
                const data = doc.data();
                const postWithId = { ...data, id: doc.id };
                
                // Match category case-insensitively
                if (data.category && 
                    data.category.toLowerCase() === params.category.toLowerCase()) {
                    console.log('Found matching item:', postWithId);
                    matchingItems.push(postWithId);
                }
            });
            
            console.log(`Found ${matchingItems.length} items in category ${params.category}`);
            setItemList(matchingItems);
        } catch (error) {
            console.error('Error fetching items by category:', error);
        } finally {
            setLoading(false);
        }
    }

    // Function to render items
    const renderItems = () => {
        console.log('ItemList to render:', itemList);
        
        // Safety check - if itemList is empty after loading
        if (!itemList || itemList.length === 0) {
            return (
                <Text className="p-5 text-[20px] mt-24 justify-center text-center text-gray-400">
                    No posts found in this category
                </Text>
            );
        }

        return (
            <View style={{flex: 1, width: '100%'}}>
                <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5}}>
                    {params.category} ({itemList.length})
                </Text>
                
                {/* Using direct mapping instead of FlatList for better rendering */}
                <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                    {itemList.map((item) => (
                        <View key={item.id || `item-${Math.random().toString(36)}`} style={{width: '48%', marginBottom: 10}}>
                            <PostItem post={item} />
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={{flex: 1, padding: 10}}>
            {loading ? (
                <ActivityIndicator style={{marginTop: 100}} size={'large'} color={'#3b82f6'} />
            ) : (
                renderItems()
            )}
        </View>
    );
}