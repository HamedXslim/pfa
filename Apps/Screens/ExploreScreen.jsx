import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { app } from '../../firebaseConfig';
import { getFirestore, getDocs, collection, query, where, orderBy, limit, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import PostItem from '../Components/PostItem';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { getSubcategoriesFromFirestore, subcategories, runInitialization } from '../../subcategories';

export default function ExploreScreen() {
  const [posts, setPosts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const navigation = useNavigation();
  const numColumns = 2;
  const db = getFirestore(app);

  useEffect(() => {
    getCategoryList();
    getAllPosts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setCurrentSubcategories([]);
      setSelectedSubcategories({});
    }
  }, [selectedCategory]);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, selectedSubcategories, searchText]);

  const fetchSubcategories = async (categoryName) => {
    try {
      setLoading(true);
      console.log(`Chargement des sous-catégories pour ${categoryName}...`);
      const subcategories = await getSubcategoriesFromFirestore(categoryName);
      
      if (subcategories.length === 0) {
        console.log(`⚠️ Aucune sous-catégorie trouvée pour ${categoryName}! Tentative d'initialisation...`);
        
        // Initialisation des sous-catégories pour cette catégorie spécifique
        const result = await initializeSubcategoriesForCategory(categoryName);
        
        if (result.success) {
          // Réessayer après initialisation
          const newSubcategories = await getSubcategoriesFromFirestore(categoryName);
          console.log(`✅ Sous-catégories chargées après initialisation: ${newSubcategories.length}`);
          setCurrentSubcategories(newSubcategories);
        } else {
          console.log(`❌ Échec de l'initialisation des sous-catégories pour ${categoryName}`);
          // On continue quand même mais on informe l'utilisateur
          Alert.alert(
            "Information", 
            `Certains filtres pour ${categoryName} peuvent ne pas être disponibles.`
          );
        }
      } else {
        console.log(`✅ ${subcategories.length} sous-catégories récupérées pour ${categoryName}`);
        setCurrentSubcategories(subcategories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction pour initialiser les sous-catégories d'une catégorie spécifique
  const initializeSubcategoriesForCategory = async (categoryName) => {
    try {
      const db = getFirestore(app);
      
      // Vérifier si des sous-catégories existent pour cette catégorie
      const existingQuery = query(
        collection(db, 'Subcategory'),
        where('categoryName', '==', categoryName)
      );
      const snapshot = await getDocs(existingQuery);
      
      if (!snapshot.empty) {
        console.log(`Des sous-catégories existent déjà pour ${categoryName}`);
        return { success: false, message: 'Les sous-catégories existent déjà' };
      }
      
      // Récupérer les sous-catégories définies pour cette catégorie
      const categorySubcategories = subcategories[categoryName];
      
      if (!categorySubcategories || categorySubcategories.length === 0) {
        console.log(`Aucune sous-catégorie définie pour ${categoryName}`);
        return { success: false, message: 'Pas de sous-catégories définies' };
      }
      
      // Utiliser un batch pour ajouter les sous-catégories
      const batch = writeBatch(db);
      const subcategoriesRef = collection(db, 'Subcategory');
      let count = 0;
      
      // Pour chaque sous-catégorie
      categorySubcategories.forEach((subcategory, index) => {
        const docRef = doc(subcategoriesRef);
        batch.set(docRef, {
          ...subcategory,
          categoryName,
          order: index,
          createdAt: new Date().toISOString()
        });
        count++;
      });
      
      // Exécuter le batch
      await batch.commit();
      console.log(`${count} sous-catégories initialisées pour ${categoryName}`);
      
      return { success: true, count };
    } catch (error) {
      console.error(`Erreur lors de l'initialisation des sous-catégories pour ${categoryName}:`, error);
      return { success: false, error: error.message };
    }
  };

  const getCategoryList = async () => {
    try {
      setCategoryList([]);
      const querySnapshot = await getDocs(collection(db, 'Category'));
      querySnapshot.forEach((doc) => {
        setCategoryList(categoryList => [...categoryList, doc.data()]);
      });
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const getAllPosts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const postData = [];
      querySnapshot.forEach((doc) => {
        postData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postData);
      setFilteredPosts(postData);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour filtrer les annonces selon catégories, sous-catégories et texte de recherche
  const filterPosts = () => {
    let filtered = [...posts];

    // Filtrer par texte de recherche
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchLower) || 
        post.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrer par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filtrer par sous-catégories
    const selectedSubcategoryNames = Object.keys(selectedSubcategories).filter(name => selectedSubcategories[name]);
    if (selectedSubcategoryNames.length > 0) {
      filtered = filtered.filter(post => {
        // Vérifier si le post a des détails de sous-catégorie
        if (!post.subcategoryDetails) return false;
        
        // Vérifier si au moins une sous-catégorie sélectionnée correspond
        return selectedSubcategoryNames.some(subcatName => {
          const subcatValue = post.subcategoryDetails[subcatName];
          return subcatValue !== undefined && subcatValue !== '';
        });
      });
    }

    setFilteredPosts(filtered);
  };

  const toggleSubcategorySelection = (subcategoryName) => {
    setSelectedSubcategories(prev => ({
      ...prev,
      [subcategoryName]: !prev[subcategoryName]
    }));
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategories({});
    setSearchText('');
  };

  const hasActiveFilters = () => {
    return selectedCategory !== null || 
           Object.values(selectedSubcategories).some(value => value) ||
           searchText.trim() !== '';
  };

  const renderItem = ({ item }) => (
    <PostItem post={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorez</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
          <FontAwesome name="plus-circle" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des annonces..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {hasActiveFilters() && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            selectedCategory === null && styles.categoryItemSelected
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === null && styles.categoryTextSelected
          ]}>Tout</Text>
        </TouchableOpacity>

        {categoryList.map((item, index) => (
          <TouchableOpacity
            key={`cat-${item.name}-${index}`}
            style={[
              styles.categoryItem,
              selectedCategory === item.name && styles.categoryItemSelected
            ]}
            onPress={() => setSelectedCategory(item.name)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item.name && styles.categoryTextSelected
            ]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory && currentSubcategories.length > 0 && (
        <View style={styles.subcategoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentSubcategories.map((subcategory, index) => (
              <TouchableOpacity
                key={subcategory.id || `subcat-${subcategory.name}-${index}`}
                style={[
                  styles.subcategoryChip,
                  selectedSubcategories[subcategory.name] && styles.subcategoryChipSelected
                ]}
                onPress={() => toggleSubcategorySelection(subcategory.name)}
              >
                <Text style={[
                  styles.subcategoryChipText,
                  selectedSubcategories[subcategory.name] && styles.subcategoryChipTextSelected
                ]}>
                  {subcategory.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.subcategoryMoreButton}
              onPress={() => setSubcategoryModalVisible(true)}
            >
              <Text style={styles.subcategoryMoreButtonText}>Plus...</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des annonces...</Text>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/images/empty.png')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>Aucune annonce trouvée</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={clearFilters}
          >
            <Text style={styles.emptyButtonText}>Effacer les filtres</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de sélection détaillée des sous-catégories */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={subcategoryModalVisible}
        onRequestClose={() => setSubcategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrer par sous-catégories</Text>
              <TouchableOpacity onPress={() => setSubcategoryModalVisible(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {currentSubcategories.map((subcategory, index) => (
                <TouchableOpacity
                  key={`modal-subcat-${subcategory.id || subcategory.name}-${index}`}
                  style={styles.modalSubcategoryItem}
                  onPress={() => toggleSubcategorySelection(subcategory.name)}
                >
                  <View style={styles.modalSubcategoryCheckbox}>
                    {selectedSubcategories[subcategory.name] && (
                      <FontAwesome name="check" size={16} color="#3b82f6" />
                    )}
                  </View>
                  <View style={styles.modalSubcategoryInfo}>
                    <Text style={styles.modalSubcategoryTitle}>{subcategory.label}</Text>
                    {subcategory.description && (
                      <Text style={styles.modalSubcategoryDescription}>
                        {subcategory.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalClearButton}
                onPress={() => setSelectedSubcategories({})}
              >
                <Text style={styles.modalClearButtonText}>Effacer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={() => setSubcategoryModalVisible(false)}
              >
                <Text style={styles.modalApplyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  categoryContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontWeight: '500',
    color: '#666',
  },
  categoryTextSelected: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  subcategoryBar: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  subcategoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subcategoryChipSelected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#3b82f6',
  },
  subcategoryChipText: {
    fontSize: 12,
    color: '#666',
  },
  subcategoryChipTextSelected: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  subcategoryMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#e6e6e6',
    marginRight: 8,
  },
  subcategoryMoreButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
    marginBottom: 15,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    minHeight: Dimensions.get('window').height * 0.6,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 20,
  },
  modalSubcategoryItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalSubcategoryCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalSubcategoryInfo: {
    flex: 1,
  },
  modalSubcategoryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalSubcategoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalClearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalClearButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  modalApplyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  modalApplyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});