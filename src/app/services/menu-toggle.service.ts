import { Injectable, inject } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuToggleService {
  private menuController = inject(MenuController);
  private isMenuOpenSubject = new BehaviorSubject<boolean>(false);
  
  public isMenuOpen$ = this.isMenuOpenSubject.asObservable();

  constructor() {
    // Listen to menu state changes
    this.menuController.isOpen().then(isOpen => {
      this.isMenuOpenSubject.next(isOpen);
    });
  }

  async toggleMenu() {
    const isOpen = await this.menuController.isOpen();
    if (isOpen) {
      await this.closeMenu();
    } else {
      await this.openMenu();
    }
  }

  async openMenu() {
    await this.menuController.open();
    this.isMenuOpenSubject.next(true);
  }

  async closeMenu() {
    await this.menuController.close();
    this.isMenuOpenSubject.next(false);
  }

  async enableMenu(enable: boolean = true) {
    await this.menuController.enable(enable);
  }

  async disableMenu() {
    await this.menuController.enable(false);
  }
}