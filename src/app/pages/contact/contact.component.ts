import { Component, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Contact } from '../../models/Contact';
import { ConfirmService } from '../../services/confirm.service';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private readonly contactService = inject(ContactService);
  private readonly confirmation = inject(ConfirmService);
  private readonly toast = inject(ToastrService);

  protected readonly contacts = signal<Contact[]>([]);
  protected readonly chargement = signal(true);
  protected readonly erreur = signal('');

  /** Message actuellement déplié dans la liste, ou `null`. */
  protected readonly messageOuvert = signal<string | null>(null);

  constructor() {
    this.charger();
  }

  protected charger(): void {
    this.chargement.set(true);
    this.erreur.set('');

    this.contactService.getAllContacts().subscribe({
      next: (contacts) => {
        this.contacts.set(contacts);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Les messages n'ont pas pu être chargés.");
        this.chargement.set(false);
      },
    });
  }

  protected basculerMessage(id: string | undefined): void {
    if (!id) {
      return;
    }
    this.messageOuvert.update((ouvert) => (ouvert === id ? null : id));
  }

  protected async supprimer(contact: Contact): Promise<void> {
    if (!contact.id) {
      return;
    }

    const confirme = await this.confirmation.supprimer(
      `Message de ${contact.firstName} ${contact.lastName}`,
    );
    if (!confirme) {
      return;
    }

    this.contactService.deleteContact(contact.id).subscribe({
      next: () => {
        this.contacts.update((liste) => liste.filter((c) => c.id !== contact.id));
        this.toast.success('Message supprimé.');
      },
      error: () => this.toast.error("Le message n'a pas pu être supprimé."),
    });
  }

  protected initiales(contact: Contact): string {
    return `${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}`.toUpperCase();
  }
}
