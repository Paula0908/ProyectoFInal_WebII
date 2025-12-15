<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Instalación

Instalar nestjs

```bash
npm install -g @nestjs/cli
yarn add global @nestjs/cli
```

## Configuración del proyecto

```bash
nest new [nombre-del-proyecto]
yarn install
```

## Correr el proyecto

```bash

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Instalación de extensiones

Instalar este paquete de extensiones NestJS-Essentials Gydunhn

## Configurar Prettier

En el archivo .prettierrc, realizar las siguientes modificaciones

```
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "printWidth": 180,
  "tabWidth": 4,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

## Configurar ESLinter

En el archivo eslint.config.msj agregar en rules lo siguiente

```
rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          tabWidth: 4,
          singleQuote: false,
        },
      ],
    },
```

## Correr Linter

```
yarn lint
```
