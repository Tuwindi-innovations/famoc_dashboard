import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpUserComponent } from './add-up-user.component';

describe('AddUpUserComponent', () => {
  let component: AddUpUserComponent;
  let fixture: ComponentFixture<AddUpUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
