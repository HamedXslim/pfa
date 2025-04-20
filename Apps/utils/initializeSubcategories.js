import { getFirestore, collection, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

// Sous-catégories pour chaque catégorie
const subcategories = {
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
    }
  ]
};

// Fonction pour initialiser les sous-catégories dans Firestore
export const initializeSubcategories = async () => {
  const db = getFirestore(app);
  
  try {
    console.log("Début de l'initialisation des sous-catégories...");
    
    // Utiliser un batch pour ajouter toutes les sous-catégories en une seule opération
    const batch = writeBatch(db);
    const subcategoryRef = collection(db, 'Subcategory');
    
    // Vérifier si des sous-catégories existent déjà
    const existingQuery = await getDocs(subcategoryRef);
    if (!existingQuery.empty) {
      console.log("Des sous-catégories existent déjà. Suppression annulée pour éviter les doublons.");
      return { success: false, message: "Des sous-catégories existent déjà." };
    }
    
    // Pour chaque catégorie
    let count = 0;
    Object.entries(subcategories).forEach(([categoryName, subcategoryList]) => {
      // Pour chaque sous-catégorie
      subcategoryList.forEach((subcategory, index) => {
        const docRef = doc(subcategoryRef);
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
    console.log(`${count} sous-catégories ont été initialisées avec succès dans Firestore.`);
    
    return { success: true, count };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des sous-catégories:", error);
    return { success: false, error: error.message };
  }
};

// Fonction pour exécuter l'initialisation
export const runInitialization = async () => {
  try {
    const result = await initializeSubcategories();
    console.log("Résultat de l'initialisation:", result);
    return result;
  } catch (error) {
    console.error("Erreur lors de l'exécution de l'initialisation:", error);
    return { success: false, error: error.message };
  }
};

// Exporter les sous-catégories pour utilisation locale
export { subcategories }; 