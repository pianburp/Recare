import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  IonItem,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonAvatar,
  IonBadge,
  IonNote,
  IonRange,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  MenuController,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline,
  medicalOutline,
  peopleOutline,
  calendarOutline,
  starOutline,
  heartOutline,
  callOutline,
  checkmarkCircle,
  calendar,
  timeOutline,
  locationOutline,
  walletOutline,
  arrowForwardOutline,
  arrowBackOutline,
  filterOutline,
  searchOutline,
  chatbubbleOutline,
  shieldCheckmarkOutline,
  diamondOutline,
  cashOutline,
  personOutline,
  restaurantOutline,
  carOutline,
  homeOutline,
  walkOutline,
  moonOutline,
  listOutline,
  calculatorOutline,
  cardOutline,
  flashOutline,
  informationCircleOutline,
  alertCircleOutline,
  star
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

interface Caregiver {
  id: string;
  fullName: string;
  profilePicture: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  specializations: string[];
  serviceTypes: string[];
  availableHours: string[];
  languagePreferences: string[];
  bio: string;
  isOnline: boolean;
  responseTime: string;
  completedSessions: number;
  travelRadius: number;
  location: string;
  isVerified: boolean;
}

interface BookingDetails {
  caregiverId: string;
  caregiverName: string;
  caregiverRate: number;
  selectedServices: string[];
  scheduleDate: string;
  startTime: string;
  duration: number;
  urgencyLevel: string;
  additionalNotes: string;
  specialRequirements: string[];
  estimatedCost: number;
  clientAddress: string;
  contactPhone: string;
  emergencyContact: string;
}

@Component({
  selector: 'app-book-care',
  templateUrl: './book-care.page.html',
  styleUrls: ['./book-care.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule, 
    IonMenuButton, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonChip, 
    IonLabel, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonAvatar,
    IonBadge,
    IonNote,
    IonRange,
    IonSegment,
    IonSegmentButton,
    IonSpinner
  ]
})
export class BookCarePage implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  isLoading = false;
  searchQuery = '';
  selectedFilters = {
    serviceType: '',
    priceRange: [0, 200],
    rating: 0,
    availability: 'all'
  };

  // Mock caregiver data - in real app, fetch from API
  availableCaregivers: Caregiver[] = [
    {
      id: '1',
      fullName: 'Sarah Johnson',
      profilePicture: '/assets/caregiver1.jpg',
      rating: 4.9,
      totalReviews: 127,
      hourlyRate: 65,
      specializations: ['Elderly Care', 'Dementia Care', 'Personal Care'],
      serviceTypes: ['Personal Care', 'Companionship', 'Medication Assistance'],
      availableHours: ['Morning (9AM-12PM)', 'Afternoon (12PM-3PM)'],
      languagePreferences: ['English', 'Bahasa Malaysia'],
      bio: 'Experienced caregiver with 8+ years in elderly care. Specialized in dementia and personal care.',
      isOnline: true,
      responseTime: '< 5 mins',
      completedSessions: 340,
      travelRadius: 15,
      location: 'Selangor',
      isVerified: true
    },
    {
      id: '2',
      fullName: 'Ahmad Rahman',
      profilePicture: '/assets/caregiver2.jpg',
      rating: 4.7,
      totalReviews: 89,
      hourlyRate: 55,
      specializations: ['Medical Care', 'Physical Therapy Support'],
      serviceTypes: ['Medical Care', 'Physical Therapy Support', 'Transportation'],
      availableHours: ['Morning (9AM-12PM)', 'Evening (6PM-9PM)'],
      languagePreferences: ['Bahasa Malaysia', 'English'],
      bio: 'Certified healthcare assistant with medical background. Focuses on post-surgery and chronic care.',
      isOnline: true,
      responseTime: '< 10 mins',
      completedSessions: 156,
      travelRadius: 20,
      location: 'Kuala Lumpur',
      isVerified: true
    },
    {
      id: '3',
      fullName: 'Li Wei Chen',
      profilePicture: '/assets/caregiver3.jpg',
      rating: 4.8,
      totalReviews: 203,
      hourlyRate: 70,
      specializations: ['Companionship', 'Meal Preparation', 'Housekeeping'],
      serviceTypes: ['Companionship', 'Meal Preparation', 'Housekeeping', 'Transportation'],
      availableHours: ['Afternoon (12PM-3PM)', 'Evening (6PM-9PM)'],
      languagePreferences: ['Mandarin', 'English', 'Bahasa Malaysia'],
      bio: 'Caring companion with excellent cooking skills. Specializes in emotional support and daily living assistance.',
      isOnline: false,
      responseTime: '< 30 mins',
      completedSessions: 278,
      travelRadius: 12,
      location: 'Petaling Jaya',
      isVerified: true
    }
  ];

  filteredCaregivers: Caregiver[] = [];
  selectedCaregiver: Caregiver | null = null;

  // Service options
  serviceOptions = [
    { id: 'personal-care', name: 'Personal Care', description: 'Bathing, dressing, grooming', icon: 'person-outline', rate: 1.0 },
    { id: 'companionship', name: 'Companionship', description: 'Social interaction, conversation', icon: 'heart-outline', rate: 0.8 },
    { id: 'meal-prep', name: 'Meal Preparation', description: 'Cooking, feeding assistance', icon: 'restaurant-outline', rate: 0.9 },
    { id: 'medication', name: 'Medication Reminder', description: 'Medication management', icon: 'medical-outline', rate: 1.1 },
    { id: 'transportation', name: 'Transportation', description: 'Medical appointments, errands', icon: 'car-outline', rate: 1.2 },
    { id: 'housekeeping', name: 'Light Housekeeping', description: 'Cleaning, laundry, organizing', icon: 'home-outline', rate: 0.7 },
    { id: 'walking', name: 'Walking/Exercise', description: 'Physical activity assistance', icon: 'walk-outline', rate: 0.9 },
    { id: 'overnight', name: 'Overnight Care', description: '24-hour supervision', icon: 'moon-outline', rate: 1.5 }
  ];

  urgencyOptions = [
    { value: 'standard', label: 'Standard (24+ hours)', multiplier: 1.0 },
    { value: 'urgent', label: 'Urgent (Same day)', multiplier: 1.3 },
    { value: 'emergency', label: 'Emergency (Within 2 hours)', multiplier: 1.8 }
  ];

  specialRequirementsOptions = [
    'Wheelchair accessible vehicle',
    'Pet-friendly caregiver',
    'Male caregiver preferred',
    'Female caregiver preferred',
    'Multilingual support',
    'Medical equipment knowledge',
    'Dementia care experience',
    'CPR certified'
  ];

  // Booking form data
  bookingDetails: BookingDetails = {
    caregiverId: '',
    caregiverName: '',
    caregiverRate: 0,
    selectedServices: [],
    scheduleDate: '',
    startTime: '',
    duration: 2,
    urgencyLevel: 'standard',
    additionalNotes: '',
    specialRequirements: [],
    estimatedCost: 0,
    clientAddress: '',
    contactPhone: '',
    emergencyContact: ''
  };

  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private menuController = inject(MenuController);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({
      menuOutline,
      medicalOutline,
      peopleOutline,
      calendarOutline,
      starOutline,
      heartOutline,
      callOutline,
      checkmarkCircle,
      calendar,
      timeOutline,
      locationOutline,
      walletOutline,
      arrowForwardOutline,
      arrowBackOutline,
      filterOutline,
      searchOutline,
      chatbubbleOutline,
      shieldCheckmarkOutline,
      diamondOutline,
      cashOutline,
      personOutline,
      restaurantOutline,
      carOutline,
      homeOutline,
      walkOutline,
      moonOutline,
      listOutline,
      calculatorOutline,
      cardOutline,
      flashOutline,
      informationCircleOutline,
      alertCircleOutline,
      star
    });
  }

  ngOnInit() {
    this.filteredCaregivers = [...this.availableCaregivers];
    this.loadUserProfile();
  }

  async loadUserProfile() {
    // Load user profile to pre-fill some booking details
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        try {
          const userData = await this.firestoreService.getUserByUid(user.uid);
          if (userData) {
            this.bookingDetails.clientAddress = userData.address || '';
            this.bookingDetails.contactPhone = userData.phoneNumber || '';
            this.bookingDetails.emergencyContact = userData.emergencyContactPhone || '';
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    });
  }

  // Step 1: Caregiver Selection
  filterCaregivers() {
    this.filteredCaregivers = this.availableCaregivers.filter(caregiver => {
      // Search filter
      const matchesSearch = !this.searchQuery || 
        caregiver.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        caregiver.specializations.some(spec => spec.toLowerCase().includes(this.searchQuery.toLowerCase()));

      // Service type filter
      const matchesService = !this.selectedFilters.serviceType || 
        caregiver.serviceTypes.includes(this.selectedFilters.serviceType);

      // Price range filter
      const matchesPrice = caregiver.hourlyRate >= this.selectedFilters.priceRange[0] && 
        caregiver.hourlyRate <= this.selectedFilters.priceRange[1];

      // Rating filter
      const matchesRating = caregiver.rating >= this.selectedFilters.rating;

      // Availability filter
      const matchesAvailability = this.selectedFilters.availability === 'all' || 
        (this.selectedFilters.availability === 'online' && caregiver.isOnline) ||
        (this.selectedFilters.availability === 'verified' && caregiver.isVerified);

      return matchesSearch && matchesService && matchesPrice && matchesRating && matchesAvailability;
    });
  }

  selectCaregiver(caregiver: Caregiver) {
    this.selectedCaregiver = caregiver;
    this.bookingDetails.caregiverId = caregiver.id;
    this.bookingDetails.caregiverName = caregiver.fullName;
    this.bookingDetails.caregiverRate = caregiver.hourlyRate;
    this.calculateEstimatedCost();
  }

  // Step 2: Service Details
  toggleService(serviceId: string) {
    const index = this.bookingDetails.selectedServices.indexOf(serviceId);
    if (index > -1) {
      this.bookingDetails.selectedServices.splice(index, 1);
    } else {
      this.bookingDetails.selectedServices.push(serviceId);
    }
    this.calculateEstimatedCost();
  }

  toggleSpecialRequirement(requirement: string) {
    const index = this.bookingDetails.specialRequirements.indexOf(requirement);
    if (index > -1) {
      this.bookingDetails.specialRequirements.splice(index, 1);
    } else {
      this.bookingDetails.specialRequirements.push(requirement);
    }
  }

  onDurationChange() {
    this.calculateEstimatedCost();
  }

  onUrgencyChange() {
    this.calculateEstimatedCost();
  }

  calculateEstimatedCost() {
    if (!this.selectedCaregiver || this.bookingDetails.selectedServices.length === 0) {
      this.bookingDetails.estimatedCost = 0;
      return;
    }

    let baseCost = this.bookingDetails.caregiverRate * this.bookingDetails.duration;
    
    // Apply service multipliers
    const serviceMultipliers = this.bookingDetails.selectedServices.map(serviceId => {
      const service = this.serviceOptions.find(s => s.id === serviceId);
      return service ? service.rate : 1.0;
    });
    
    const avgMultiplier = serviceMultipliers.reduce((sum, mult) => sum + mult, 0) / serviceMultipliers.length;
    baseCost *= avgMultiplier;

    // Apply urgency multiplier
    const urgencyOption = this.urgencyOptions.find(opt => opt.value === this.bookingDetails.urgencyLevel);
    if (urgencyOption) {
      baseCost *= urgencyOption.multiplier;
    }

    // Platform fee (10%)
    const platformFee = baseCost * 0.1;
    
    this.bookingDetails.estimatedCost = Math.round((baseCost + platformFee) * 100) / 100;
  }

  // Navigation
  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      } else {
        this.proceedToPayment();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        if (!this.selectedCaregiver) {
          this.showErrorToast('Please select a caregiver');
          return false;
        }
        break;
      case 2:
        if (this.bookingDetails.selectedServices.length === 0) {
          this.showErrorToast('Please select at least one service');
          return false;
        }
        if (!this.bookingDetails.scheduleDate) {
          this.showErrorToast('Please select a date');
          return false;
        }
        if (!this.bookingDetails.startTime) {
          this.showErrorToast('Please select a start time');
          return false;
        }
        break;
      case 3:
        if (!this.bookingDetails.clientAddress.trim()) {
          this.showErrorToast('Please provide your address');
          return false;
        }
        if (!this.bookingDetails.contactPhone.trim()) {
          this.showErrorToast('Please provide your contact phone');
          return false;
        }
        break;
    }
    return true;
  }

  async proceedToPayment() {
    const loading = await this.loadingController.create({
      message: 'Processing booking...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // In a real app, save booking details to database here
      console.log('Booking Details:', this.bookingDetails);
      
      await loading.dismiss();
      
      // Navigate to payment page with booking details
      this.router.navigate(['/elderly/payment'], {
        state: { bookingDetails: this.bookingDetails }
      });
      
    } catch (error) {
      console.error('Error processing booking:', error);
      await loading.dismiss();
      this.showErrorToast('Failed to process booking. Please try again.');
    }
  }

  getServiceName(serviceId: string): string {
    const service = this.serviceOptions.find(s => s.id === serviceId);
    return service ? service.name : serviceId;
  }

  formatCurrency(amount: number): string {
    return `RM ${amount.toFixed(2)}`;
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Select Caregiver';
      case 2: return 'Service Details';
      case 3: return 'Booking Summary';
      default: return 'Book Care';
    }
  }

  getUrgencyLabel(): string {
    const option = this.urgencyOptions.find(opt => opt.value === this.bookingDetails.urgencyLevel);
    return option ? option.label : '';
  }

  getUrgencyFeePercentage(): number {
    const option = this.urgencyOptions.find(opt => opt.value === this.bookingDetails.urgencyLevel);
    if (!option || option.multiplier === 1) return 0;
    return Math.round((option.multiplier - 1) * 100);
  }

  getMinDate(): string {
    return new Date().toISOString();
  }

  getSubtotal(): number {
    return this.bookingDetails.caregiverRate * this.bookingDetails.duration;
  }

  getUrgencyFee(): number {
    if (this.bookingDetails.urgencyLevel === 'standard') return 0;
    const option = this.urgencyOptions.find(opt => opt.value === this.bookingDetails.urgencyLevel);
    if (!option) return 0;
    const subtotal = this.getSubtotal();
    return subtotal * (option.multiplier - 1);
  }

  getPlatformFee(): number {
    return this.bookingDetails.estimatedCost * 0.1 / 1.1;
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
}