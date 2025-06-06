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
  IonBadge,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline,
  medicalOutline,
  peopleOutline,
  calendarOutline,
  starOutline,
  walletOutline,
  callOutline, 
  checkmarkCircle, 
  calendar,
  timeOutline,
  statsChartOutline,
  notificationsOutline,
  alertCircleOutline,
  trendingUpOutline,
  cashOutline,
  heartOutline, chevronForwardOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';

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
    IonBadge,
    CommonModule, 
    FormsModule
  ]
})
export class HomePage implements OnInit {
  userName: string = 'Caregiver';
  currentDate: Date = new Date();
  
  // Professional stats for caregivers
  stats = {
    todayAppointments: 3,
    activeClients: 8,
    monthlyEarnings: 3250,
    currentRating: 4.8,
    completedSessions: 127,
    responseRate: 95
  };

  // Quick actions for caregivers
  quickActions = [
    {
      title: 'My Schedule',
      icon: 'calendar-outline',
      color: 'primary',
      route: '/caregiver/schedule',
      description: 'View today\'s appointments'
    },
    {
      title: 'Active Clients',
      icon: 'people-outline',
      color: 'success',
      route: '/caregiver/clients',
      description: 'Manage client relationships'
    },
    {
      title: 'Analytics Hub',
      icon: 'stats-chart-outline',
      color: 'secondary',
      route: '/caregiver/analytics',
      description: 'Earnings, reviews & insights'
    },
    {
      title: 'Emergency Support',
      icon: 'call-outline',
      color: 'danger',
      action: 'emergency',
      description: 'Contact support immediately'
    }
  ];

  // Today's schedule preview
  todaySchedule = [
    {
      time: '09:00 AM',
      client: 'Mrs. Chen',
      service: 'Personal Care',
      duration: '2 hours',
      status: 'confirmed'
    },
    {
      time: '02:00 PM',
      client: 'Mr. Ahmad',
      service: 'Companionship',
      duration: '3 hours',
      status: 'confirmed'
    },
    {
      time: '06:00 PM',
      client: 'Mrs. Lim',
      service: 'Medication Assistance',
      duration: '1 hour',
      status: 'pending'
    }
  ];

  // Recent activities
  recentActivities = [
    {
      type: 'session_completed',
      icon: 'checkmark-circle',
      color: 'success',
      title: 'Session completed with Mrs. Wong',
      time: '2 hours ago',
      details: 'Personal care session - 3 hours'
    },
    {
      type: 'payment_received',
      icon: 'cash-outline',
      color: 'success',
      title: 'Payment received',
      time: '4 hours ago',
      details: 'RM 180 for yesterday\'s sessions'
    },
    {
      type: 'new_client',
      icon: 'person-add-outline',
      color: 'primary',
      title: 'New client request',
      time: '6 hours ago',
      details: 'Mr. Tan - Companionship service'
    },
    {
      type: 'review_received',
      icon: 'star-outline',
      color: 'warning',
      title: '5-star review received',
      time: '1 day ago',
      details: 'From Mrs. Lee - "Excellent care!"'
    }
  ];

  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private menuController = inject(MenuController);
  private router = inject(Router);

  constructor() {
    addIcons({medicalOutline,calendarOutline,peopleOutline,walletOutline,trendingUpOutline,starOutline,chevronForwardOutline,notificationsOutline,statsChartOutline,heartOutline,checkmarkCircle,calendar,menuOutline,callOutline,timeOutline,alertCircleOutline,cashOutline});
  }

  ngOnInit() {
    this.loadUserData();
    this.loadDashboardData();
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

  async loadDashboardData() {
    // In a real app, you would fetch this data from your backend
    // For now, we're using mock data
    try {
      // You can implement API calls here to fetch real-time data
      // const statsData = await this.apiService.getCaregiverStats();
      // const scheduleData = await this.apiService.getTodaySchedule();
      // const activitiesData = await this.apiService.getRecentActivities();
      
      console.log('Dashboard data loaded');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  async openMenu() {
    await this.menuController.open();
  }

  handleQuickAction(action: any) {
    if (action.action === 'emergency') {
      // Handle emergency action
      console.log('Emergency support action triggered');
      // You can implement emergency support functionality here
      this.contactEmergencySupport();
    } else if (action.route) {
      // Navigate to the route
      this.router.navigate([action.route]);
    }
  }

  contactEmergencySupport() {
    // Implement emergency support contact
    // This could open a modal, make a call, or send an emergency notification
    console.log('Contacting emergency support...');
    // Example: Open phone dialer with support number
    // window.open('tel:+60123456789', '_system');
  }

  getGreeting(): string {
    const hour = this.currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  }

  viewFullSchedule() {
    this.router.navigate(['/caregiver/schedule']);
  }

  viewAllActivities() {
    this.router.navigate(['/caregiver/notifications']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/caregiver/analytics']);
  }

  formatCurrency(amount: number): string {
    return `RM ${amount.toLocaleString()}`;
  }
}