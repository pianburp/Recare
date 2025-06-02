import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel,
  IonMenuToggle,
  IonAvatar,
  IonText,
  IonFooter,
  IonButton,
  IonSpinner,
  MenuController,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  timeOutline, 
  notificationsOutline, 
  giftOutline, 
  logOutOutline,
  homeOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

interface UserProfile {
  fullName: string;
  email: string;
  profilePicture?: string;
}

@Component({
  selector: 'app-elderly-sidemenu',
  templateUrl: './elderly-sidemenu.component.html',
  styleUrls: ['./elderly-sidemenu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
    IonAvatar,
    IonText,
    IonFooter,
    IonButton,
    IonSpinner
  ]
})
export class ElderlySidemenuComponent implements OnInit {
  userProfile: UserProfile = {
    fullName: 'Loading...',
    email: '',
    profilePicture: ''
  };
  
  isLoading = false;
  currentYear = new Date().getFullYear();

  menuItems = [
    {
      title: 'Home',
      url: '/elderly/home',
      icon: 'home-outline',
      color: 'primary'
    },
    {
      title: 'My Profile',
      url: '/elderly/profile',
      icon: 'person-outline',
      color: 'primary'
    },
    {
      title: 'Care History',
      url: '/elderly/history',
      icon: 'time-outline',
      color: 'tertiary'
    },
    {
      title: 'Notifications',
      url: '/elderly/notifications',
      icon: 'notifications-outline',
      color: 'warning',
      badge: 0 // You can update this dynamically
    },
    {
      title: 'Rewards',
      url: '/elderly/reward',
      icon: 'gift-outline',
      color: 'success'
    }
  ];

  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private menuController = inject(MenuController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  constructor() {
    // Register icons
    addIcons({ 
      personOutline, 
      timeOutline, 
      notificationsOutline, 
      giftOutline, 
      logOutOutline,
      homeOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        try {
          const userData = await this.firestoreService.getUserByUid(user.uid);
          if (userData) {
            this.userProfile = {
              fullName: userData.fullName || 'User',
              email: userData.email || user.email || '',
              profilePicture: userData.profilePicture || '/assets/avatar-placeholder.jpg'
            };
          } else {
            // Fallback to auth data if Firestore data not found
            this.userProfile = {
              fullName: user.displayName || 'User',
              email: user.email || '',
              profilePicture: user.photoURL || '/assets/avatar-placeholder.jpg'
            };
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Use auth data as fallback
          this.userProfile = {
            fullName: user.displayName || 'User',
            email: user.email || '',
            profilePicture: user.photoURL || '/assets/avatar-placeholder.jpg'
          };
        }
      }
    });
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          handler: async () => {
            await this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  private async performLogout() {
    const loading = await this.loadingController.create({
      message: 'Logging out...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.isLoading = true;
      await this.authService.signOut();
      await this.menuController.close(); // Close the menu
      await this.showSuccessToast('Logged out successfully');
      await this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
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