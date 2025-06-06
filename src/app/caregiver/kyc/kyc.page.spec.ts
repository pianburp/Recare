import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KycPage } from './kyc.page';

describe('KycPage', () => {
  let component: KycPage;
  let fixture: ComponentFixture<KycPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KycPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
