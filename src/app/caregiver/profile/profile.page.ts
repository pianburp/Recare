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
  IonRange,
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
  chatbubbleOutline,
  schoolOutline,
  timeOutline,
  documentTextOutline,
  starOutline,
  cardOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingController, ToastController, AlertController, ActionSheetController } from '@ionic/angular';

interface CaregiverProfile {
  // Personal Information
  uid?: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  userType: string;
  
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
  
  // Professional Information
  licenseNumber: string;
  certifications: string[];
  education: string;
  yearsOfExperience: number;
  specializations: string[];
  
  // Service Information
  serviceTypes: string[];
  availableHours: string[];
  hourlyRate: number;
  travelRadius: number; // in kilometers
  
  // Health & Safety
  vaccinationStatus: string;
  backgroundCheck: boolean;
  backgroundCheckDate: string;
  insurance: boolean;
  insuranceProvider: string;
  
  // Communication Preferences
  languagePreferences: string[];
  preferredCommunication: string[];
  specialRequirements: string;
  
  // Bio & References
  bio: string;
  references: Reference[];
  
  // KYC Status
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  profilePicture: string;
  isProfileComplete: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

interface Reference {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
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
    IonDatetime, IonCheckbox, IonAvatar, IonNote, IonRange,
    IonGrid, IonRow, IonCol, IonChip, IonBadge,   
    CommonModule, FormsModule,
    IonMenuButton, IonTitle
  ]
})
export class ProfilePage implements OnInit {
  isLoading: boolean = false;
  isEditing: boolean = false;
  showKycForm: boolean = false;
  currentUser: any = null;
  
  profile: CaregiverProfile = {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    userType: 'caregiver',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Malaysia',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    licenseNumber: '',
    certifications: [],
    education: '',
    yearsOfExperience: 0,
    specializations: [],
    serviceTypes: [],
    availableHours: [],
    hourlyRate: 0,
    travelRadius: 10,
    vaccinationStatus: '',
    backgroundCheck: false,
    backgroundCheckDate: '',
    insurance: false,
    insuranceProvider: '',
    languagePreferences: [],
    preferredCommunication: [],
    specialRequirements: '',
    bio: '',
    references: [],
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
      emergencyContact: '',
      licenseNumber: '',
      hourlyRate: ''
    }
  };

  // Options for dropdowns
  genderOptions = ['Male', 'Female', 'Prefer not to say'];
  relationshipOptions = ['Spouse', 'Child', 'Sibling', 'Parent', 'Friend', 'Neighbour', 'Other'];
  educationOptions = [
    'High School Diploma',
    'Certificate in Healthcare',
    'Diploma in Nursing',
    'Bachelor in Nursing',
    'Bachelor in Healthcare',
    'Master in Healthcare',
    'Doctor of Medicine',
    'Other'
  ];
  specializationOptions = [
    'Elderly Care',
    'Dementia Care',
    'Palliative Care',
    'Post-Surgical Care',
    'Chronic Disease Management',
    'Mental Health Support',
    'Physical Therapy Assistance',
    'Medication Management',
    'Wound Care',
    'Companion Care'
  ];
  serviceTypeOptions = [
    'Personal Care',
    'Medical Care',
    'Companionship',
    'Housekeeping',
    'Meal Preparation',
    'Transportation',
    'Medication Assistance',
    'Physical Therapy Support',
    'Emergency Care',
    'Overnight Care'
  ];
  timeSlotOptions = [
    'Early Morning (6AM-9AM)',
    'Morning (9AM-12PM)',
    'Afternoon (12PM-3PM)',
    'Late Afternoon (3PM-6PM)',
    'Evening (6PM-9PM)',
    'Night (9PM-12AM)',
    'Overnight (12AM-6AM)',
    'Weekends',
    'Public Holidays'
  ];
  languageOptions = ['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil', 'Cantonese', 'Hokkien', 'Other'];
  communicationOptions = ['Phone Call', 'WhatsApp', 'Email', 'SMS', 'In-Person'];
  vaccinationOptions = ['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated', 'Prefer not to say'];
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
      alertCircleOutline, informationCircleOutline, chatbubbleOutline,
      schoolOutline, timeOutline, documentTextOutline, starOutline, cardOutline
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    try {
      this.authService.user$.subscribe(async (user) => {
        if (user) {
          this.currentUser = user;
          this.profile.email = user.email || '';
          this.profile.uid = user.uid;
  
          try {
            const userData = await this.firestoreService.getUserByUid(user.uid);
            
            if (userData) {
              const firestoreProfile = userData as any;
              
              this.profile = { 
                ...this.profile, 
                ...firestoreProfile,
                certifications: firestoreProfile.certifications || [],
                specializations: firestoreProfile.specializations || [],
                serviceTypes: firestoreProfile.serviceTypes || [],
                availableHours: firestoreProfile.availableHours || [],
                languagePreferences: firestoreProfile.languagePreferences || [],
                preferredCommunication: firestoreProfile.preferredCommunication || [],
                references: firestoreProfile.references || []
              };
            } else {
              const savedProfile = localStorage.getItem(`caregiverProfile_${user.uid}`);
              if (savedProfile) {
                const localProfile = JSON.parse(savedProfile);
                this.profile = { ...this.profile, ...localProfile };
                await this.saveToFirestore(false);
              }
            }
            
            this.checkProfileCompletion();
          } catch (error) {
            console.error('Error loading profile from Firestore:', error);
            
            const savedProfile = localStorage.getItem(`caregiverProfile_${user.uid}`);
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
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship',
      'licenseNumber', 'education', 'hourlyRate'
    ];
    
    this.profile.isProfileComplete = requiredFields.every(field => 
      this.profile[field as keyof CaregiverProfile] && 
      (this.profile[field as keyof CaregiverProfile] as string | number).toString().trim().length > 0
    ) && this.profile.serviceTypes.length > 0 && this.profile.availableHours.length > 0;
  }

  validateForm() {
    this.profileForm.errors = {
      fullName: this.profile.fullName.trim().length < 2 ? 'Full name must be at least 2 characters' : '',
      phoneNumber: this.isValidPhone(this.profile.phoneNumber) ? '' : 'Please enter a valid Malaysian phone number',
      address: this.profile.address.trim().length < 10 ? 'Please provide a complete address' : '',
      emergencyContact: !this.profile.emergencyContactName || !this.profile.emergencyContactPhone ? 'Emergency contact information is required' : '',
      licenseNumber: this.profile.licenseNumber.trim().length < 3 ? 'Please provide a valid license number' : '',
      hourlyRate: this.profile.hourlyRate <= 0 ? 'Please set a valid hourly rate' : ''
    };

    this.profileForm.isValid = Object.values(this.profileForm.errors).every(error => error === '');
  }

  isValidPhone(phone: string): boolean {
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

    const profileData = {
      ...this.profile,
      uid: this.currentUser.uid,
      updatedAt: new Date(),
      createdAt: this.profile.createdAt || new Date()
    };

    try {
      await this.firestoreService.saveUserProfile(this.currentUser.uid, profileData);
      localStorage.setItem(`caregiverProfile_${this.currentUser.uid}`, JSON.stringify(profileData));
      console.log('Profile saved to Firestore successfully');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      localStorage.setItem(`caregiverProfile_${this.currentUser.uid}`, JSON.stringify(profileData));
      
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
      this.profile.kycStatus = 'submitted';
      this.profile.updatedAt = new Date();
      
      await this.saveToFirestore(false);
      
      await this.showSuccessToast('KYC application submitted successfully! We will review it within 24-48 hours.');
    } catch (error) {
      console.error('Error submitting KYC:', error);
      
      if (this.currentUser) {
        localStorage.setItem(`caregiverProfile_${this.currentUser.uid}`, JSON.stringify(this.profile));
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

  async addCertification() {
    const alert = await this.alertController.create({
      header: 'Add Certification',
      inputs: [
        {
          name: 'certification',
          type: 'text',
          placeholder: 'Enter certification name'
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
            if (data.certification && data.certification.trim()) {
              const certification = data.certification.trim();
              if (!this.profile.certifications.includes(certification)) {
                this.profile.certifications.push(certification);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async addReference() {
    const alert = await this.alertController.create({
      header: 'Add Reference',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Reference name'
        },
        {
          name: 'relationship',
          type: 'text',
          placeholder: 'Relationship (e.g., Former employer)'
        },
        {
          name: 'phoneNumber',
          type: 'tel',
          placeholder: 'Phone number'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email (optional)'
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
            if (data.name && data.relationship && data.phoneNumber) {
              const reference: Reference = {
                name: data.name.trim(),
                relationship: data.relationship.trim(),
                phoneNumber: data.phoneNumber.trim(),
                email: data.email ? data.email.trim() : undefined
              };
              this.profile.references.push(reference);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  removeCertification(certification: string) {
    const index = this.profile.certifications.indexOf(certification);
    if (index > -1) {
      this.profile.certifications.splice(index, 1);
    }
  }

  removeSpecialization(specialization: string) {
    const index = this.profile.specializations.indexOf(specialization);
    if (index > -1) {
      this.profile.specializations.splice(index, 1);
    }
  }

  removeReference(reference: Reference) {
    const index = this.profile.references.indexOf(reference);
    if (index > -1) {
      this.profile.references.splice(index, 1);
    }
  }

  toggleSpecialization(specialization: string) {
    const index = this.profile.specializations.indexOf(specialization);
    if (index > -1) {
      this.profile.specializations.splice(index, 1);
    } else {
      this.profile.specializations.push(specialization);
    }
  }

  toggleServiceType(serviceType: string) {
    const index = this.profile.serviceTypes.indexOf(serviceType);
    if (index > -1) {
      this.profile.serviceTypes.splice(index, 1);
    } else {
      this.profile.serviceTypes.push(serviceType);
    }
  }

  toggleAvailableHour(hour: string) {
    const index = this.profile.availableHours.indexOf(hour);
    if (index > -1) {
      this.profile.availableHours.splice(index, 1);
    } else {
      this.profile.availableHours.push(hour);
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

  toggleCommunication(method: string) {
    const index = this.profile.preferredCommunication.indexOf(method);
    if (index > -1) {
      this.profile.preferredCommunication.splice(index, 1);
    } else {
      this.profile.preferredCommunication.push(method);
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