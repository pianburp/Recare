import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';

// Interface for user data from Firestore
interface UserData {
  id?: string;
  uid: string;
  email: string;
  fullName: string;
  userType: 'elderly' | 'caregiver';
  isVerified: boolean;
  createdAt: any;
  updatedAt: any;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    // Register the icons for eye toggle - only once
    addIcons({ 
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });
  }

  ngOnInit() {
    // Check if user is already logged in and verified
    this.authService.user$.subscribe(async user => {
      if (user && user.emailVerified) {
        // User is already logged in and verified, redirect based on their type
        await this.redirectUserBasedOnType(user.uid);
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isFormValid(): boolean {
    return (
      this.isValidEmail(this.email) &&
      this.password.length > 0
    );
  }

  async onLogin() {
    if (!this.isFormValid()) {
      this.showErrorToast('Please fill all fields correctly');
      return;
    }
  
    const loading = await this.loadingController.create({
      message: 'Signing you in...',
      spinner: 'crescent'
    });
    await loading.present();
  
    try {
      this.isLoading = true;
      
      // Sign in with Firebase Auth
      const userCredential = await this.authService.signIn(this.email, this.password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Email not verified, show verification prompt
        await this.showEmailNotVerifiedAlert(userCredential.user);
        return;
      }
      
      console.log('Login successful:', userCredential.user);
      
      // Get user data from Firestore to determine user type
      await this.handleSuccessfulLogin(userCredential.user);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Incorrect email or password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      await this.showErrorAlert('Login Failed', errorMessage);
      
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  private async handleSuccessfulLogin(user: any) {
    try {
      // Get user profile data from Firestore
      const userData = await this.firestoreService.getUserByUid(user.uid) as UserData;
      
      if (userData && userData.uid) {
        // Update verification status in Firestore if needed
        if (!userData.isVerified && user.emailVerified) {
          await this.firestoreService.updateUserVerificationStatus(user.uid, true);
        }
        
        // Show success message with personalized greeting
        await this.showSuccessToast(`Welcome back, ${userData.fullName}!`);
        
        // Navigate based on user type
        await this.navigateBasedOnUserType(userData.userType, userData.fullName);
      } else {
        // User data not found in Firestore - this shouldn't happen normally
        console.error('User profile not found in Firestore');
        await this.showErrorAlert(
          'Profile Not Found', 
          'Your profile information could not be found. Please contact support or try registering again.'
        );
        await this.authService.signOut();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback: navigate to a default page if Firestore fails
      await this.showSuccessToast('Welcome back to ReCare!');
      await this.router.navigate(['/elderly/profile']); // Default fallback
    }
  }

  private async navigateBasedOnUserType(userType: string, fullName: string) {
    switch (userType) {
      case 'elderly':
        await this.router.navigate(['/elderly/profile']);
        break;
      case 'caregiver':
        await this.router.navigate(['/caregiver/profile']);
        break;
      default:
        console.error('Unknown user type:', userType);
        // Fallback to elderly profile if user type is unknown
        await this.router.navigate(['/elderly/profile']);
        await this.showErrorToast('Unknown user type. Redirected to default page.');
        break;
    }
  }

  private async redirectUserBasedOnType(uid: string) {
    try {
      const userData = await this.firestoreService.getUserByUid(uid) as UserData;
      if (userData && userData.userType) {
        await this.navigateBasedOnUserType(userData.userType, userData.fullName);
      } else {
        // Fallback if user data not found
        await this.router.navigate(['/elderly/profile']);
      }
    } catch (error) {
      console.error('Error redirecting user:', error);
      // Fallback navigation
      await this.router.navigate(['/elderly/profile']);
    }
  }

  private async showEmailNotVerifiedAlert(user: any) {
    const alert = await this.alertController.create({
      header: 'Email Not Verified',
      message: `
        <div style="text-align: center;">
          <p><strong>Please verify your email address</strong></p>
          <p>We sent a verification email to:</p>
          <p><strong>${user.email}</strong></p>
          <br>
          <p>Click the link in the email to verify your account before signing in.</p>
          <p style="font-size: 0.9em; color: #666; margin-top: 12px;">
            <em>Don't forget to check your spam folder if you don't see the email.</em>
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Resend Email',
          role: 'cancel',
          handler: () => {
            this.resendVerificationEmail(user);
          }
        },
        {
          text: 'OK',
          handler: () => {
            // Sign out the user since they're not verified
            this.authService.signOut();
          }
        }
      ],
      cssClass: 'verification-alert'
    });
    await alert.present();
  }
  
  private async resendVerificationEmail(user: any) {
    try {
      const loading = await this.loadingController.create({
        message: 'Sending verification email...',
        spinner: 'crescent'
      });
      await loading.present();

      await this.authService.sendEmailVerification(user);
      await loading.dismiss();
      
      await this.showSuccessToast('Verification email sent! Please check your inbox.');
      
      // Sign out the user
      await this.authService.signOut();
    } catch (error) {
      console.error('Error resending verification email:', error);
      await this.showErrorToast('Failed to resend verification email. Please try again.');
    }
  }

  async goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  async goToRegister() {
    this.router.navigate(['/register']);
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
    await toast.present();
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  private async showErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}