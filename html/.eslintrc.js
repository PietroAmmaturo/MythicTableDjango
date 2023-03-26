module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jest/globals": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:jest/recommended",
        "plugin:vue/recommended",
        "prettier/vue",
        //"plugin:@typescript-eslint/recommended",  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        //"prettier/@typescript-eslint",  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        "plugin:prettier/recommended",  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "vue-eslint-parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "parser": "babel-eslint",
        "sourceType": "module"
    },
    "plugins": [
        "import",
        "jest",
        "vue"
    ],
    "rules": {
        "import/no-unresolved": [2],
        "import/no-unused-modules": [2],
        "no-console": "off",
        "vue/attribute-hyphenation": [0],
        "vue/attributes-order": [0],
        "vue/component-name-in-template-casing": ["error", "PascalCase"],
        "vue/v-bind-style": [0],
        "vue/v-on-style": [0]
    },
    "settings": {
        "import/resolver": {
            "alias": {
                "map": [
                    ["@", "./src"]
                ],
                "extensions": [".js", ".vue", ".ts"],
            }
        }
    }
};
