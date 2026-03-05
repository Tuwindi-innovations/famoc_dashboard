import { Component, inject, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Contact } from "src/app/models/Contact";
import { ContactService } from "src/app/services/contact.service";

@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
})
export class ContactComponent implements OnInit {
  private contactService = inject(ContactService);
  private toastr = inject(ToastrService);

  contacts: Contact[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts() {
    this.isLoading = true;
    this.contactService.getAllContacts().subscribe({
      next: (res) => {
        this.contacts = res;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error("Erreur de chargement");
        this.isLoading = false;
      },
    });
  }

  onDelete(id: string) {
    if (confirm("Supprimer ce message ?")) {
      this.contactService.deleteContact(id).subscribe(() => {
        this.contacts = this.contacts.filter((c) => c.id !== id);
        this.toastr.success("Message supprimé");
      });
    }
  }

  viewContact(contact: Contact) {
    alert(`Message de ${contact.firstName} :\n\n${contact.message}`);
  }
}
