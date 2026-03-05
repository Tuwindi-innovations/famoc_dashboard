import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpCategorieComponent } from './add-up-categorie.component';

describe('AddUpCategorieComponent', () => {
  let component: AddUpCategorieComponent;
  let fixture: ComponentFixture<AddUpCategorieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpCategorieComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpCategorieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
