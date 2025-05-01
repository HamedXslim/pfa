// Sous-catégories pour chaque catégorie
import { firebase } from './firebase.native.js';

export const subcategories = {
  // Sous-catégories pour Car
  Car: [
    {
      name: "brand",
      type: "select",
      label: "Marque",
      options: [
        "Audi", "BMW", "Citroen", "Fiat", "Ford", "Honda", "Hyundai", 
        "Kia", "Mercedes", "Nissan", "Opel", "Peugeot", "Renault", 
        "Seat", "Skoda", "Toyota", "Volkswagen", "Autre"
      ],
      required: true
    },
    {
      name: "model",
      type: "text",
      label: "Modèle",
      placeholder: "Ex: Golf, 308, Clio...",
      required: true
    },
    {
      name: "year",
      type: "number",
      label: "Année",
      placeholder: "Ex: 2020",
      min: 1900,
      max: new Date().getFullYear(),
      required: true
    },
    {
      name: "mileage",
      type: "number",
      label: "Kilométrage (km)",
      placeholder: "Ex: 50000",
      min: 0,
      required: true
    },
    {
      name: "fuelType",
      type: "select",
      label: "Type de carburant",
      options: ["Essence", "Diesel", "Électrique", "Hybride", "GPL", "Autre"],
      required: true
    },
    {
      name: "transmission",
      type: "select",
      label: "Transmission",
      options: ["Manuelle", "Automatique", "Semi-automatique"],
      required: false
    },
    {
      name: "color",
      type: "text",
      label: "Couleur",
      placeholder: "Ex: Noir, Blanc, Rouge...",
      required: false
    }
  ],

  // Sous-catégories pour Clothing
  Clothing: [
    {
      name: "type",
      type: "select",
      label: "Type de vêtement",
      options: [
        "T-shirt", "Chemise", "Pull", "Veste", "Manteau", 
        "Pantalon", "Jean", "Short", "Jupe", "Robe", 
        "Chaussures", "Accessoire", "Autre"
      ],
      required: true
    },
    {
      name: "gender",
      type: "select",
      label: "Genre",
      options: ["Homme", "Femme", "Unisexe", "Enfant"],
      required: true
    },
    {
      name: "size",
      type: "select",
      label: "Taille",
      options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Autre"],
      required: true
    },
    {
      name: "color",
      type: "text",
      label: "Couleur",
      placeholder: "Ex: Noir, Blanc, Rouge...",
      required: true
    },
    {
      name: "material",
      type: "text",
      label: "Matériau",
      placeholder: "Ex: Coton, Laine, Polyester...",
      required: false
    },
    {
      name: "condition",
      type: "select",
      label: "État",
      options: ["Neuf avec étiquette", "Neuf sans étiquette", "Très bon état", "Bon état", "État moyen"],
      required: true
    },
    {
      name: "brand",
      type: "select",
      label: "Marque",
      options: ["Zara", "H&M", "Mango", "Pull & Bear", "Bershka", "Nike", "Adidas", "Puma", "Autre"],
      required: false
    }
  ],

  // Sous-catégories pour Furniture
  Furniture: [
    {
      name: "type",
      type: "select",
      label: "Type de meuble",
      options: [
        "Canapé", "Fauteuil", "Table", "Chaise", "Lit", "Armoire", 
        "Commode", "Étagère", "Bureau", "Meuble TV", "Table basse", 
        "Bibliothèque", "Cuisine", "Salle de bain", "Jardin", "Autre"
      ],
      required: true
    },
    {
      name: "material",
      type: "select",
      label: "Matériau principal",
      options: ["Bois", "Métal", "Verre", "Plastique", "Tissu", "Cuir", "MDF/Aggloméré", "Marbre", "Autre"],
      required: true
    },
    {
      name: "color",
      type: "text",
      label: "Couleur",
      placeholder: "Ex: Noir, Blanc, Bois naturel...",
      required: true
    },
    {
      name: "dimensions",
      type: "text",
      label: "Dimensions (LxlxH en cm)",
      placeholder: "Ex: 200x80x75",
      required: false
    },
    {
      name: "age",
      type: "select",
      label: "Âge du meuble",
      options: ["Moins d'1 an", "1-3 ans", "3-5 ans", "5-10 ans", "Plus de 10 ans", "Vintage/Ancien"],
      required: false
    },
    {
      name: "condition",
      type: "select",
      label: "État",
      options: ["Neuf", "Très bon état", "Bon état", "État moyen", "À restaurer"],
      required: true
    },
    {
      name: "assembly",
      type: "select",
      label: "Montage",
      options: ["Déjà monté", "À monter", "Partiellement monté"],
      required: false
    },
    {
      name: "brand",
      type: "select",
      label: "Marque",
      options: ["IKEA", "Conforama", "Maisons du Monde", "BUT", "Alinéa", "Autre"],
      required: false
    }
  ],
  
  // Sous-catégories pour Electronics
  Electronics: [
    {
      name: "type",
      type: "select",
      label: "Type d'appareil",
      options: [
        "Smartphone", "Tablette", "Ordinateur portable", "Ordinateur de bureau", 
        "TV", "Audio", "Photo/Vidéo", "Console de jeux", "Accessoires", "Autre"
      ],
      required: true
    },
    {
      name: "brand",
      type: "select",
      label: "Marque",
      options: [
        "Apple", "Samsung", "Sony", "LG", "Huawei", "Xiaomi", "HP", 
        "Dell", "Lenovo", "Asus", "Acer", "Microsoft", "Nintendo", "Autre"
      ],
      required: true
    },
    {
      name: "model",
      type: "text",
      label: "Modèle",
      placeholder: "Ex: iPhone 14, Galaxy S23...",
      required: true
    },
    {
      name: "age",
      type: "select",
      label: "Âge",
      options: ["Moins de 6 mois", "6-12 mois", "1-2 ans", "2-3 ans", "Plus de 3 ans"],
      required: true
    },
    {
      name: "condition",
      type: "select",
      label: "État",
      options: ["Neuf", "Comme neuf", "Très bon état", "Bon état", "État moyen"],
      required: true
    },
    {
      name: "storage",
      type: "select",
      label: "Stockage",
      options: ["16 Go", "32 Go", "64 Go", "128 Go", "256 Go", "512 Go", "1 To", "Plus de 1 To"],
      required: false
    },
    {
      name: "color",
      type: "text",
      label: "Couleur",
      placeholder: "Ex: Noir, Blanc, Or...",
      required: false
    }
  ],
  
  // Sous-catégories pour Properties
  Properties: [
    {
      name: "propertyType",
      type: "select",
      label: "Type de bien",
      options: [
        "Appartement", "Maison", "Villa", "Studio", "Duplex", 
        "Loft", "Terrain", "Local commercial", "Bureau", "Autre"
      ],
      required: true
    },
    {
      name: "rooms",
      type: "number",
      label: "Nombre de pièces",
      placeholder: "Ex: 3",
      min: 1,
      required: true
    },
    {
      name: "area",
      type: "number",
      label: "Surface (m²)",
      placeholder: "Ex: 80",
      min: 1,
      required: true
    },
    {
      name: "transactionType",
      type: "select",
      label: "Type de transaction",
      options: ["Vente", "Location", "Location saisonnière"],
      required: true
    },
    {
      name: "features",
      type: "select",
      label: "Caractéristiques",
      options: [
        "Balcon", "Terrasse", "Jardin", "Piscine", "Garage", 
        "Parking", "Ascenseur", "Meublé", "Vue sur mer", "Climatisation"
      ],
      required: false
    },
    {
      name: "yearBuilt",
      type: "number",
      label: "Année de construction",
      placeholder: "Ex: 2010",
      min: 1800,
      max: new Date().getFullYear(),
      required: false
    },
    {
      name: "floor",
      type: "number",
      label: "Étage",
      placeholder: "Ex: 3",
      min: 0,
      required: false
    },
    {
      name: "bathrooms",
      type: "number",
      label: "Salles de bain",
      placeholder: "Ex: 2",
      min: 0,
      required: false
    }
  ],
  
  // Sous-catégories pour Jobs
  Jobs: [
    {
      name: "jobType",
      type: "select",
      label: "Type d'emploi",
      options: [
        "CDI", "CDD", "Intérim", "Stage", "Alternance", 
        "Freelance", "Temps partiel", "Temps plein", "Autre"
      ],
      required: true
    },
    {
      name: "sector",
      type: "select",
      label: "Secteur d'activité",
      options: [
        "Informatique", "Finance", "Santé", "Éducation", 
        "Commerce", "Industrie", "Construction", "Transport", 
        "Restauration", "Tourisme", "Autre"
      ],
      required: true
    },
    {
      name: "experience",
      type: "select",
      label: "Expérience requise",
      options: [
        "Débutant", "1-2 ans", "3-5 ans", "5-10 ans", "Plus de 10 ans"
      ],
      required: true
    },
    {
      name: "education",
      type: "select",
      label: "Niveau d'études",
      options: [
        "Bac", "Bac+2", "Bac+3", "Bac+5", "Doctorat", "Formation professionnelle", "Autre"
      ],
      required: false
    },
    {
      name: "salary",
      type: "text",
      label: "Salaire proposé",
      placeholder: "Ex: 35000-45000 TND/an",
      required: false
    },
    {
      name: "location",
      type: "text",
      label: "Lieu de travail",
      placeholder: "Ex: Tunis centre, Sousse...",
      required: true
    },
    {
      name: "workMode",
      type: "select",
      label: "Mode de travail",
      options: ["Sur site", "Hybride", "Télétravail"],
      required: false
    },
    {
      name: "company",
      type: "text",
      label: "Entreprise",
      placeholder: "Ex: Nom de l'entreprise",
      required: false
    }
  ],
  
  // Sous-catégories pour Hobby
  Hobby: [
    {
      name: "hobbyType",
      type: "select",
      label: "Type de loisir",
      options: [
        "Sports", "Musique", "Art", "Collection", "Jeux", 
        "Livres", "Films", "Jardin", "Cuisine", "Autre"
      ],
      required: true
    },
    {
      name: "condition",
      type: "select",
      label: "État",
      options: [
        "Neuf", "Comme neuf", "Très bon état", "Bon état", "État moyen", "À restaurer"
      ],
      required: true
    },
    {
      name: "brand",
      type: "text",
      label: "Marque",
      placeholder: "Ex: Yamaha, Nintendo, Nike...",
      required: false
    },
    {
      name: "age",
      type: "select",
      label: "Âge",
      options: [
        "Moins de 1 mois", "1-6 mois", "6-12 mois", "1-2 ans", "2-5 ans", "Plus de 5 ans"
      ],
      required: false
    },
    {
      name: "specificType",
      type: "select",
      label: "Type spécifique",
      options: [
        "Instrument de musique", "Équipement sportif", "Jeu de société", 
        "Jeu vidéo", "Console", "Livre", "DVD/Blu-ray", "Matériel d'art", "Autre"
      ],
      required: false
    },
    {
      name: "material",
      type: "text",
      label: "Matériau",
      placeholder: "Ex: Bois, Plastique, Métal...",
      required: false
    }
  ],
  
  // Sous-catégories pour Services
  Services: [
    {
      name: "serviceType",
      type: "select",
      label: "Type de service",
      options: [
        "Cours particuliers", "Aide à domicile", "Jardinage", "Bricolage", 
        "Informatique", "Santé et bien-être", "Ménage", "Déménagement", 
        "Transport", "Événementiel", "Cours de langue", "Autre"
      ],
      required: true
    },
    {
      name: "experience",
      type: "select",
      label: "Expérience",
      options: [
        "Débutant", "1-2 ans", "3-5 ans", "5-10 ans", "Plus de 10 ans"
      ],
      required: true
    },
    {
      name: "availability",
      type: "select",
      label: "Disponibilité",
      options: [
        "Semaine", "Week-end", "Soir", "Journée", "Flexible", "Sur rendez-vous"
      ],
      required: true
    },
    {
      name: "pricing",
      type: "select",
      label: "Mode de tarification",
      options: [
        "À l'heure", "Forfait", "Par séance", "À négocier", "Gratuit"
      ],
      required: true
    },
    {
      name: "location",
      type: "select",
      label: "Lieu",
      options: [
        "À domicile", "En ligne", "En extérieur", "Dans un local", "Flexible"
      ],
      required: false
    },
    {
      name: "certification",
      type: "text",
      label: "Certification/Diplôme",
      placeholder: "Ex: Diplôme d'État, Certification...",
      required: false
    }
  ],
  
  // Sous-catégories pour Animals
  Animals: [
    {
      name: "animalType",
      type: "select",
      label: "Type d'animal",
      options: [
        "Chien", "Chat", "Oiseau", "Poisson", "Reptile", 
        "Rongeur", "Ferme", "Cheval", "Autre"
      ],
      required: true
    },
    {
      name: "breed",
      type: "text",
      label: "Race",
      placeholder: "Ex: Berger allemand, Siamois...",
      required: false
    },
    {
      name: "age",
      type: "select",
      label: "Âge",
      options: [
        "Bébé", "Jeune", "Adulte", "Senior"
      ],
      required: true
    },
    {
      name: "gender",
      type: "select",
      label: "Genre",
      options: [
        "Mâle", "Femelle"
      ],
      required: true
    },
    {
      name: "vaccinated",
      type: "select",
      label: "Vaccination",
      options: [
        "Vacciné", "Non vacciné", "En cours"
      ],
      required: false
    },
    {
      name: "neutered",
      type: "select",
      label: "Stérilisé/Castré",
      options: [
        "Oui", "Non"
      ],
      required: false
    },
    {
      name: "purebreed",
      type: "select",
      label: "Race pure",
      options: [
        "Oui", "Non", "Croisé"
      ],
      required: false
    }
  ]
};

/**
 * Récupère les sous-catégories associées à une catégorie spécifique depuis Firestore
 * @param {string} categoryName - Le nom de la catégorie
 * @returns {Promise<Array>} - Tableau des sous-catégories
 */
export const getSubcategoriesFromFirestore = async (categoryName) => {
  try {
    if (!categoryName) return [];
    
    const db = firebase.firestore();
    const querySnapshot = await db.collection('Subcategory')
      .where('categoryName', '==', categoryName)
      .get();
    
    const subcategories = [];
    
    querySnapshot.forEach((doc) => {
      // Récupère les données du document et ajoute l'ID
      subcategories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Trier les sous-catégories par ordre alphabétique si nécessaire
    subcategories.sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });
    
    return subcategories;
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-catégories:', error);
    return [];
  }
};

/**
 * Vérifie si une sous-catégorie existe déjà pour une valeur donnée
 * @param {string} categoryName - Le nom de la catégorie
 * @param {string} subcategoryName - Le nom de la sous-catégorie
 * @returns {Promise<boolean>} - True si elle existe, false sinon
 */
export const checkSubcategoryExists = async (categoryName, subcategoryName) => {
  try {
    const db = firebase.firestore();
    const querySnapshot = await db.collection('Subcategory')
      .where('categoryName', '==', categoryName)
      .where('name', '==', subcategoryName)
      .get();
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erreur lors de la vérification de sous-catégorie:', error);
    return false;
  }
};

/**
 * Récupère toutes les sous-catégories disponibles dans Firestore
 * @returns {Promise<Array>} - Tableau de toutes les sous-catégories
 */
export const getAllSubcategories = async () => {
  try {
    const db = firebase.firestore();
    const querySnapshot = await db.collection('Subcategory').get();
    const subcategories = [];
    
    querySnapshot.forEach((doc) => {
      subcategories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return subcategories;
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les sous-catégories:', error);
    return [];
  }
};

// Fonction pour initialiser les sous-catégories
export const runInitialization = async () => {
  try {
    const db = firebase.firestore();
    
    // Vérifier si les sous-catégories existent déjà
    const snapshot = await db.collection('Subcategory').get();
    
    if (!snapshot.empty) {
      console.log('Les sous-catégories existent déjà dans Firestore');
      return { 
        success: false, 
        message: 'Les sous-catégories existent déjà dans Firestore'
      };
    }
    
    // Utiliser un batch pour ajouter toutes les sous-catégories en une seule opération
    const batch = db.batch();
    let count = 0;
    
    // Pour chaque catégorie
    Object.entries(subcategories).forEach(([categoryName, subcategoryList]) => {
      // Pour chaque sous-catégorie
      subcategoryList.forEach((subcategory, index) => {
        const docRef = db.collection('Subcategory').doc();
        batch.set(docRef, {
          ...subcategory,
          categoryName,
          order: index,
          createdAt: new Date().toISOString()
        });
        count++;
      });
    });
    
    // Exécuter le batch
    await batch.commit();
    console.log(`${count} sous-catégories ont été initialisées dans Firestore`);
    
    return { 
      success: true, 
      count: count 
    };
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des sous-catégories:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Fonction helper locale pour obtenir les sous-catégories d'une catégorie
export const getSubcategories = (category) => {
  return subcategories[category] || [];
};