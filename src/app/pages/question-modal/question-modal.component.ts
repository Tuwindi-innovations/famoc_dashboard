import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-question-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./question-modal.component.html",
  styleUrls: ["./question-modal.component.scss"],
})
export class QuestionModalComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);

  @Input() quizId!: number;
  questionForm!: FormGroup;

  ngOnInit() {
    this.questionForm = this.fb.group({
      texte: ["", [Validators.required]],
      type: ["QCM", [Validators.required]],
      points: [1, [Validators.required, Validators.min(1)]],
      reponseOptions: this.fb.array([]), // Liste dynamique d'options
    });

    // On ajoute au moins deux options par défaut
    this.addOption();
    this.addOption();
  }

  get options() {
    return this.questionForm.get("reponseOptions") as FormArray;
  }

  addOption() {
    const optionForm = this.fb.group({
      texte: ["", Validators.required],
      estCorrecte: [false],
    });
    this.options.push(optionForm);
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  submit() {
    if (this.questionForm.valid) {
      this.activeModal.close(this.questionForm.value);
    }
  }
}
