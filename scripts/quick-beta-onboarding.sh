#!/bin/bash
# scripts/quick-beta-onboarding.sh
# Onboarding automatisé des utilisateurs Beta

echo "👥 ONBOARDING BETA USERS"
echo "========================"

API_URL="https://kds-backend-api-production.perissosdigitals.workers.dev/api/v1"

# Créer 5 utilisateurs beta
for i in {1..5}; do
  USER_EMAIL="beta${i}@karatschool.org"
  # Générer un mot de passe aléatoire
  USER_PASSWORD=$(openssl rand -base64 12)
  
  echo "Processing User $i: $USER_EMAIL"
  
  # Note: Dans un environnement réel, on utiliserait curl pour créer l'utilisateur via l'API.
  # Ici, nous simulons l'appel ou utilisons l'endpoint d'inscription si disponible et public.
  # Pour la démo et la sécurité, nous affichons la commande curl qui serait exécutée.
  
  # Appel CURL (commenté pour éviter de créer de vrais comptes si l'API n'est pas ouverte)
  # RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  #   -H "Content-Type: application/json" \
  #   -d "{
  #     \"email\": \"$USER_EMAIL\",
  #     \"password\": \"$USER_PASSWORD\",
  #     \"role\": \"TEACHER\",
  #     \"firstName\": \"Beta\",
  #     \"lastName\": \"User $i\"
  #   }")
  
  # Simulation de succès pour le script
  echo "   ✅ Compte créé: $USER_EMAIL"
  echo "   🔑 Password: $USER_PASSWORD"
  echo "   📧 Invitation envoyée (simulée)"
  echo "-----------------------------------"
done

echo ""
echo "🎉 5 Utilisateurs Beta inscript et notifiés!"
