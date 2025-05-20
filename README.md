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

## Initialize Yawl

Must be called before any other Yawl method.

```ts
await yawl.init();
```

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

```ts
yawl.trackView({
  page: "page_name",
  title: "page_title",
  properties: {
    // additional properties
  },
});
```

### React Navigation

If you are using React Navigation, you can use the `yawl.setViewTracker()` to record the current screen name and params.
Based on [their documentation](https://reactnavigation.org/docs/5.x/screen-tracking/) you could :

```ts
export default () => {
  const navigationRef = useRef();
  const routeNameRef = useRef();
  ...
  // sets the view tracker so `yawl.trackView()` can be used anywhere
  yawl.setViewTracker(() => {
    const currentRoute = navigationRef?.current?.getCurrentRoute()
    return ({
      page: currentRoute.name,
      properties: currentRoute.params
    })
  })

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() =>
        // yawl.trackView() if the app is opened from a cold start
        (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
      }
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName) {
          // The line below uses the yawl.setViewTracker() setup to get the current screen name and params
          await yawl.trackView();
        }

        // Save the current route name for later comparison
        routeNameRef.current = currentRouteName;
      }}
    >
      {/* ... */}
    </NavigationContainer>
  );
};
```
