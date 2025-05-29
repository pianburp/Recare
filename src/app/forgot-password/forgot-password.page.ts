import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline, checkmarkCircle, refreshOutline, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ForgotPasswordPage implements OnInit {
  email: string = '';
  isLoading: boolean = false;
  emailSent: boolean = false;
  resendCooldown: number = 0;
  private resendTimer: any;

  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    // Register the icons
    addIcons({ 
      'mail-outline': mailOutline,
      'checkmark-circle': checkmarkCircle,
      'refresh-outline': refreshOutline,
      'arrow-back-outline': arrowBackOutline
    });
  }

  ngOnInit() {
    // Check if user is already logged in
    this.authService.user$.subscribe(user => {
      if (user) {
        // User is already logged in, redirect to profile
        this.router.navigate(['/elderly/profile']);
      }
    });
  }

  ngOnDestroy() {
    // Clean up timer if component is destroyed
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  async onResetPassword() {
    if (!this.email) {
      this.showErrorToast('Please enter your email address');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showErrorToast('Please enter a valid email address');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sending reset email...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.isLoading = true;
      
      // Send password reset email using Firebase Auth
      await this.authService.resetPassword(this.email);
      
      console.log('Password reset email sent to:', this.email);
      
      // Show success state
      this.emailSent = true;
      
      // Show success toast
      await this.showSuccessToast('Password reset email sent successfully!');
      
      // Start resend cooldown (60 seconds)
      this.startResendCooldown();
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle different types of Firebase auth errors
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      await this.showErrorAlert('Reset Failed', errorMessage);
      
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async resendEmail() {
    if (this.resendCooldown > 0) {
      return;
    }

    try {
      // Send password reset email again
      await this.authService.resetPassword(this.email);
      
      // Show success message
      await this.showSuccessToast('Reset email sent again!');
      
      // Restart cooldown
      this.startResendCooldown();
      
    } catch (error: any) {
      console.error('Resend error:', error);
      await this.showErrorToast('Failed to resend email. Please try again.');
    }
  }

  async goToLogin() {
    this.router.navigate(['/login']);
  }

  private startResendCooldown() {
    this.resendCooldown = 60; // 60 seconds cooldown
    
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
        this.resendTimer = null;
      }
    }, 1000);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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
      duration: 3000,
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