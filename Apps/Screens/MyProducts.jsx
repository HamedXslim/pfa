import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'
import { useUser } from '@clerk/clerk-expo'

import LatestItemList from '../Components/HomeScreen/LatestItemList'
import { app } from '../../firebaseConfig'
import { useNavigation } from '@react-navigation/native'

export default function MyProducts() {
    const db = getFirestore(app)
    const { user } = useUser();
    const navigation = useNavigation();
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getUserPost();
        }
    }, [user])

    useEffect(() => {
        navigation.addListener('focus', (e) => {
            if (user) {
                getUserPost();
            }
        })
    }, [navigation])

    /**
     * Used to get User Post only
     */
    const getUserPost = async () => {
        try {
            setLoading(true);
            setProductList([]);
            console.log("Récupération des produits pour:", user?.primaryEmailAddress?.emailAddress);
            
            const q = query(
                collection(db, 'UserPost'), 
                where('userEmail', '==', user?.primaryEmailAddress?.emailAddress)
            );
            
            const snapshot = await getDocs(q);
            const products = [];
            
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`Nombre de produits trouvés: ${products.length}`);
            setProductList(products);
        } catch (error) {
            console.error("Erreur lors de la récupération des produits:", error);
        } finally {
            setLoading(false);
        }
    }

    const goToAddPost = () => {
        navigation.navigate('AddPost');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mes annonces</Text>
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Chargement de vos annonces...</Text>
                </View>
            ) : productList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require('../../assets/images/empty.png')}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>Vous n'avez pas encore d'annonces</Text>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={goToAddPost}
                    >
                        <Text style={styles.addButtonText}>Créer une annonce</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <LatestItemList latestItemList={productList} heading="Mes annonces" />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
        opacity: 0.7,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    addButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#3b82f6',
        borderRadius: 10,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});