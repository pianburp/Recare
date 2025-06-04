import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookCarePage } from './book-care.page';

describe('BookCarePage', () => {
  let component: BookCarePage;
  let fixture: ComponentFixture<BookCarePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCarePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
