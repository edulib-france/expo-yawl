# @edulib-france/expo-yawl

Yawl for React Native

# TODO: API documentation

- [Documentation for the latest stable release](https://docs.expo.dev/versions/latest/sdk/@edulib-france/yawl/)
- [Documentation for the main branch](https://docs.expo.dev/versions/unversioned/sdk/@edulib-france/yawl/)

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install @edulib-france/expo-yawl
```

### Configure for Android




### Configure for iOS

Run `npx pod-install` after installing the npm package.

# Configuration
```ts
export const yawl = new Yawl({
  apiKey: 'key',
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

## Track  Views
```ts
yawl.trackView({
  // Auto values
  name: '$view',
  url: window.location.href,
  title: document.title,
  page: config.page || window.location.pathname;
});
```