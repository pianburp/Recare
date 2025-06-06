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
  calendarOutline, 
  notificationsOutline, 
  walletOutline, 
  logOutOutline,
  homeOutline,
  chevronForwardOutline,
  peopleOutline,
  statsChartOutline,
  settingsOutline,
  starOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

interface UserProfile {
  fullName: string;
  email: string;
  profilePicture?: string;
}

@Component({
  selector: 'app-caregiver-sidemenu',
  templateUrl: './caregiver-sidemenu.component.html',
  styleUrls: ['./caregiver-sidemenu.component.scss'],
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
export class CaregiverSidemenuComponent implements OnInit {
  userProfile: UserProfile = {
    fullName: 'Loading...',
    email: '',
    profilePicture: ''
  };
  
  isLoading = false;
  currentYear = new Date().getFullYear();

  menuItems = [
    {
      title: 'Dashboard',
      url: '/caregiver/home',
      icon: 'home-outline',
      color: 'primary'
    },
    {
      title: 'My Profile',
      url: '/caregiver/profile',
      icon: 'person-outline',
      color: 'primary'
    },
    {
      title: 'Schedule',
      url: '/caregiver/schedule',
      icon: 'calendar-outline',
      color: 'secondary'
    },
    {
      title: 'My Clients',
      url: '/caregiver/clients',
      icon: 'people-outline',
      color: 'tertiary'
    },
    {
      title: 'Analytics',
      url: '/caregiver/analytics',
      icon: 'stats-chart-outline',
      color: 'success',
      description: 'Earnings, Reviews & Performance'
    },
    {
      title: 'Notifications',
      url: '/caregiver/notifications',
      icon: 'notifications-outline',
      color: 'warning',
      badge: 0 // You can update this dynamically
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
      calendarOutline, 
      notificationsOutline, 
      walletOutline, 
      logOutOutline,
      homeOutline,
      chevronForwardOutline,
      peopleOutline,
      statsChartOutline,
      settingsOutline,
      starOutline
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
              fullName: userData.fullName || 'Caregiver',
              email: userData.email || user.email || '',
              profilePicture: userData.profilePicture || '/assets/avatar-placeholder.jpg'
            };
          } else {
            // Fallback to auth data if Firestore data not found
            this.userProfile = {
              fullName: user.displayName || 'Caregiver',
              email: user.email || '',
              profilePicture: user.photoURL || '/assets/avatar-placeholder.jpg'
            };
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Use auth data as fallback
          this.userProfile = {
            fullName: user.displayName || 'Caregiver',
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
      
      // Close the menu first
      await this.menuController.close();
      
      // Sign out from auth service
      await this.authService.signOut();
      
      // Dismiss loading immediately after signOut
      await loading.dismiss();
      
      // Show success toast
      await this.showSuccessToast('Logged out successfully');
      
      // Navigate to login page
      await this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error('Logout error:', error);
      await loading.dismiss(); // Make sure to dismiss loading on error
      await this.showErrorToast('Failed to logout. Please try again.');
    } finally {
      this.isLoading = false;
      // Ensure loading is dismissed in case it wasn't already
      try {
        await loading.dismiss();
      } catch (dismissError) {
        // Loading might already be dismissed, ignore this error
        console.log('Loading controller already dismissed');
      }
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