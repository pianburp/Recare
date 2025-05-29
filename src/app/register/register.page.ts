import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';

interface PasswordStrength {
  level: number;
  percentage: number;
  text: string;
  class: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  userType: string = '';
  acceptTerms: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  // Password strength validation properties
  passwordStrength: PasswordStrength = {
    level: 0,
    percentage: 0,
    text: '',
    class: ''
  };

  hasMinLength: boolean = false;
  hasUppercase: boolean = false;
  hasLowercase: boolean = false;
  hasNumber: boolean = false;
  hasSpecialChar: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  constructor() {
    // Register the icons for eye toggle
    addIcons({ eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    // Check if user is already logged in
    this.authService.user$.subscribe(user => {
      if (user) {
        // User is already logged in, redirect based on their type
        this.router.navigate(['/elderly/profile']); // You can modify this based on user type
      }
    });
  }

  checkPasswordStrength() {
    const password = this.password;
    
    // Reset all checks
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Calculate strength level
    const checks = [
      this.hasMinLength,
      this.hasUppercase,
      this.hasLowercase,
      this.hasNumber,
      this.hasSpecialChar
    ];

    const metRequirements = checks.filter(check => check).length;
    
    if (password.length === 0) {
      this.passwordStrength = { level: 0, percentage: 0, text: '', class: '' };
    } else if (metRequirements <= 2) {
      this.passwordStrength = { 
        level: 1, 
        percentage: 25, 
        text: 'Weak - Please strengthen your password', 
        class: 'weak' 
      };
    } else if (metRequirements === 3) {
      this.passwordStrength = { 
        level: 2, 
        percentage: 50, 
        text: 'Fair - Consider adding more complexity', 
        class: 'fair' 
      };
    } else if (metRequirements === 4) {
      this.passwordStrength = { 
        level: 3, 
        percentage: 75, 
        text: 'Good - Almost there!', 
        class: 'good' 
      };
    } else {
      this.passwordStrength = { 
        level: 4, 
        percentage: 100, 
        text: 'Strong - Excellent password!', 
        class: 'strong' 
      };
    }
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isFormValid(): boolean {
    return (
      this.fullName.trim().length >= 2 &&
      this.isValidEmail(this.email) &&
      this.password.length >= 8 &&
      this.passwordStrength.level >= 3 && // Require at least "good" password
      this.passwordsMatch() &&
      this.userType !== '' &&
      this.acceptTerms
    );
  }

  async onRegister() {
    if (!this.isFormValid()) {
      this.showErrorToast('Please fill all fields correctly');
      return;
    }

    if (this.passwordStrength.level < 3) {
      this.showErrorToast('Please create a stronger password');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creating your account...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.isLoading = true;
      
      // Create user with Firebase Auth
      const userCredential = await this.authService.signUp(this.email, this.password);
      
      console.log('Registration successful:', userCredential.user);
      
      // TODO: Save additional user data (fullName, userType) to Firestore
      // You can implement this in your AuthService or create a UserService
      
      // Show success message
      await this.showSuccessToast('Account created successfully! Welcome to ReCare!');
      
      // Navigate based on user type
      const route = this.userType === 'elderly' ? '/elderly/profile' : '/caregiver/profile';
      await this.router.navigate([route]);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different types of Firebase auth errors
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please create a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      await this.showErrorAlert('Registration Failed', errorMessage);
      
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async goToLogin() {
    this.router.navigate(['/login']);
  }

  async openTerms() {
    const alert = await this.alertController.create({
      header: 'Terms & Conditions',
      message: 'Terms and conditions content would go here. This would typically be a longer document or link to a separate page.',
      buttons: ['Close']
    });
    await alert.present();
  }

  async openPrivacy() {
    const alert = await this.alertController.create({
      header: 'Privacy Policy',
      message: 'Privacy policy content would go here. This would typically be a longer document or link to a separate page.',
      buttons: ['Close']
    });
    await alert.present();
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