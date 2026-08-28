import '@firebase/auth/dist/auth-public';

declare module 'firebase/auth' {
  export { getReactNativePersistence } from '@firebase/auth/dist/src/platform_react_native/persistence/react_native';
}