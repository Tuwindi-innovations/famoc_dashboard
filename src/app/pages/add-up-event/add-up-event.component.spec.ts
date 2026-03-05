import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpEventComponent } from './add-up-event.component';

describe('AddUpEventComponent', () => {
  let component: AddUpEventComponent;
  let fixture: ComponentFixture<AddUpEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpEventComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
