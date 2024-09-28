// collection/Firebase.tsx
import { db } from '../firebase.config';
import { setDoc, doc, deleteDoc, updateDoc, getDocs, collection, query, getDoc, where } from 'firebase/firestore';
import { FirebaseUserProps } from '../Telas/Cadastro/types/User.type';

export class UserCollection {
    private userCollection = collection(db, 'user');

    async getUser(userId: string): Promise<any> {
        try {
            const docRef = doc(this.userCollection, userId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) return docSnapshot.data();
            return [];
        } catch (error) {
            console.error(`Error when getting user ${userId}: `, error);
        }
    }

    async createUser(user: FirebaseUserProps): Promise<void> {
        try {
            const docRef = doc(this.userCollection, user.id);
            await setDoc(docRef, user, { merge: true });
        } catch (error) {
            console.error('Error when creating user: ', error);
        }
    }

    async deleteUser(user: FirebaseUserProps): Promise<void> {
        try {
            const docRef = doc(this.userCollection, user.id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`Error when deleting user ${user.id}: `, error);
        }
    }

    async updateUser(user: FirebaseUserProps): Promise<void> {
        try {
            const docRef = doc(this.userCollection, user.id);
            await updateDoc(docRef, user);
        } catch (error) {
            console.error('Error when updating user: ', error);
        }
    }

    async verificarLogin(email: string, password: string): Promise<boolean> {
        try {
            const q = query(this.userCollection, where('paci_email', '==', email), where('paci_senha', '==', password));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Usuário encontrado
                return true;
            } else {
                // Usuário não encontrado
                return false;
            }
        } catch (error) {
            console.error('Error when verifying login: ', error);
            return false;
        }
    }
}
