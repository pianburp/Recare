import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    // TODO: Implement actual login logic here
    console.log('Login attempted with:', {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe
    });
  }
}
