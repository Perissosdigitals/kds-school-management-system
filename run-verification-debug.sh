#!/bin/bash
export BASE_URL="https://ksp-school-management.pages.dev"
export API_URL="https://kds-backend-api-production.perissosdigitals.workers.dev"
export ADMIN_EMAIL="supporteam@perissosdigital.com"
export ADMIN_PASSWORD="chr1$$t0u$$1s0"
export CI=1

echo "--- STARTING PLAYWRIGHT ---"
npx playwright test --project=cycle-students --reporter=line 2>&1
echo "--- PLAYWRIGHT FINISHED with exit code $? ---"
