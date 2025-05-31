import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, RouterModule],
})
export class HomePage {
  constructor() {}

  // Optimized entrance animations with proper timing
  ngAfterViewInit() {
    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
      const container = document.getElementById('container');
      if (container) {
        container.classList.add('loaded');
        
        // Trigger staggered animations for child elements
        const animatedElements = container.querySelectorAll('.animate-fade-up');
        animatedElements.forEach((element, index) => {
          setTimeout(() => {
            element.classList.add('animate-in');
          }, index * 100); // 100ms stagger delay
        });
      }
    });
  }
}