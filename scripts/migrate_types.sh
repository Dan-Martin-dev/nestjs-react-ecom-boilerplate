#!/bin/bash
# Script to help migrate type imports in the monorepo

echo "🔍 Scanning files for local type imports to migrate to @repo/shared..."

# Find TypeScript files that import from local type files
GREP_OPTIONS="--include=*.ts --include=*.tsx --exclude-dir=node_modules"

echo "📋 Finding imports from '../types/api'..."
grep -r $GREP_OPTIONS "from '../types/api'" ./apps

echo "📋 Finding imports from './types/api'..."
grep -r $GREP_OPTIONS "from './types/api'" ./apps

echo "📋 Finding direct imports from specific type files..."
grep -r $GREP_OPTIONS "from '.*types/.*.ts'" ./apps

echo "✅ Scan complete!"
echo ""
echo "⚠️  Manual migration required:"
echo "1. Replace local type imports with '@repo/shared'"
echo "2. For example: change \"import { Product } from '../types/api'\" to \"import { Product } from '@repo/shared'\""
echo ""
echo "📝 See packages/shared/TYPES_GUIDE.md for more information on using the shared types."
