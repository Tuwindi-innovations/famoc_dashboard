import { Component, inject, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { map, catchError, of, forkJoin } from "rxjs";
import { HeadImage } from "src/app/models/HeadImage";
import { HeadImageService } from "src/app/services/head-image.service";

@Component({
  selector: "app-liste-headimage",
  templateUrl: "./liste-headimage.component.html",
  styleUrls: ["./liste-headimage.component.scss"],
})
export class ListeHeadimageComponent implements OnInit {
  private headService = inject(HeadImageService);
  private toastr = inject(ToastrService);

  headImages: HeadImage[] = [];
  form = { id: "", pageName: "", description: "" };
  selectedFile: File | null = null;
  fileName = "";
  isEdit = false;

  pagesToManage = [
    "Home",
    "Blog",
    "Contact",
    "Formation",
    "Ressource",
    "A_propos",
    "Event",
    "Logo",
    "About1",
    "About2",
    "About3",
    "Objectif1",
    "Objectif2",
    "Objectif3",
    "Galeri1",
    "Galeri2",
    "Galeri3",
    "Galeri4",
    "Galeri5",
    "Galeri6",
  ];

  ngOnInit() {
    this.loadAllHeadImages();
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileName = this.selectedFile?.name || "";
    }
  }

  onSubmit() {
    // console.log("Le bouton a été cliqué !"); // <--- AJOUTE CECI
    // console.log("Mode Edition :", this.isEdit);
    // console.log("Données du formulaire :", this.form);
    if (this.isEdit) {
      if (!this.form.id) {
        this.toastr.error("Erreur : ID de l'image introuvable.");
        return;
      }
      this.headService
        .updateHeadImage(
          this.form.id,
          this.form.description,
          this.selectedFile!
        )
        .subscribe({
          next: () => {
            this.toastr.success("Bannière mise à jour");
            this.resetForm();
            this.loadAllHeadImages();
          },
        });
    } else {
      if (!this.selectedFile) {
        this.toastr.warning(
          "Veuillez sélectionner une image avant d'enregistrer."
        );
        return;
      }
      this.headService
        .createHeadImage(
          this.form.pageName,
          this.form.description,
          this.selectedFile
        )
        .subscribe({
          next: () => {
            this.toastr.success("Bannière créée");
            // this.resetForm();
            this.loadAllHeadImages();
          },
          error: (err) => {
            console.error("ERREUR SERVEUR :", err);
            this.toastr.error(
              "Erreur : " +
                (err.error?.message || "Vérifiez votre connexion au serveur")
            );
          },
        });
    }
  }

  // prepareEdit(head: any) {
  //   this.isEdit = true;
  //   this.form = {
  //     id: head.id,
  //     pageName: head.pageName,
  //     description: head.description,
  //   };
  // }

  prepareEdit(head: HeadImage) {
    this.isEdit = true;
    this.form = {
      id: head.idHeadImage,
      pageName: head.pageName,
      description: head.description,
    };
    this.fileName = "";
    this.selectedFile = null;
  }

  onDelete(id: string) {
    if (confirm("Supprimer cette bannière ?")) {
      this.headService.deleteHeadImage(id).subscribe(() => {
        this.toastr.warning("Bannière supprimée");
        this.loadAllHeadImages();
      });
    }
  }

  resetForm() {
    this.isEdit = false;
    this.form = { id: "", pageName: "", description: "" };
    this.selectedFile = null;
    this.fileName = "";
  }

  loadAllHeadImages() {
    const requests = this.pagesToManage.map((page) =>
      this.headService.getHeadImageByPage(page).pipe(
        // Extraction de l'objet niché 'headImage' vu dans ta capture JSON
        map((response) =>
          response && response.headImage ? response.headImage : null
        ),
        // On capture l'erreur 404 pour que forkJoin ne s'arrête pas
        catchError(() => of(null))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        // On filtre les nulls (ceux qui ont fait 404 comme HOME, BLOG, etc.)
        // Seul 'Logo' restera dans la liste !
        this.headImages = results.filter((img) => img !== null);
        console.log("Images chargées :", this.headImages);
      },
    });
  }
}
