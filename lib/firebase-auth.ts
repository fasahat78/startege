/**
 * Firebase Authentication Utilities
 * Client-side authentication helpers
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  User,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Send email verification
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  
  return userCredential;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Send email verification
 */
export async function verifyEmail(user: User): Promise<void> {
  return sendEmailVerification(user);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Get ID token (for API requests)
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  // Request additional scopes if needed
  provider.addScope('profile');
  provider.addScope('email');
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with Apple
 */
export async function signInWithApple(): Promise<UserCredential> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with Google using redirect (for mobile/redirect flow)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  return signInWithRedirect(auth, provider);
}

/**
 * Sign in with Apple using redirect (for mobile/redirect flow)
 */
export async function signInWithAppleRedirect(): Promise<void> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithRedirect(auth, provider);
}

/**
 * Handle redirect result (call this after redirect-based sign-in)
 */
export async function handleRedirectResult(): Promise<UserCredential | null> {
  return getRedirectResult(auth);
}

