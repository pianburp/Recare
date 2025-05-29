import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user } from '@angular/fire/auth';

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
}