import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ElderlySidemenuComponent } from './components/elderly-sidemenu/elderly-sidemenu.component';
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
    CommonModule
  ]
})
export class AppComponent implements OnInit {
  showElderlySidemenu = false;

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
          if (userData && userData.userType === 'elderly') {
            this.checkSidemenuVisibility(this.router.url);
          } else {
            this.showElderlySidemenu = false;
          }
        } catch (error) {
          console.error('Error checking user type:', error);
          this.showElderlySidemenu = false;
        }
      } else {
        this.showElderlySidemenu = false;
      }
    });
  }

  private checkSidemenuVisibility(url: string) {
    // Show sidemenu only for elderly routes
    this.showElderlySidemenu = url.startsWith('/elderly');
  }
}