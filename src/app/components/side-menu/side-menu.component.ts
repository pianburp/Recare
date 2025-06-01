import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  IonAvatar,
  IonNote,
  IonButton,
  IonButtons,
  IonMenuToggle,
  IonFooter,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  timeOutline, 
  giftOutline, 
  settingsOutline,
  logOutOutline,
  personOutline,
  notificationsOutline,
  helpCircleOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { LoadingController, ToastController, AlertController, MenuController } from '@ionic/angular';

interface MenuPage {
  title: string;
  url: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [
    IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonIcon, IonLabel, IonAvatar, IonNote, IonButton,
    IonButtons, IonMenuToggle, IonFooter, IonBadge,
    CommonModule
  ]
})
export class SideMenuComponent implements OnInit {
  currentUser: any = null;
  userProfile: any = {
    fullName: '',
    email: '',
    profilePicture: '',
    kycStatus: 'pending'
  };

  // Main navigation pages
  appPages: MenuPage[] = [
    {
      title: 'Home',
      url: '/elderly/home',
      icon: 'home-outline'
    },
    {
      title: 'History',
      url: '/elderly/history',
      icon: 'time-outline'
    },
    {
      title: 'Rewards',
      url: '/elderly/rewards',
      icon: 'gift-outline',
      badge: 3 // Example badge for new rewards
    }
  ];

  // Secondary pages
  secondaryPages: MenuPage[] = [
    {
      title: 'Profile',
      url: '/elderly/profile',
      icon: 'person-outline'
    },
    {
      title: 'Notifications',
      url: '/elderly/notifications',
      icon: 'notifications-outline',
      badge: 2 // Example notification count
    },
    {
      title: 'Settings',
      url: '/elderly/settings',
      icon: 'settings-outline'
    },
    {
      title: 'Help & Support',
      url: '/elderly/help',
      icon: 'help-circle-outline'
    }
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private menuController = inject(MenuController);

  constructor() {
    // Register icons
    addIcons({ 
      homeOutline, timeOutline, giftOutline, settingsOutline,
      logOutOutline, personOutline, notificationsOutline,
      helpCircleOutline, shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile.email = user.email;
        
        // Load profile data from localStorage or Firestore
        this.loadUserProfile(user.uid);
      }
    });
  }

  loadUserProfile(uid: string) {
    try {
      // Try to load from localStorage first
      const savedProfile = localStorage.getItem(`elderlyProfile_${uid}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        this.userProfile = {
          fullName: profile.fullName || 'Complete your profile',
          email: profile.email || this.currentUser?.email || '',
          profilePicture: profile.profilePicture || '',
          kycStatus: profile.kycStatus || 'pending'
        };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async navigateToPage(page: MenuPage) {
    if (page.disabled) {
      await this.showInfoToast(`${page.title} coming soon!`);
      return;
    }

    try {
      // Close menu first
      await this.menuController.close();
      
      // Navigate to page
      await this.router.navigate([page.url]);
    } catch (error) {
      console.error('Navigation error:', error);
      await this.showErrorToast('Navigation failed. Please try again.');
    }
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

  async performLogout() {
    const loading = await this.loadingController.create({
      message: 'Logging out...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Close menu
      await this.menuController.close();
      
      // Sign out
      await this.authService.signOut();
      
      // Show success message
      await this.showSuccessToast('Logged out successfully');
      
      // Navigate to login
      await this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      await this.showErrorToast('Failed to logout. Please try again.');
    } finally {
      await loading.dismiss();
    }
  }

  getKycStatusColor(): string {
    switch (this.userProfile.kycStatus) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'submitted': return 'warning';
      default: return 'medium';
    }
  }

  getKycStatusText(): string {
    switch (this.userProfile.kycStatus) {
      case 'approved': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'submitted': return 'Under Review';
      default: return 'Pending';
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

  private async showInfoToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'primary',
      icon: 'information-circle-outline'
    });
    await toast.present();
  }
}