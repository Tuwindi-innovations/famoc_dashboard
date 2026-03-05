import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-form-modal",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./form-modal.component.html",
  styleUrls: ["./form-modal.component.scss"],
})
export class FormModalComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Optionnel : On peut vider les champs URL si un fichier est choisi
      this.form.patchValue({ videoUrl: "", documentUrl: "" });
    }
  }

  @Input() title: string = "";
  @Input() type: "MODULE" | "COURS" | "QUIZ" = "MODULE";
  @Input() data: any = null;

  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      // Champs toujours présents
      titre: [this.data?.titre || "", [Validators.required]],
      ordre: [this.data?.ordre || 1],

      // Ces champs module
      description: [this.data?.description || ""],
      dureeEstimee: [this.data?.dureeEstimee || 1, [Validators.required]],

      // Champs cours
      typeContenu: [this.data?.typeContenu || "TEXTE"],
      contenu: [this.data?.contenu || ""],
      videoUrl: [this.data?.videoUrl || ""],
      documentUrl: [this.data?.documentUrl || ""],

      //Champs Quiz
      duree: [this.data?.duree || 10, [Validators.min(1)]],
      scoreMinimun: [this.data?.scoreMinimun || 50],
      nombreTentatives: [this.data?.nombreTentatives || 3],
    });
  }

  submit() {
    const values = this.form.value;
    const hasFile = !!this.selectedFile;

    if (values.typeContenu === "VIDEO" && !hasFile && !values.videoUrl) {
      alert("Veuillez fournir soit un fichier vidéo, soit un lien.");
      return;
    }

    if (
      ["PDF", "PRESENTATION"].includes(values.typeContenu) &&
      !hasFile &&
      !values.documentUrl
    ) {
      alert("Veuillez fournir soit un fichier document, soit un lien.");
      return;
    }

    if (this.form.valid) {
      this.activeModal.close({ ...values, fichier: this.selectedFile });
    }
  }
}
