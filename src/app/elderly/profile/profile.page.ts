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
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonCheckbox,
  IonAvatar,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonBadge,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, 
  personOutline, 
  callOutline, 
  mailOutline, 
  locationOutline,
  medicalOutline,
  heartOutline,
  shieldCheckmarkOutline,
  cameraOutline,
  createOutline,
  saveOutline,
  closeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  chatbubbleOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingController, ToastController, AlertController, ActionSheetController } from '@ionic/angular';

interface ElderlyProfile {
  // Personal Information
  uid?: string; // Add UID for Firestore document ID
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  userType: string; // Add userType to identify elderly users
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Health Information
  medicalConditions: string[];
  medications: string[];
  allergies: string[];
  mobility: string;
  cognitiveStatus: string;
  
  // Communication Preferences
  languagePreferences: string[];
  specialRequirements: string;
  
  // KYC Status
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  profilePicture: string;
  isProfileComplete: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonButton, IonButtons, 
    IonIcon, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonDatetime, IonCheckbox, IonAvatar, IonNote,
    IonGrid, IonRow, IonCol, IonChip, IonBadge,   
    CommonModule, FormsModule,
    IonMenuButton,IonTitle
  ]
})

export class ProfilePage implements OnInit {
  isLoading: boolean = false;
  isEditing: boolean = false;
  showKycForm: boolean = false;
  currentUser: any = null;
  
  profile: ElderlyProfile = {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    userType: 'elderly',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Malaysia',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalConditions: [],
    medications: [],
    allergies: [],
    mobility: '',
    cognitiveStatus: 'Independent',
    languagePreferences: [],
    specialRequirements: '',
    kycStatus: 'pending',
    profilePicture: '',
    isProfileComplete: false
  };

  // Form validation
  profileForm = {
    isValid: false,
    errors: {
      fullName: '',
      phoneNumber: '',
      address: '',
      emergencyContact: ''
    }
  };

  // Options for dropdowns
  genderOptions = ['Male', 'Female', 'Prefer not to say'];
  relationshipOptions = ['Spouse', 'Child', 'Sibling', 'Parent', 'Friend', 'Neighbour', 'Other'];
  mobilityOptions = ['Fully Mobile', 'Uses Walking Aid', 'Wheelchair User', 'Bedridden', 'Limited Mobility'];
  cognitiveOptions = ['Independent', 'Mild Cognitive Impairment', 'Moderate Cognitive Impairment', 'Severe Cognitive Impairment'];
  careTypeOptions = ['Companionship', 'Personal Care', 'Medical Care', 'Housekeeping', 'Meal Preparation', 'Transportation', 'Emergency Care'];
  timeOptions = ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-10PM)', 'Night (10PM-6AM)', 'Weekends Only', 'Weekdays Only'];
  languageOptions = ['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil', 'Cantonese', 'Hokkien', 'Other'];
  malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
  ];

  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private actionSheetController = inject(ActionSheetController);

  constructor() {
    addIcons({ 
      logOutOutline, personOutline, callOutline, mailOutline, locationOutline,
      medicalOutline, heartOutline, shieldCheckmarkOutline, cameraOutline,
      createOutline, saveOutline, closeOutline, checkmarkCircleOutline,
      alertCircleOutline, informationCircleOutline, chatbubbleOutline
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    try {
      // Get current user from auth
      this.authService.user$.subscribe(async (user) => {
        if (user) {
          this.currentUser = user;
          this.profile.email = user.email || '';
          this.profile.uid = user.uid;
  
          try {
            // Try to load profile from Firestore
            const userData = await this.firestoreService.getUserByUid(user.uid);
            
            if (userData) {
              // Profile exists in Firestore - cast to any to handle Firestore data
              const firestoreProfile = userData as any;
              
              this.profile = { 
                ...this.profile, 
                ...firestoreProfile,
                // Ensure arrays are properly initialized
                medicalConditions: firestoreProfile.medicalConditions || [],
                medications: firestoreProfile.medications || [],
                allergies: firestoreProfile.allergies || [],
                languagePreferences: firestoreProfile.languagePreferences || []
              };
            } else {
              // No profile in Firestore, check localStorage as fallback
              const savedProfile = localStorage.getItem(`elderlyProfile_${user.uid}`);
              if (savedProfile) {
                const localProfile = JSON.parse(savedProfile);
                this.profile = { ...this.profile, ...localProfile };
                console.log('Profile loaded from localStorage:', this.profile);
                
                // Save to Firestore for future use
                await this.saveToFirestore(false);
              } else {
                console.log('No existing profile found, using default profile');
              }
            }
            
            this.checkProfileCompletion();
          } catch (error) {
            console.error('Error loading profile from Firestore:', error);
            
            // Fallback to localStorage
            const savedProfile = localStorage.getItem(`elderlyProfile_${user.uid}`);
            if (savedProfile) {
              this.profile = { ...this.profile, ...JSON.parse(savedProfile) };
            }
            
            await this.showErrorToast('Could not load profile from server. Using local data.');
          }
        }
      });
    } catch (error) {
      console.error('Error in loadProfile:', error);
      await this.showErrorToast('Failed to load profile');
    }
  }

  checkProfileCompletion() {
    const requiredFields = [
      'fullName', 'dateOfBirth', 'phoneNumber', 'address', 'city', 'state',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'
    ];
    
    this.profile.isProfileComplete = requiredFields.every(field => 
      this.profile[field as keyof ElderlyProfile] && 
      (this.profile[field as keyof ElderlyProfile] as string).toString().trim().length > 0
    );
  }

  validateForm() {
    this.profileForm.errors = {
      fullName: this.profile.fullName.trim().length < 2 ? 'Full name must be at least 2 characters' : '',
      phoneNumber: this.isValidPhone(this.profile.phoneNumber) ? '' : 'Please enter a valid Malaysian phone number',
      address: this.profile.address.trim().length < 10 ? 'Please provide a complete address' : '',
      emergencyContact: !this.profile.emergencyContactName || !this.profile.emergencyContactPhone ? 'Emergency contact information is required' : ''
    };

    this.profileForm.isValid = Object.values(this.profileForm.errors).every(error => error === '');
  }

  isValidPhone(phone: string): boolean {
    // Malaysian phone number validation
    const phoneRegex = /^(\+?6?0)[0-9]{8,10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  async saveProfile() {
    this.validateForm();
    if (!this.profileForm.isValid) {
      await this.showErrorToast('Please correct the errors in the form');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saving profile...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.saveToFirestore(true);
      this.checkProfileCompletion();
      this.isEditing = false;
      await this.showSuccessToast('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      await this.showErrorToast('Failed to save profile. Please try again.');
    } finally {
      await loading.dismiss();
    }
  }

  private async saveToFirestore(showToast: boolean = false) {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    // Prepare profile data for Firestore
    const profileData = {
      ...this.profile,
      uid: this.currentUser.uid,
      updatedAt: new Date(),
      createdAt: this.profile.createdAt || new Date()
    };

    try {
      // Save to Firestore using the saveUserProfile method
      await this.firestoreService.saveUserProfile(this.currentUser.uid, profileData);
      
      // Also save to localStorage as backup
      localStorage.setItem(`elderlyProfile_${this.currentUser.uid}`, JSON.stringify(profileData));
      
      console.log('Profile saved to Firestore successfully');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      
      // Save to localStorage as fallback
      localStorage.setItem(`elderlyProfile_${this.currentUser.uid}`, JSON.stringify(profileData));
      
      if (showToast) {
        await this.showErrorToast('Profile saved locally. Will sync when connection is restored.');
      }
      
      throw error;
    }
  }

  async submitKyc() {
    if (!this.profile.isProfileComplete) {
      await this.showErrorToast('Please complete all required profile information first');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Submit KYC Application',
      message: 'Are you sure you want to submit your KYC application? You won\'t be able to edit your profile after submission until the review is complete.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Submit',
          handler: async () => {
            await this.processKycSubmission();
          }
        }
      ]
    });

    await alert.present();
  }

  async processKycSubmission() {
    const loading = await this.loadingController.create({
      message: 'Submitting KYC application...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Update KYC status
      this.profile.kycStatus = 'submitted';
      this.profile.updatedAt = new Date();
      
      // Save to Firestore
      await this.saveToFirestore(false);
      
      await this.showSuccessToast('KYC application submitted successfully! We will review it within 24-48 hours.');
    } catch (error) {
      console.error('Error submitting KYC:', error);
      
      // Fallback to localStorage if Firestore fails
      if (this.currentUser) {
        localStorage.setItem(`elderlyProfile_${this.currentUser.uid}`, JSON.stringify(this.profile));
      }
      
      await this.showErrorToast('Failed to submit KYC application. Please try again.');
    } finally {
      await loading.dismiss();
    }
  }

  async selectProfilePicture() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Profile Picture',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.showInfoToast('Camera functionality would be implemented here');
          }
        },
        {
          text: 'Photo Library',
          icon: 'images-outline',
          handler: () => {
            this.showInfoToast('Photo library functionality would be implemented here');
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async addMedicalCondition() {
    const alert = await this.alertController.create({
      header: 'Add Medical Condition',
      inputs: [
        {
          name: 'condition',
          type: 'text',
          placeholder: 'Enter medical condition'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            if (data.condition && data.condition.trim()) {
              const condition = data.condition.trim();
              if (!this.profile.medicalConditions.includes(condition)) {
                this.profile.medicalConditions.push(condition);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async addMedication() {
    const alert = await this.alertController.create({
      header: 'Add Medication',
      inputs: [
        {
          name: 'medication',
          type: 'text',
          placeholder: 'Enter medication name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            if (data.medication && data.medication.trim()) {
              const medication = data.medication.trim();
              if (!this.profile.medications.includes(medication)) {
                this.profile.medications.push(medication);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async addAllergy() {
    const alert = await this.alertController.create({
      header: 'Add Allergy',
      inputs: [
        {
          name: 'allergy',
          type: 'text',
          placeholder: 'Enter allergy'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            if (data.allergy && data.allergy.trim()) {
              const allergy = data.allergy.trim();
              if (!this.profile.allergies.includes(allergy)) {
                this.profile.allergies.push(allergy);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  removeMedicalCondition(condition: string) {
    const index = this.profile.medicalConditions.indexOf(condition);
    if (index > -1) {
      this.profile.medicalConditions.splice(index, 1);
    }
  }

  removeMedication(medication: string) {
    const index = this.profile.medications.indexOf(medication);
    if (index > -1) {
      this.profile.medications.splice(index, 1);
    }
  }

  removeAllergy(allergy: string) {
    const index = this.profile.allergies.indexOf(allergy);
    if (index > -1) {
      this.profile.allergies.splice(index, 1);
    }
  }

  toggleLanguage(language: string) {
    const index = this.profile.languagePreferences.indexOf(language);
    if (index > -1) {
      this.profile.languagePreferences.splice(index, 1);
    } else {
      this.profile.languagePreferences.push(language);
    }
  }

  getKycStatusColor(): string {
    switch (this.profile.kycStatus) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'submitted': return 'warning';
      default: return 'medium';
    }
  }

  getKycStatusText(): string {
    switch (this.profile.kycStatus) {
      case 'approved': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'submitted': return 'Under Review';
      default: return 'Pending';
    }
  }

  async logout() {
    const loading = await this.loadingController.create({
      message: 'Logging out...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.isLoading = true;
      await this.authService.signOut();
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
      duration: 3000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
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