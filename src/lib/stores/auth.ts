// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { auth } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

// Define a type for the user state
type UserState = User | null;

// Create a writable store for the user state
const user = writable<UserState>(null);

// Listen for authentication state changes
onAuthStateChanged(auth, (currentUser) => {
  user.set(currentUser);
});

export { user };
