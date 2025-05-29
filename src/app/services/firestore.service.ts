import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  // Add document
  async addDocument(collectionName: string, data: any) {
    const colRef = collection(this.firestore, collectionName);
    return await addDoc(colRef, data);
  }

  // Get collection
  getCollection(collectionName: string): Observable<any[]> {
    const colRef = collection(this.firestore, collectionName);
    return collectionData(colRef, { idField: 'id' });
  }

  // Update document
  async updateDocument(collectionName: string, id: string, data: any) {
    const docRef = doc(this.firestore, collectionName, id);
    return await updateDoc(docRef, data);
  }

  // Delete document
  async deleteDocument(collectionName: string, id: string) {
    const docRef = doc(this.firestore, collectionName, id);
    return await deleteDoc(docRef);
  }
}