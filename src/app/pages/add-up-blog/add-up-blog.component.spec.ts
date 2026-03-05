import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpBlogComponent } from './add-up-blog.component';

describe('AddUpBlogComponent', () => {
  let component: AddUpBlogComponent;
  let fixture: ComponentFixture<AddUpBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpBlogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
