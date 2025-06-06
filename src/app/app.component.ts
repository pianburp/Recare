import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ElderlySidemenuComponent } from './components/elderly-sidemenu/elderly-sidemenu.component';
import { CaregiverSidemenuComponent } from './components/caregiver-sidemenu/caregiver-sidemenu.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { FirestoreService } from './services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp, 
    IonRouterOutlet, 
    ElderlySidemenuComponent,
    CaregiverSidemenuComponent,
    CommonModule
  ]
})
export class AppComponent implements OnInit {
  showElderlySidemenu = false;
  showCaregiverSidemenu = false;
  currentUserType: string | null = null;

  private router = inject(Router);
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);

  constructor() {}

  ngOnInit() {
    // Listen to route changes to determine when to show the sidemenu
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkSidemenuVisibility(event.url);
    });

    // Also check when user auth state changes
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        try {
          const userData = await this.firestoreService.getUserByUid(user.uid);
          if (userData && userData.userType) {
            this.currentUserType = userData.userType;
            this.checkSidemenuVisibility(this.router.url);
          } else {
            this.hideAllSidemenus();
          }
        } catch (error) {
          console.error('Error checking user type:', error);
          this.hideAllSidemenus();
        }
      } else {
        this.hideAllSidemenus();
      }
    });
  }

  private checkSidemenuVisibility(url: string) {
    // Hide all sidemenus first
    this.hideAllSidemenus();

    // Show appropriate sidemenu based on route and user type
    if (url.startsWith('/elderly') && this.currentUserType === 'elderly') {
      this.showElderlySidemenu = true;
    } else if (url.startsWith('/caregiver') && this.currentUserType === 'caregiver') {
      this.showCaregiverSidemenu = true;
    }
  }

  private hideAllSidemenus() {
    this.showElderlySidemenu = false;
    this.showCaregiverSidemenu = false;
  }
}