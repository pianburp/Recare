import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonButtons, 
  IonIcon, 
  IonSpinner 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service'; 
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonButtons, 
    IonIcon, 
    IonSpinner,
    CommonModule, 
    FormsModule
  ]
})
export class ProfilePage implements OnInit {
  isLoading: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  constructor() {
    // Register the logout icon
    addIcons({ logOutOutline });
  }

  ngOnInit() {
  }

  async logout() {
    const loading = await this.loadingController.create({
      message: 'Logging out...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.isLoading = true;
      
      // Sign out using AuthService
      await this.authService.signOut();
      
      // Show success message
      await this.showSuccessToast('Logged out successfully');
      
      // Navigate to login page
      await this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Show error message
      await this.showErrorToast('Failed to logout. Please try again.');
      
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
    await toast.present();
  }
}