![NPM Version](https://img.shields.io/npm/v/@edulib-france/expo-yawl)

# @edulib-france/expo-yawl

Yawl for React Native

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install @edulib-france/expo-yawl
```

### Configure for iOS

Run `npx pod-install` after installing the npm package.

# Configuration

```ts
export const yawl = new Yawl({
  apiKey: "key",
  env: "staging | prod", // default is prod
});
```

# Usage

## Track Events

```ts
yawl.track({
  name: string,
  ean?: string,
  establishment_account_id?: string,
  properties?: Record<string, unknown>,
  user_type?: string
});
```

## Track Views

We still need to find the best way to get the view name in React Native. For now, we can use the `page` property to set the view name.

```ts
yawl.trackView({
  page: "page_name",
});
```
