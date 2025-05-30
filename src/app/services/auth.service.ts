import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user, sendPasswordResetEmail, sendEmailVerification } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  user$ = user(this.auth);

  async signIn(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string) {
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signOut() {
    return await signOut(this.auth);
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  async sendEmailVerification(user: any) {
    return await sendEmailVerification(user);
  }

  // Helper method to check if current user's email is verified
  isEmailVerified(): boolean {
    return this.auth.currentUser?.emailVerified || false;
  }

  // Helper method to get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }
}