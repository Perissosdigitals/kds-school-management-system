# 🚀 Guide de Migration Cloudflare (D1 & R2)

Ce guide explique comment utiliser le nouveau script de migration pour transférer vos données locales (PostgreSQL + fichiers locaux) vers Cloudflare (D1 + R2).

## Prérequis

1. **Bucket R2**: Vous devez avoir un bucket R2 nommé `ksp-documents` dans votre compte Cloudflare.
   ```bash
   npx wrangler r2 bucket create ksp-documents
   ```

2. **Base D1**: Identifiez votre base D1 (actuellement configurée à `d293f4d0-fb4d-4f99-a45c-783fcd374a6e`).

3. **Application Locale**: Votre Backend local doit être en cours d'exécution sur le port 3001.

## Étapes de Migration

### 1. Générer les scripts de migration
Exécutez le script TypeScript pour extraire les données et préparer les commandes d'upload.
```bash
npx tsx scripts/migrate-to-cloudflare.ts
```
Ceci va générer deux fichiers :
- `upload_to_r2.sh`: Script pour uploader vos PDFs et photos vers R2.
- `cloudflare-migration.sql`: Script SQL pour importer vos données dans D1.

### 2. Transférer les fichiers vers R2
Exécutez le script d'upload généré.
```bash
chmod +x upload_to_r2.sh
./upload_to_r2.sh
```

### 3. Importer les données dans D1
Importez le SQL généré dans votre base Cloudflare D1.
```bash
npx wrangler d1 execute kds-school-db --remote --file=cloudflare-migration.sql
```

### 4. Déployer le nouveau Backend
Déployez la version mise à jour du Backend qui supporte R2.
```bash
cd backend && npx wrangler deploy && cd ..
```

## Vérification
Après la migration, accédez à votre version déployée et vérifiez :
- Que les photos des élèves s'affichent (elles sont maintenant servies via l'API mais stockées dans R2).
- Que les documents PDF peuvent être prévisualisés et téléchargés.
- Que les nouvelles données (classes, élèves) sont bien présentes.

---
**Note**: Ce processus peut être répété pour une mise à jour complète de la version déployée.
