import { Component } from '@angular/core';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonSplitPane
} from '@ionic/angular/standalone';
import { SideMenuComponent } from './components/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp, 
    IonRouterOutlet, 
    IonSplitPane,
    SideMenuComponent
  ],
})
export class AppComponent {
  constructor() {}
}