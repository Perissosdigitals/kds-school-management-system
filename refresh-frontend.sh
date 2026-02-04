#!/bin/bash

echo "🔄 Rafraîchissement du Frontend (si nécessaire)"
echo "=============================================="
echo ""

# Vérifier si Vite tourne
if ps aux | grep -E "vite.*5173" | grep -v grep > /dev/null; then
    echo "✅ Vite tourne déjà sur port 5173"
    echo ""
    echo "📝 Les modifications TypeScript/React sont automatiquement"
    echo "   rechargées grâce au Hot Module Replacement (HMR)"
    echo ""
    echo "🎯 ACTION REQUISE:"
    echo "   1. Ouvrez votre navigateur sur http://localhost:5173"
    echo "   2. Appuyez sur F5 (ou Cmd+R) pour rafraîchir"
    echo "   3. Ou faites Cmd+Shift+R pour un Hard Refresh"
    echo ""
    echo "✅ C'est tout! Les modifications sont déjà actives."
else
    echo "⚠️  Vite ne tourne pas. Démarrage..."
    npm run dev
fi

echo ""
echo "Berakhot! 🙏"
