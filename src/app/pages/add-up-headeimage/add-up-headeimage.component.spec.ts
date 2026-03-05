import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpHeadeimageComponent } from './add-up-headeimage.component';

describe('AddUpHeadeimageComponent', () => {
  let component: AddUpHeadeimageComponent;
  let fixture: ComponentFixture<AddUpHeadeimageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpHeadeimageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpHeadeimageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
