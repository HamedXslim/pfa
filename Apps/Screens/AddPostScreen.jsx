// AddPostScreen.js
import { View, ScrollView, Text, TextInput, StyleSheet, Button, TouchableOpacity, Image, ToastAndroid, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { app, db, auth, storage } from '../../firebase';
import { getFirestore, getDocs, collection, addDoc, query, where } from 'firebase/firestore';
import { Formik } from 'formik';
import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getSubcategoriesFromFirestore, initializeSubcategoriesInFirestore, runInitialization } from '../../subcategories';
import { FontAwesome } from '@expo/vector-icons';

export default function AddPostScreen() {
  const [image, setImage] = useState(null);
  // db is now imported directly from firebase.js
  const storage = getStorage();
  const { user } = useUser();
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const [initializing, setInitializing] = useState(false);
  
  // États pour les modals de sélection
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [currentPickerModal, setCurrentPickerModal] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [currentFieldName, setCurrentFieldName] = useState('');
  const [currentFieldLabel, setCurrentFieldLabel] = useState('');

  useEffect(() => {
    getCategoryList();
    // Vérifier et initialiser les sous-catégories dans Firestore si besoin
    checkAndInitializeSubcategories();
  }, []);

  // Vérifier si les sous-catégories existent dans Firestore, sinon les initialiser
  const checkAndInitializeSubcategories = async () => {
    try {
      setInitializing(true);
      // Vérifier si des sous-catégories existent déjà
      const subcatsRef = collection(db, 'Subcategory');
      const snapshot = await getDocs(subcatsRef);
      
      if (snapshot.empty) {
        console.log('Initialisation automatique des sous-catégories dans Firestore...');
        const result = await initializeSubcategoriesInFirestore();
        if (result) {
          console.log('Les sous-catégories ont été initialisées avec succès');
        } else {
          console.log('Échec de l\'initialisation des sous-catégories');
        }
      } else {
        console.log('Les sous-catégories existent déjà dans Firestore');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des sous-catégories:', error);
    } finally {
      setInitializing(false);
    }
  };

  // Mettre à jour les sous-catégories lorsque la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setCurrentSubcategories([]);
    }
  }, [selectedCategory]);

  const fetchSubcategories = async (categoryName) => {
    try {
      setLoading(true);
      console.log(`Chargement des sous-catégories pour ${categoryName}...`);
      const subcategories = await getSubcategoriesFromFirestore(categoryName);
      
      if (subcategories.length === 0) {
        console.log(`⚠️ Aucune sous-catégorie trouvée pour ${categoryName}! Tentative d'initialisation...`);
        // Si aucune sous-catégorie n'est trouvée, tenter de les initialiser
        const initResult = await runInitialization();
        if (initResult.success) {
          // Réessayer après initialisation
          const newSubcategories = await getSubcategoriesFromFirestore(categoryName);
          console.log(`✅ Sous-catégories chargées après initialisation: ${newSubcategories.length}`);
          setCurrentSubcategories(newSubcategories);
        } else {
          console.log(`❌ Échec de l'initialisation des sous-catégories`);
          Alert.alert(
            "Attention", 
            `Impossible de charger les détails pour la catégorie ${categoryName}. Veuillez contacter l'administrateur.`
          );
        }
      } else {
        console.log(`✅ ${subcategories.length} sous-catégories récupérées pour ${categoryName}`);
        setCurrentSubcategories(subcategories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
      Alert.alert('Erreur', 'Impossible de charger les sous-catégories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryList = async () => {
    setCategoryList([]);
    const querySnapshot = await getDocs(collection(db, 'Category'));
    querySnapshot.forEach((doc) => {
      setCategoryList(categoryList => [...categoryList, doc.data()]);
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Ouvrir la modal pour sélectionner une option
  const openOptionPicker = (fieldName, options, label, setFieldValue, currentValue) => {
    setCurrentFieldName(fieldName);
    setCurrentFieldLabel(label);
    setCurrentOptions(options);
    setCurrentPickerModal({setFieldValue, currentValue});
    setCategoryModalVisible(true);
  };

  // Rendre un champ de formulaire en fonction de son type
  const renderSubcategoryField = (subcategory, values, handleChange, setFieldValue) => {
    switch (subcategory.type) {
      case 'select':
        return (
          <View key={subcategory.id || subcategory.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {subcategory.label} {subcategory.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TouchableOpacity 
              style={styles.customSelectButton}
              onPress={() => openOptionPicker(
                subcategory.name, 
                subcategory.options, 
                subcategory.label, 
                setFieldValue, 
                values[subcategory.name]
              )}
            >
              <Text style={[
                styles.selectButtonText, 
                values[subcategory.name] ? styles.selectedValue : styles.placeholderText
              ]}>
                {values[subcategory.name] || `Sélectionner ${subcategory.label}`}
              </Text>
              <FontAwesome name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        );
      case 'number':
        return (
          <View key={subcategory.id || subcategory.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {subcategory.label} {subcategory.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={subcategory.placeholder || ''}
              value={values[subcategory.name]}
              onChangeText={handleChange(subcategory.name)}
              keyboardType="numeric"
            />
          </View>
        );
      case 'text':
      default:
        return (
          <View key={subcategory.id || subcategory.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {subcategory.label} {subcategory.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={subcategory.placeholder || ''}
              value={values[subcategory.name]}
              onChangeText={handleChange(subcategory.name)}
            />
          </View>
        );
    }
  };

  // Valider que tous les champs requis sont remplis
  const validateForm = (values) => {
    const errors = {};

    if (!values.title) {
      errors.title = "Le titre est obligatoire";
    }

    if (!values.category) {
      errors.category = "La catégorie est obligatoire";
    }

    if (!values.price) {
      errors.price = "Le prix est obligatoire";
    }

    // Valider les sous-catégories requises
    if (values.category && currentSubcategories.length > 0) {
      currentSubcategories.forEach(subcat => {
        if (subcat.required && !values[subcat.name]) {
          errors[subcat.name] = `${subcat.label} est obligatoire`;
        }
      });
    }

    return errors;
  };

  const onSubmitMethod = async (value) => {
    setLoading(true);
    try {
      if (!image) {
        Alert.alert('Image requise', 'Veuillez sélectionner une image avant de soumettre.');
        setLoading(false);
        return;
      }

      const resp = await fetch(image);
      const blob = await resp.blob();
      const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      // Préparer les données à soumettre
      const postData = {
        ...value,
        image: downloadUrl,
        userName: user.fullName,
        userEmail: user.primaryEmailAddress.emailAddress,
        userImage: user.imageUrl,
        createdAt: new Date().toISOString(),
        // Assurez-vous que socialMedia est un objet
        socialMedia: {
          instagram: value.instagram || "",
          facebook: value.facebook || "",
          twitter: value.twitter || ""
        }
      };

      // Supprimer les champs temporaires
      delete postData.instagram;
      delete postData.facebook;
      delete postData.twitter;

      // Regrouper les sous-catégories dans un sous-objet
      if (currentSubcategories.length > 0) {
        postData.subcategoryDetails = {};
        currentSubcategories.forEach(subcat => {
          if (postData[subcat.name]) {
            postData.subcategoryDetails[subcat.name] = postData[subcat.name];
            delete postData[subcat.name]; // Supprimer du niveau racine
          }
        });
      }

      const docRef = await addDoc(collection(db, "UserPost"), postData);
      if (docRef.id) {
        setLoading(false);
        Alert.alert('Succès!', 'Annonce ajoutée avec succès!');
        // Réinitialiser le formulaire après soumission réussie
        setImage(null);
        setSelectedCategory('');
      }
    } catch (error) {
      console.error('Erreur dans onSubmitMethod:', error.message);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de l\'annonce: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Générer les valeurs initiales dynamiquement
  const generateInitialValues = () => {
    const initialValues = {
      title: '',
      description: '',
      category: '',
      address: '',
      price: '',
      phoneNumber: '',
      instagram: '',
      facebook: '',
      twitter: '',
    };

    return initialValues;
  };

  // Composant de modal pour sélection
  const OptionPickerModal = ({ visible, onClose, options, label, onSelect, currentValue }) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner {label}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={`option-${option}-${index}`}
                  style={[
                    styles.optionItem,
                    currentValue === option && styles.selectedOptionItem
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    currentValue === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {currentValue === option && (
                    <FontAwesome name="check" size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Ajouter une annonce</Text>
        <Text style={styles.subtitle}>Créez une nouvelle annonce et commencez à vendre</Text>

        {initializing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Initialisation des données...</Text>
          </View>
        )}

        <Formik
          initialValues={generateInitialValues()}
          onSubmit={values => onSubmitMethod(values)}
          validate={validateForm}
        >
          {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
            <View>
              <TouchableOpacity onPress={pickImage} style={styles.imagePickerContainer}>
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={styles.imagePreview}
                  />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Image
                      source={require('./../../assets/images/placeholder.png')}
                      style={styles.placeholderImage}
                    />
                    <Text style={styles.placeholderText}>Appuyez pour ajouter une image</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {errors.image && touched.image && (
                <Text style={styles.errorText}>{errors.image}</Text>
              )}

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Titre <Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Titre de l'annonce"
                  value={values.title}
                  onChangeText={handleChange('title')}
                />
                {errors.title && touched.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 100 }]}
                  placeholder="Description détaillée"
                  value={values.description}
                  multiline
                  onChangeText={handleChange('description')}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Prix <Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Prix en TND"
                  value={values.price}
                  keyboardType="numeric"
                  onChangeText={handleChange('price')}
                />
                {errors.price && touched.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Adresse</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adresse ou localisation"
                  value={values.address}
                  onChangeText={handleChange('address')}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de téléphone (ex: +21612345678)"
                  value={values.phoneNumber}
                  keyboardType="phone-pad"
                  onChangeText={handleChange('phoneNumber')}
                />
              </View>

              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>Réseaux sociaux (optionnel)</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Instagram</Text>
                <TextInput
                  style={styles.input}
                  placeholder="URL du profil Instagram"
                  value={values.instagram}
                  onChangeText={handleChange('instagram')}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Facebook</Text>
                <TextInput
                  style={styles.input}
                  placeholder="URL du profil Facebook"
                  value={values.facebook}
                  onChangeText={handleChange('facebook')}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Twitter</Text>
                <TextInput
                  style={styles.input}
                  placeholder="URL du profil Twitter"
                  value={values.twitter}
                  onChangeText={handleChange('twitter')}
                />
              </View>

              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>Catégorie <Text style={styles.requiredStar}>*</Text></Text>
              </View>

              <View style={styles.fieldContainer}>
                <TouchableOpacity 
                  style={styles.customSelectButton}
                  onPress={() => openOptionPicker(
                    'category', 
                    categoryList.map(cat => cat.name), 
                    'une catégorie', 
                    setFieldValue, 
                    values.category
                  )}
                >
                  <Text style={[
                    styles.selectButtonText, 
                    values.category ? styles.selectedValue : styles.placeholderText
                  ]}>
                    {values.category || 'Sélectionner une catégorie'}
                  </Text>
                  <FontAwesome name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                {errors.category && touched.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}
              </View>

              {/* Indicateur de chargement pendant le chargement des sous-catégories */}
              {selectedCategory && loading && (
                <View style={styles.subcategoriesLoadingContainer}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={styles.loadingText}>Chargement des détails...</Text>
                </View>
              )}

              {/* Afficher les champs de sous-catégorie si une catégorie est sélectionnée */}
              {currentSubcategories.length > 0 && (
                <View style={styles.subcategoriesContainer}>
                  <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Détails supplémentaires</Text>
                  </View>
                  {currentSubcategories.map(subcategory => 
                    renderSubcategoryField(subcategory, values, handleChange, setFieldValue)
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.submitButton,
                  loading && styles.disabledButton
                ]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Publier l'annonce</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* Modal pour la sélection d'options */}
        {currentPickerModal && (
          <OptionPickerModal
            visible={categoryModalVisible}
            onClose={() => setCategoryModalVisible(false)}
            options={currentOptions}
            label={currentFieldLabel}
            onSelect={(option) => {
              currentPickerModal.setFieldValue(currentFieldName, option);
              if (currentFieldName === 'category') {
                setSelectedCategory(option);
              }
            }}
            currentValue={currentPickerModal.currentValue}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26, 
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14
  },
  subcategoriesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 240,
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  placeholderContainer: {
    width: 240,
    height: 180,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  customSelectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
  },
  selectedValue: {
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  errorText: {
    color: '#e53e3e',
    marginTop: 5,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  subcategoriesContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1e3ff',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  requiredStar: {
    color: '#e53e3e',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    maxHeight: '80%',
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
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  optionList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOptionItem: {
    backgroundColor: '#f0f7ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});