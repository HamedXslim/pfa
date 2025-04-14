import { View, Text, Image, ScrollView, TouchableOpacity, Button, Share, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';
import { app } from '../../firebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import { deleteDoc, getDocs, getFirestore, collection, query, where } from 'firebase/firestore';

export default function ProductDetail({navigation}) {
    const { params } = useRoute();
    const [product, setProduct] = useState([]);
    const {user} = useUser();
    const db = getFirestore(app);
    const nav = useNavigation();

    useEffect(() => {
        params && setProduct(params.product);
        shareButton();
    }, [params, navigation]);

    const shareButton = () => {
        navigation.setOptions({
            headerRight: () => (
                <Ionicons 
                    name="share" 
                    size={24} 
                    color="black"
                    style={{marginRight:15}}
                    onPress={() => shareProduct()}
                />
            ),
        });
    }

    const deleteUserPost = () => {
        Alert.alert('Do you want to delete', "Are you sure you want to delete this post?", [
            {
                text: 'yes',
                onPress: () => deleteFromFirestore()
            },
            {
                text: 'no',
                onPress: () => console.log('cancel pressed'),
                style: 'cancel',
            }
        ]);
    }

    const deleteFromFirestore = async () => {
        const q = query(collection(db, 'UserPost'), where('title', '==', product.title));
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
            deleteDoc(doc.ref).then(resp => {
                console.log("Deleted the Doc...");
                nav.goBack();
            });
        });
    }

    const shareProduct = async () => {
        const content = {
            message: product.title + "\n" + product.description,
        }
        Share.share(content).then(resp => {
            console.log(resp) 
        }, (error) => {
            console.log(error);
        });
    }

    const sendEmailMessage = () => {
        const subject = 'Regarding ' + product.title;
        const body = "Hi " + product.userName + "\n" + "I'm interested in this product";
        Linking.openURL('mailto:' + product.userEmail + "?subject=" + subject + "&body=" + body);
    }

    return (
        <ScrollView className="bg-white">
            <Image 
                source={{ uri: product.image }}
                className="h-[320px] w-full"
            />
            <View className="p-3">
                <Text className="text-[24px] font-bold">{product?.title}</Text>
                <View className="items-baseline">
                    <Text className="bg-blue-200 text-blue-500 rounded-full mt-2 p-1 px-2">
                        {product.category}
                    </Text>
                </View>
                <Text className="mt-3 font-bold text-[20px]">Description</Text>
                <Text className="text-[17px] font-bold">{product?.description}</Text>
            </View>
            
            {/* User info */}
            <View className="p-3 bg-blue-100 flex flex-row items-center gap-3 border-[1px] border-gray-400">
                <Text>Owner :</Text>
                <Image 
                    source={{uri: product.userImage}}
                    className="w-12 h-12 rounded-full"
                />
                <View>
                    <Text className="font-bold text-[18px]"> 
                        {product.userName}
                    </Text>
                    <Text className="text-gray-500">
                        {product.userEmail}
                    </Text>
                </View>
            </View>
            
            {user?.primaryEmailAddress.emailAddress == product.userEmail ?
                <TouchableOpacity
                    onPress={() => deleteUserPost()}
                    className="z-40 bg-red-500 rounded-full p-4 m-2">
                    <Text className="text-center text-white">Delete Post</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity
                    onPress={() => sendEmailMessage()}
                    className="z-40 bg-blue-500 rounded-full p-4 m-2">
                    <Text className="text-center text-white">Send Message</Text>
                </TouchableOpacity>
            }
        </ScrollView>
    );
}