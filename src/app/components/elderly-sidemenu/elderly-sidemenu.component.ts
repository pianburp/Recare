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
  chevronForwardOutline,
  calendarOutline
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
      title: 'Care Schedule',
      url: '/elderly/schedule',
      icon: 'calendar-outline',
      color: 'tertiary'
    },
    {
      title: 'Notifications',
      url: '/elderly/notifications',
      icon: 'notifications-outline',
      color: 'warning',
      badge: 0
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
    addIcons({ 
      personOutline, 
      calendarOutline, 
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
            this.userProfile = {
              fullName: user.displayName || 'User',
              email: user.email || '',
              profilePicture: user.photoURL || '/assets/avatar-placeholder.jpg'
            };
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
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
      
      await this.menuController.close();
      
      await this.authService.signOut();
      
      await loading.dismiss();
      
      await this.showSuccessToast('Logged out successfully');
      
      await this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error('Logout error:', error);
      await loading.dismiss();
      await this.showErrorToast('Failed to logout. Please try again.');
    } finally {
      this.isLoading = false;
      try {
        await loading.dismiss();
      } catch (dismissError) {
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