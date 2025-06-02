import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline,
  medicalOutline,
  peopleOutline,
  calendarOutline,
  starOutline,
  heartOutline,
  callOutline, checkmarkCircle, calendar } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { ElderlySidemenuComponent } from '../../components/elderly-sidemenu/elderly-sidemenu.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonLabel,
    CommonModule, 
    FormsModule,
    ElderlySidemenuComponent
  ]
})
export class HomePage implements OnInit {
  userName: string = 'User';
  currentDate: Date = new Date();
  
  // Quick stats (you can fetch these from your database)
  stats = {
    upcomingAppointments: 2,
    activeCaregivers: 1,
    completedSessions: 15,
    averageRating: 4.8
  };

  // Quick actions
  quickActions = [
    {
      title: 'Book Care',
      icon: 'medical-outline',
      color: 'primary',
      route: '/elderly/book-care'
    },
    {
      title: 'My Caregivers',
      icon: 'people-outline',
      color: 'success',
      route: '/elderly/caregivers'
    },
    {
      title: 'Schedule',
      icon: 'calendar-outline',
      color: 'warning',
      route: '/elderly/schedule'
    },
    {
      title: 'Emergency',
      icon: 'call-outline',
      color: 'danger',
      action: 'emergency'
    }
  ];

  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private menuController = inject(MenuController);

  constructor() {
    addIcons({calendarOutline,peopleOutline,heartOutline,starOutline,checkmarkCircle,calendar,menuOutline,medicalOutline,callOutline});
  }

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        try {
          const userData = await this.firestoreService.getUserByUid(user.uid);
          if (userData && userData.fullName) {
            this.userName = userData.fullName.split(' ')[0]; // Get first name
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    });
  }

  async openMenu() {
    await this.menuController.open();
  }

  handleQuickAction(action: any) {
    if (action.action === 'emergency') {
      // Handle emergency action
      console.log('Emergency action triggered');
      // You can implement emergency call functionality here
    } else if (action.route) {
      // Navigate to the route
      console.log('Navigate to:', action.route);
      // Implement navigation when routes are available
    }
  }

  getGreeting(): string {
    const hour = this.currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }
}