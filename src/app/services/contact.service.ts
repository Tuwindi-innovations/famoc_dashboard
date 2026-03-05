import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Contact } from "../models/Contact";

@Injectable({
  providedIn: "root",
})
export class ContactService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/contact`;

  bookContact(contact: Contact): Observable<boolean> {
    return this.http.post<boolean>(this.apiUrl, contact);
  }

  getAllContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

  getContactById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  deleteContact(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
