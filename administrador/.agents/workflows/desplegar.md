---
description: Despliega ultimos cambios a railway
---

name: Desplegar a Railway (Verificación)

on:
  push:
    branches:
      - main # O la rama que uses para producción en Railway

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Instalar pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9 # O la versión exacta de tu pnpm

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          cache-dependency-path: administrador/pnpm-lock.yaml

      - name: Instalar Dependencias
        run: |
          cd administrador
          pnpm install --frozen-lockfile

      - name: Ejecutar Build de Prueba
        run: |
          cd administrador
          pnpm run build
