import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  // Add document with auto-generated ID
  async addDocument(collectionName: string, data: any) {
    const colRef = collection(this.firestore, collectionName);
    return await addDoc(colRef, data);
  }

  // Add document with specific ID (useful for user profiles using UID)
  async addDocumentWithId(collectionName: string, documentId: string, data: any) {
    const docRef = doc(this.firestore, collectionName, documentId);
    return await setDoc(docRef, data);
  }

  // Get single document by ID
  async getDocument(collectionName: string, documentId: string) {
    const docRef = doc(this.firestore, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  }

  // Get collection
  getCollection(collectionName: string): Observable<any[]> {
    const colRef = collection(this.firestore, collectionName);
    return collectionData(colRef, { idField: 'id' });
  }

  // Get collection with query
  getCollectionWithQuery(
    collectionName: string, 
    field: string, 
    operator: any, 
    value: any
  ): Observable<any[]> {
    const colRef = collection(this.firestore, collectionName);
    const q = query(colRef, where(field, operator, value));
    return collectionData(q, { idField: 'id' });
  }

  // Get collection with multiple conditions and ordering
  getCollectionWithConditions(
    collectionName: string,
    conditions: { field: string; operator: any; value: any }[],
    orderField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Observable<any[]> {
    const colRef = collection(this.firestore, collectionName);
    let q = query(colRef);

    // Add where conditions
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });

    // Add ordering if specified
    if (orderField) {
      q = query(q, orderBy(orderField, orderDirection));
    }

    // Add limit if specified
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    return collectionData(q, { idField: 'id' });
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

  // Get user by UID (helper method for user management)
  async getUserByUid(uid: string) {
    return await this.getDocument('users', uid);
  }

  // Update user verification status (helper method)
  async updateUserVerificationStatus(uid: string, isVerified: boolean) {
    return await this.updateDocument('users', uid, { 
      isVerified: isVerified,
      updatedAt: new Date()
    });
  }

  // Get users by type (helper method)
  getUsersByType(userType: string): Observable<any[]> {
    return this.getCollectionWithQuery('users', 'userType', '==', userType);
  }
}