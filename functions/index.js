const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialiser Firebase Admin SDK
admin.initializeApp();

// Cloud Function pour échanger le token Clerk contre un custom token Firebase
exports.exchangeClerkToken = functions.https.onCall(async (data) => {
  console.log("Received request for token exchange");

  // Vérifie si le token est présent dans différents formats possibles
  let clerkToken = null;

  if (data && data.clerkToken) {
    clerkToken = data.clerkToken;
    console.log("Token trouvé dans data.clerkToken");
  } else if (data && typeof data === "string") {
    clerkToken = data;
    console.log("Token trouvé directement dans data (string)");
  } else if (data && data.data && data.data.clerkToken) {
    clerkToken = data.data.clerkToken;
    console.log("Token trouvé dans data.data.clerkToken");
  }

  if (!clerkToken) {
    console.error("No clerkToken found in any expected format");
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Clerk token is required",
    );
  }

  console.log("Token found with length:", clerkToken.length);

  try {
    // Analyser manuellement le token pour extraire le sub
    const tokenParts = clerkToken.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // Décodez la partie payload
    const base64Payload = tokenParts[1];
    const padding = "=".repeat((4 - base64Payload.length % 4) % 4);
    const normalized = base64Payload
        .replace(/-/g, "+")
        .replace(/_/g, "/") + padding;

    const payload = JSON.parse(
        Buffer.from(normalized, "base64").toString(),
    );

    if (!payload.sub) {
      throw new Error("JWT is missing 'sub' claim");
    }

    const userId = payload.sub;
    console.log("Using user ID from JWT");

    const customToken = await admin.auth().createCustomToken(userId);
    console.log("Successfully created Firebase custom token");
    return {customToken};
  } catch (error) {
    console.error("Token exchange error:", error);
    throw new functions.https.HttpsError(
        "internal",
        `Failed to exchange token: ${error.message}`,
    );
  }
});
